/**
 * 週次タスク棚卸し。手順は .claude/skills/inventory/SKILL.md。
 *
 *   node scripts/inventory.mjs <owner/repo> [...] [--notion ok|<未照合の理由>] [--json] [--now <ISO 8601>]
 *     指定したリポジトリの開いている PR・Issue を取得し、lib/inventory.mjs で分類した報告の下書きを標準出力に出す。
 *     GitHub への通信は `gh api` の GET だけ。完全=0 / 不完全（取得できなかったリポジトリがある・Notion 未照合）=1 / 使い方の誤り=2
 *     取得できなかったリポジトリは 0 件として扱わず、途中まで取得した分も含めない（部分的な結果を完全な一覧として出さない）。
 *
 *   node scripts/inventory.mjs record <owner/repo> <番号> hold --reason <理由> --recheck <YYYY-MM-DD|解除> --expect-latest <id|none> [--write]
 *   node scripts/inventory.mjs record <owner/repo> <番号> deadline --date <YYYY-MM-DD|解除> --basis <根拠> --expect-latest <id|none> [--write]
 *     人間の指示で、保留・期限の記録を PR・Issue のコメントとして追記する（既存の記録は書き換えない）。
 *     --write がなければ計画を出すだけ。同じ内容が最新にあれば書かない。--expect-latest が今の最新と違えば書かずに止める（競合）。
 *     書いた直後に取り直し、自分の記録が最新であることを確かめる。skip/書き込み成功=0 / 競合・確認の失敗=1 / 入力の誤り=2
 *
 * Claude Code のクラウド環境では、セッションに追加したリポジトリの API だけを使える（先に add_repo する）。
 */
import { execFileSync } from 'node:child_process'
import { buildInventory, jstDate, latestRecord, parseDeadline, parseHold, planRecord, renderReport, HOLD_MARK, DEADLINE_MARK } from './lib/inventory.mjs'

const REPO_RE = /^[\w.-]+\/[\w.-]+$/
const MAX_PAGES = 20
const args = process.argv.slice(2)
const opt = (name) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const usage = (msg) => {
  console.error(msg)
  console.error('使い方: node scripts/inventory.mjs <owner/repo> [...] [--notion ok|<理由>] [--json] [--now <ISO 8601>]')
  console.error('        node scripts/inventory.mjs record <owner/repo> <番号> hold|deadline ... --expect-latest <id|none> [--write]')
  process.exit(2)
}

const gh = (path, extra = []) =>
  JSON.parse(execFileSync('gh', ['api', ...extra, path], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }))
const ghAll = (path) => {
  const out = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const items = gh(`${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`)
    out.push(...items)
    if (items.length < 100) return out
  }
  throw new Error(`${path}: ${MAX_PAGES} ページを超えたため、取りこぼしの可能性がある`)
}
const errText = (e) => String(e.stderr ?? e.message).trim().split('\n')[0]

if (args[0] === 'record') {
  const [, repo, num, kind] = args
  if (!REPO_RE.test(repo ?? '') || !/^\d+$/.test(num ?? '') || !['hold', 'deadline'].includes(kind)) usage('record の引数が不正')
  const values = kind === 'hold' ? { reason: opt('--reason'), recheck: opt('--recheck') } : { date: opt('--date'), basis: opt('--basis') }
  const path = `repos/${repo}/issues/${num}/comments`
  const plan = planRecord(ghAll(path), kind, values, { expectLatest: opt('--expect-latest'), today: jstDate(new Date()) })
  if (plan.action === 'error') {
    console.log(JSON.stringify(plan, null, 2))
    process.exit(2)
  }
  if (plan.action !== 'write' || !args.includes('--write')) {
    console.log(JSON.stringify({ ...plan, written: false }, null, 2))
    process.exit(plan.action === 'conflict' ? 1 : 0)
  }
  const posted = gh(path, ['-X', 'POST', '-f', `body=${plan.body}`])
  const after = latestRecord(ghAll(path), kind === 'hold' ? HOLD_MARK : DEADLINE_MARK)
  const ok = String(after?.id) === String(posted.id)
  console.log(
    JSON.stringify(
      { action: 'write', written: true, commentId: posted.id, url: posted.html_url, verified: ok, reasons: ok ? [] : [`書き込み後の最新の記録が自分のものではない（${after?.id}）。別の記録と競合した可能性`] },
      null,
      2,
    ),
  )
  process.exit(ok ? 0 : 1)
}

const json = args.includes('--json')
const now = opt('--now') ? new Date(opt('--now')) : new Date()
const notion = opt('--notion') ?? '未照合（--notion が指定されていない）'
const repos = args.filter((a, i) => REPO_RE.test(a) && !['--now', '--notion'].includes(args[i - 1]))
if (repos.length === 0 || Number.isNaN(now.getTime())) usage('リポジトリの指定か --now が不正')

const items = []
const failed = []
for (const repo of repos) {
  const got = [] // リポジトリ単位で、全部取れたときだけ結果に入れる
  try {
    for (const it of ghAll(`repos/${repo}/issues?state=open`)) {
      const comments = it.comments > 0 ? ghAll(`repos/${repo}/issues/${it.number}/comments`) : []
      got.push({
        repo,
        kind: it.pull_request ? 'pr' : 'issue',
        number: it.number,
        title: it.title,
        body: it.body,
        draft: Boolean(it.draft),
        created_at: it.created_at,
        updated_at: it.updated_at,
        url: it.html_url,
        hold: parseHold(comments),
        deadline: parseDeadline({ body: it.body, comments, milestone: it.milestone }),
      })
    }
    items.push(...got)
  } catch (e) {
    failed.push(`${repo}（${errText(e)}）`)
  }
}

const inventory = buildInventory(items, now)
const complete = failed.length === 0 && notion === 'ok'
if (json) console.log(JSON.stringify({ now: now.toISOString(), complete, repos, failed, notion, inventory }, null, 2))
else process.stdout.write(renderReport(inventory, now, { repos, failed, notion }))
process.exit(complete ? 0 : 1)
