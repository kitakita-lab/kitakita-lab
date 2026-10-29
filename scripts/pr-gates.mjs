/**
 * PR のマージ・公開の判定（実績更新ハーネス。docs/EVENT-UPDATE.md 参照）。
 *
 *   node scripts/pr-gates.mjs codex <PR番号>
 *     Codex レビューの合否。PASS=0 / FAIL=1 / PENDING=2 で終了する。
 *   node scripts/pr-gates.mjs codex-wait <PR番号> [--timeout <分>]
 *     レビューを依頼し、完了まで待つ（lib/codex-gate.mjs の planCodexReview）。依頼から 30 分たっても完了しなければ
 *     同じ commit に 1 回だけ再依頼し、それでも完了しなければ止める。終了時の合否は codex と同じ判定（PASS=0 / FAIL=1 / PENDING=2）。
 *     レビュー回数の上限（3 回）の後でも、head が最新 main の取り込みだけの merge commit なら、最終確認を 1 回だけ依頼する。
 *   node scripts/pr-gates.mjs checks <PR番号>
 *     PR の head commit の CI（Quality Checks・Cloudflare Pages など）が全件成功か。PASS=0 / FAIL=1 / PENDING=2
 *   node scripts/pr-gates.mjs deploy <commit> [URL ...] --expect <文字列> [--wait <秒>] [--interval <秒>]
 *     main の commit が Cloudflare Pages に本番デプロイされ、公開 URL で反映を確認できたか。
 *     デプロイ直後の 404 などの反映待ちは --wait 秒（既定 300）まで再試行する（lib/deploy-gate.mjs）。
 *     VERIFIED=0 / FAIL=1 / PENDING=2 / DEPLOYED_UNVERIFIED=3（デプロイ成功だが URL を確認できない）
 *
 * GitHub への通信は `gh api`（GitHub CLI、または Claude Code の gh）を使う。
 * 取得できなかった情報は合格扱いにしない。
 */
import { execFileSync } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { evaluateCodex, planCodexReview, codexRequestBody, CODEX_POLICY } from './lib/codex-gate.mjs'
import { parseDeployArgs } from './lib/deploy-args.mjs'
import { classifyPage, decideDeploy } from './lib/deploy-gate.mjs'

const repo =
  process.env.GH_REPO ??
  execFileSync('git', ['remote', 'get-url', 'origin'], { encoding: 'utf8' })
    .trim()
    .replace(/^.*github\.com[:/]/, '')
    .replace(/\.git$/, '')
    .replace(/^.*\/git\//, '') // ローカルプロキシ経由の remote（.../git/<owner>/<repo>）

const gh = (path, { allowFail = false } = {}) => {
  try {
    return JSON.parse(execFileSync('gh', ['api', path], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }))
  } catch (e) {
    if (allowFail) return null
    throw new Error(`gh api ${path} に失敗: ${String(e.stderr ?? e.message).trim()}`)
  }
}
const ghAll = (path) => {
  const out = []
  for (let page = 1; page < 20; page++) {
    const sep = path.includes('?') ? '&' : '?'
    const items = gh(`${path}${sep}per_page=100&page=${page}`)
    out.push(...items)
    if (items.length < 100) break
  }
  return out
}

/** レビュースレッド。Claude Code のプロキシの REST、なければ GraphQL。どちらも失敗なら null */
function reviewThreads(pr) {
  const ccr = gh(`repos/${repo}/pulls/${pr}/ccr/review_threads`, { allowFail: true })
  if (Array.isArray(ccr)) return ccr.map((t) => ({ resolved: Boolean(t.resolved), outdated: Boolean(t.outdated) }))
  const [owner, name] = repo.split('/')
  // GraphQL は 1 回 100 件まで。hasNextPage が続く限りたどり、途中で失敗したら null（合格扱いにしない）
  const threads = []
  let after = null
  try {
    for (let page = 0; page < 50; page++) {
      const q = `query($after:String){repository(owner:"${owner}",name:"${name}"){pullRequest(number:${Number(pr)}){reviewThreads(first:100,after:$after){nodes{isResolved isOutdated} pageInfo{hasNextPage endCursor}}}}}`
      const args = ['api', 'graphql', '-f', `query=${q}`]
      if (after) args.push('-f', `after=${after}`)
      const res = JSON.parse(execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }))
      const conn = res.data.repository.pullRequest.reviewThreads
      threads.push(...conn.nodes.map((t) => ({ resolved: t.isResolved, outdated: t.isOutdated })))
      if (!conn.pageInfo.hasNextPage) return threads
      after = conn.pageInfo.endCursor
    }
    return null // 上限まで続いた場合も全件を確認できていない
  } catch {
    return null
  }
}

