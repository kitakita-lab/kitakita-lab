/**
 * 週次タスク棚卸し（読み取りだけ）。手順は .claude/skills/inventory/SKILL.md。
 *
 *   node scripts/inventory.mjs <owner/repo> [<owner/repo> ...] [--json] [--now <ISO 8601>]
 *
 * 指定したリポジトリの開いている PR・Issue を取得し、lib/inventory.mjs で分類した報告の下書きを標準出力に出す。
 * GitHub への通信は `gh api` の GET だけ（クローズ・コメント・ラベル変更などの書き込みはしない）。
 * Claude Code のクラウド環境では、セッションに追加したリポジトリの API だけを読める（先に add_repo する）。
 * 取得できなかったリポジトリは、件数 0 として扱わず、失敗として報告して終了コード 1 で終える。
 */
import { execFileSync } from 'node:child_process'
import { buildInventory, parseHold, renderReport } from './lib/inventory.mjs'

const args = process.argv.slice(2)
const json = args.includes('--json')
const nowIdx = args.indexOf('--now')
const now = nowIdx >= 0 ? new Date(args[nowIdx + 1]) : new Date()
const repos = args.filter((a, i) => /^[\w.-]+\/[\w.-]+$/.test(a) && args[i - 1] !== '--now')
if (repos.length === 0 || Number.isNaN(now.getTime())) {
  console.error('使い方: node scripts/inventory.mjs <owner/repo> [...] [--json] [--now <ISO 8601>]')
  process.exit(2)
}

const gh = (path) => JSON.parse(execFileSync('gh', ['api', path], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }))
const ghAll = (path) => {
  const out = []
  for (let page = 1; page < 20; page++) {
    const items = gh(`${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`)
    out.push(...items)
    if (items.length < 100) break
  }
  return out
}

const items = []
const failed = []
for (const repo of repos) {
  try {
    for (const it of ghAll(`repos/${repo}/issues?state=open`)) {
      const comments = it.comments > 0 ? ghAll(`repos/${repo}/issues/${it.number}/comments`) : []
      items.push({
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
      })
    }
  } catch (e) {
    failed.push(`${repo}: ${String(e.stderr ?? e.message).trim().split('\n')[0]}`)
  }
}

const inventory = buildInventory(items, now)
if (json) {
  console.log(JSON.stringify({ now: now.toISOString(), repos, failed, inventory }, null, 2))
} else {
  process.stdout.write(renderReport(inventory, now))
  if (failed.length) process.stdout.write(`\n## 取得できなかったリポジトリ\n${failed.map((f) => `- ${f}`).join('\n')}\n`)
}
process.exit(failed.length ? 1 : 0)
