/**
 * PR のマージ・公開の判定（実績更新ハーネス。docs/EVENT-UPDATE.md 参照）。
 *
 *   node scripts/pr-gates.mjs codex <PR番号>
 *     Codex レビューの合否。PASS=0 / FAIL=1 / PENDING=2 で終了する。
 *   node scripts/pr-gates.mjs checks <PR番号>
 *     PR の head commit の CI（Quality Checks・Cloudflare Pages など）が全件成功か。PASS=0 / FAIL=1 / PENDING=2
 *   node scripts/pr-gates.mjs deploy <commit> [URL ...] [--expect <文字列>]
 *     main の commit が Cloudflare Pages に本番デプロイされ、公開 URL で反映を確認できたか。
 *     VERIFIED=0 / FAIL=1 / PENDING=2 / DEPLOYED_UNVERIFIED=3（デプロイ成功だが URL を確認できない）
 *
 * GitHub への通信は `gh api`（GitHub CLI、または Claude Code の gh）を使う。
 * 取得できなかった情報は合格扱いにしない。
 */
import { execFileSync } from 'node:child_process'
import { evaluateCodex } from './lib/codex-gate.mjs'
import { parseDeployArgs } from './lib/deploy-args.mjs'

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
  try {
    const q = `query{repository(owner:"${owner}",name:"${name}"){pullRequest(number:${Number(pr)}){reviewThreads(first:100){nodes{isResolved isOutdated}}}}}`
    const res = JSON.parse(execFileSync('gh', ['api', 'graphql', '-f', `query=${q}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }))
    return res.data.repository.pullRequest.reviewThreads.nodes.map((t) => ({ resolved: t.isResolved, outdated: t.isOutdated }))
  } catch {
    return null
  }
}

function codex(pr) {
  const p = gh(`repos/${repo}/pulls/${pr}`)
  const comments = ghAll(`repos/${repo}/issues/${pr}/comments`).map((c) => ({ login: c.user?.login, body: c.body, updatedAt: c.updated_at }))
  const reviews = ghAll(`repos/${repo}/pulls/${pr}/reviews`).map((r) => ({ login: r.user?.login, body: r.body }))
  const result = evaluateCodex({ headSha: p.head.sha, comments, reviews, threads: reviewThreads(pr) })
  return { pr: Number(pr), head: p.head.sha, state: p.state, draft: p.draft, ...result }
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

async function deploy(sha, urls, expect) {
  const runs = gh(`repos/${repo}/commits/${sha}/check-runs?per_page=100`).check_runs
  const cf = runs.find((r) => r.name === 'Cloudflare Pages')
  if (!cf || cf.status !== 'completed') return { verdict: 'PENDING', sha, reasons: ['Cloudflare Pages のデプロイが完了していない'] }
  const summary = cf.output?.summary ?? ''
  if (cf.conclusion !== 'success' || !/Deploy successful/.test(summary)) {
    return { verdict: 'FAIL', sha, reasons: [`Cloudflare Pages: ${cf.conclusion}`] }
  }
  const deployUrl = summary.match(/https:\/\/[a-z0-9-]+\.[a-z0-9-]+\.pages\.dev/)?.[0] ?? null
  const pages = []
  for (const url of urls) {
    try {
      const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) })
      const html = await res.text()
      pages.push({ url, status: res.status, ok: res.ok && (!expect || html.includes(expect)), expectFound: expect ? html.includes(expect) : null })
    } catch (e) {
      // Node の fetch は HTTPS_PROXY を見ないため、プロキシ環境では curl でも試す
      try {
        const out = execFileSync('curl', ['-sS', '-L', '--max-time', '15', '-w', '\n%{http_code}', url], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
        const status = Number(out.slice(out.lastIndexOf('\n') + 1))
        const html = out.slice(0, out.lastIndexOf('\n'))
        pages.push({ url, status, ok: status >= 200 && status < 300 && (!expect || html.includes(expect)), expectFound: expect ? html.includes(expect) : null })
      } catch (e2) {
        pages.push({ url, status: null, ok: null, error: `${String(e.cause?.code ?? e.message)} / curl: ${String(e2.stderr ?? e2.message).trim().slice(0, 120)}` })
      }
    }
  }
  if (pages.some((p) => p.ok === false)) return { verdict: 'FAIL', sha, deployUrl, pages, reasons: ['公開 URL の内容が期待と異なる'] }
  if (urls.length === 0 || pages.some((p) => p.ok === null)) {
    return { verdict: 'DEPLOYED_UNVERIFIED', sha, deployUrl, pages, reasons: ['デプロイは成功。公開 URL での反映は確認できていない'] }
  }
  return { verdict: 'VERIFIED', sha, deployUrl, pages, reasons: ['デプロイ成功・公開 URL で反映を確認'] }
}

const EXIT = { PASS: 0, VERIFIED: 0, FAIL: 1, PENDING: 2, DEPLOYED_UNVERIFIED: 3 }
const [cmd, arg, ...rest] = process.argv.slice(2)
let result
if (cmd === 'codex' && arg) result = codex(arg)
else if (cmd === 'checks' && arg) result = checks(arg)
else if (cmd === 'deploy' && arg) {
  const { urls, expect } = parseDeployArgs(rest)
  result = await deploy(arg, urls, expect)
} else {
  console.error('使い方: node scripts/pr-gates.mjs codex <PR> | checks <PR> | deploy <commit> [URL ...] [--expect 文字列]')
  process.exit(64)
}
console.log(JSON.stringify(result, null, 2))
process.exit(EXIT[result.verdict] ?? 1)