/** 判定に使う PR の状態（head・コメント・レビュー・スレッド） */
function codexContext(pr) {
  const p = gh(`repos/${repo}/pulls/${pr}`)
  const comments = ghAll(`repos/${repo}/issues/${pr}/comments`).map((c) => ({ login: c.user?.login, body: c.body, createdAt: c.created_at, updatedAt: c.updated_at }))
  const reviews = ghAll(`repos/${repo}/pulls/${pr}/reviews`).map((r) => ({ login: r.user?.login, body: r.body }))
  return { p, comments, reviews, threads: reviewThreads(pr) }
}

function codex(pr) {
  const { p, comments, reviews, threads } = codexContext(pr)
  const result = evaluateCodex({ headSha: p.head.sha, comments, reviews, threads })
  return { pr: Number(pr), head: p.head.sha, state: p.state, draft: p.draft, ...result }
}

/**
 * head が「最新 main の取り込み（競合解消を含む）」だけの merge commit かを確かめる（統合の例外。lib/codex-gate.mjs）。
 *   1. 親が 2 つ（merge commit）
 *   2. 取り込んだ側（2 番目の親）が main の履歴にある
 *   3. merge で変わったファイル（1 番目の親 → head）が、main 側で変わったファイル（共通の祖先 → 2 番目の親）に含まれる
 *      （競合解消で main 側のファイルを直すのはよいが、それ以外のファイルの変更＝新しい実装や修正は含めない）
 * 取得できない情報は verified: false にする。
 */
function integrationCheck(headSha, base = 'main') {
  try {
    const commit = gh(`repos/${repo}/commits/${headSha}`)
    if (commit.parents?.length !== 2) return { verified: false, reason: 'head が merge commit ではない' }
    const [parent, merged] = commit.parents.map((x) => x.sha)
    const fromMain = gh(`repos/${repo}/compare/${merged}...${base}`)
    if (!['ahead', 'identical'].includes(fromMain.status)) return { verified: false, reason: `取り込んだ commit（${merged.slice(0, 7)}）が ${base} の履歴にない`, parent }
    const files = (path) => {
      const r = gh(`repos/${repo}/compare/${path}`)
      if ((r.files?.length ?? 0) >= 300) throw new Error('変更ファイルが多すぎて確認できない')
      return (r.files ?? []).map((f) => f.filename)
    }
    const changed = files(`${parent}...${headSha}`)
    const mainSide = new Set(files(`${parent}...${merged}`))
    const extra = changed.filter((f) => !mainSide.has(f))
    if (extra.length) return { verified: false, reason: `main 側で変わっていないファイルを変更している: ${extra.slice(0, 5).join(', ')}`, parent }
    return { verified: true, reason: `${base} の取り込み（${merged.slice(0, 7)}）だけの merge commit・変更 ${changed.length} ファイル`, parent }
  } catch (e) {
    return { verified: false, reason: `確認できない: ${e.message.slice(0, 120)}` }
  }
}

/** レビューの依頼と待機。合否は最後に codex() で判定する（ここでは合格にしない） */
async function codexWait(pr, { timeoutMinutes, pollSeconds = 30 }) {
  const started = Date.now()
  const log = []
  const integrations = new Map() // head ごとに 1 回だけ確かめる
  const plan = () => {
    const ctx = codexContext(pr)
    const head = ctx.p.head.sha
    const commit = gh(`repos/${repo}/commits/${head}`)
    const headCommittedAt = commit.commit?.committer?.date
    if (!integrations.has(head)) integrations.set(head, commit.parents?.length === 2 ? integrationCheck(head, ctx.p.base.ref) : null)
    return { head, ...planCodexReview({ headSha: head, headCommittedAt, now: new Date().toISOString(), integration: integrations.get(head), ...ctx }) }
  }
  let last
  let lastKey = ''
  for (;;) {
    last = plan()
    // 状態が変わったときだけ記録する（待機中の経過時間の更新は記録しない）
    const key = `${last.action} ${last.head} ${last.requestsOnHead}`
    if (key !== lastKey) {
      const entry = `${new Date().toISOString()} ${last.action} ${last.head.slice(0, 10)} 依頼${last.requestsOnHead}回 ${last.reasons.at(-1) ?? ''}`
      log.push(entry)
      console.error(entry)
      lastKey = key
    }
    if (last.action === 'request' || last.action === 'rerequest') {
      // 投稿の直前に取り直し、同じ判断のときだけ投稿する（手動の依頼や別の実行との重複を防ぐ）
      const again = plan()
      if (again.action === last.action && again.head === last.head && again.requestsOnHead === last.requestsOnHead) {
        const kind = last.action === 'request' ? (last.requestKind ?? 'initial') : 'rerequest'
        execFileSync('gh', ['api', '-X', 'POST', `repos/${repo}/issues/${pr}/comments`, '-f', `body=${codexRequestBody(last.head, kind)}`], { stdio: ['ignore', 'ignore', 'pipe'] })
        log.push(`${new Date().toISOString()} posted ${kind} ${last.head.slice(0, 10)}`)
      }
      await sleep(5000)
      continue
    }
    if (last.action === 'done' || last.action === 'stop') break
    if ((Date.now() - started) / 60000 >= timeoutMinutes) {
      log.push(`${new Date().toISOString()} timeout ${timeoutMinutes} 分`)
      break
    }
    await sleep(pollSeconds * 1000)
  }
  const final = codex(pr)
  return { ...final, stalled: last.action === 'stop' && final.verdict === 'PENDING', plan: { action: last.action, requestsOnHead: last.requestsOnHead, roundsUsed: last.roundsUsed, elapsedMinutes: last.elapsedMinutes, reasons: last.reasons }, integration: integrations.get(last.head) ?? null, log }
}

function checks(pr) {
  const p = gh(`repos/${repo}/pulls/${pr}`)
  const runs = gh(`repos/${repo}/commits/${p.head.sha}/check-runs?per_page=100`).check_runs
  const statuses = gh(`repos/${repo}/commits/${p.head.sha}/status`).statuses
  const list = [
    ...runs.map((r) => ({ name: r.name, done: r.status === 'completed', ok: r.conclusion === 'success' || r.conclusion === 'skipped' || r.conclusion === 'neutral' })),
    ...statuses.map((s) => ({ name: s.context, done: s.state !== 'pending', ok: s.state === 'success' })),
  ]
  const required = ['Quality Checks', 'Cloudflare Pages']
  const missing = required.filter((n) => !list.some((c) => c.name === n))
  const pending = list.filter((c) => !c.done).map((c) => c.name)
  const failed = list.filter((c) => c.done && !c.ok).map((c) => c.name)
  const verdict = failed.length ? 'FAIL' : missing.length || pending.length ? 'PENDING' : 'PASS'
  return { pr: Number(pr), head: p.head.sha, verdict, checks: list, missing, pending, failed, mergeable: p.mergeable, mergeableState: p.mergeable_state }
}

/** 公開 URL を 1 回取得する。Node の fetch（HTTPS_PROXY を見ない）が失敗したら curl で取得する */
async function fetchPage(url) {
  try {
    const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) })
    return { status: res.status, body: await res.text(), via: 'fetch' }
  } catch {
    try {
      const out = execFileSync('curl', ['-sS', '-L', '--max-time', '15', '-w', '\n%{http_code}', url], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
      return { status: Number(out.slice(out.lastIndexOf('\n') + 1)), body: out.slice(0, out.lastIndexOf('\n')), via: 'curl' }
    } catch (e) {
      return { error: { code: e.status ?? undefined, message: String(e.stderr ?? e.message) }, via: 'curl' }
    }
  }
}

/** commit の Cloudflare Pages チェック（pending / success / failure）と、その commit のデプロイ URL */
function cloudflareState(sha) {
  const runs = gh(`repos/${repo}/commits/${sha}/check-runs?per_page=100`).check_runs
  const cf = runs.find((r) => r.name === 'Cloudflare Pages')
  if (!cf || cf.status !== 'completed') return { deploy: 'pending', deployUrl: null }
  const summary = cf.output?.summary ?? ''
  const deployUrl = summary.match(/https:\/\/[a-z0-9-]+\.[a-z0-9-]+\.pages\.dev/)?.[0] ?? null
  return { deploy: cf.conclusion === 'success' && /Deploy successful/.test(summary) ? 'success' : 'failure', deployUrl, conclusion: cf.conclusion }
}

async function deploy(sha, urls, expect, { wait = 300, interval = 15 } = {}) {
  const started = Date.now()
  let attempts = 0
  for (;;) {
    attempts++
    const cf = cloudflareState(sha)
    const pages = []
    if (cf.deploy === 'success') {
      for (const url of urls) {
        const r = await fetchPage(url)
        pages.push({ url, status: r.status ?? null, via: r.via, ...classifyPage({ ...r, expect }) })
      }
    }
    const elapsedSeconds = Math.round((Date.now() - started) / 1000)
    const d = decideDeploy({ deploy: cf.deploy, pages, expectGiven: expect !== undefined, deadlineReached: elapsedSeconds >= wait })
    if (d.done) {
      // その commit のデプロイ URL でも同じ内容を照合する（参考。この環境から届かない場合もある）
      let deployment = null
      if (cf.deployUrl && expect !== undefined && urls[0]) {
        const r = await fetchPage(new URL(new URL(urls[0]).pathname, cf.deployUrl).href)
        deployment = { url: new URL(new URL(urls[0]).pathname, cf.deployUrl).href, status: r.status ?? null, ...classifyPage({ ...r, expect }) }
      }
      return { verdict: d.verdict, sha, deployUrl: cf.deployUrl, attempts, elapsedSeconds, pages, deployment, reasons: d.reasons }
    }
    await sleep(interval * 1000)
  }
}

const EXIT = { PASS: 0, VERIFIED: 0, FAIL: 1, PENDING: 2, DEPLOYED_UNVERIFIED: 3 }
const [cmd, arg, ...rest] = process.argv.slice(2)
let result
if (cmd === 'codex' && arg) result = codex(arg)
else if (cmd === 'codex-wait' && arg) {
  const i = rest.indexOf('--timeout')
  const timeoutMinutes = i >= 0 ? Number(rest[i + 1]) : CODEX_POLICY.stallMinutes * CODEX_POLICY.maxRequestsPerCommit + 5
  if (!Number.isFinite(timeoutMinutes) || timeoutMinutes <= 0) throw new Error('--timeout は分で指定する')
  result = await codexWait(arg, { timeoutMinutes })
} else if (cmd === 'checks' && arg) result = checks(arg)
else if (cmd === 'deploy' && arg) {
  const { urls, expect, wait, interval } = parseDeployArgs(rest)
  result = await deploy(arg, urls, expect, { wait, interval })
} else {
  console.error('使い方: node scripts/pr-gates.mjs codex <PR> | codex-wait <PR> [--timeout 分] | checks <PR> | deploy <commit> [URL ...] --expect 文字列 [--wait 秒] [--interval 秒]')
  process.exit(64)
}
console.log(JSON.stringify(result, null, 2))
process.exit(EXIT[result.verdict] ?? 1)
