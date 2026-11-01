/**
 * 共通ハーネスの展開（harness/README.md）。ファイルを書くだけで、git の操作・push・PR の作成はしない。
 *
 *   node scripts/harness-sync.mjs status <リポジトリのフォルダ> ...
 *     各リポジトリの AGENTS.md の管理ブロックが正本と同じか（最新 / 古い版 / 手で変更 / 未導入）と、
 *     CLAUDE.md が AGENTS.md を読み込んでいるかを表示する。
 *     すべて最新=0 / 手で変更・形の誤り=1 / 古い版・未導入・読み込みなし=2
 *   node scripts/harness-sync.mjs apply <リポジトリのフォルダ> ... [--add common,creative]
 *     導入済みのブロックを正本に更新し、--add のプロファイルを追加する。CLAUDE.md に @AGENTS.md がなければ足す。
 *     手で変更されたブロックがあるリポジトリは書き換えない（終了コード 1）。変更がなければ何も書かない。
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { join, basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { statusOf, planUpdate, ensureClaudeImport } from './lib/harness-sync.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const profilesDir = resolve(here, '..', 'harness', 'profiles')
const canonical = Object.fromEntries(
  readdirSync(profilesDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => [basename(f, '.md'), readFileSync(join(profilesDir, f), 'utf8')]),
)

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null)
const LABEL = { current: '最新', outdated: '古い版', modified: '手で変更', absent: '未導入', unknown: '正本にない' }

const [cmd, ...rest] = process.argv.slice(2)
const addIdx = rest.indexOf('--add')
const add = addIdx >= 0 ? (rest[addIdx + 1] ?? '').split(',').filter(Boolean) : []
const dirs = rest.filter((_, i) => addIdx < 0 || (i !== addIdx && i !== addIdx + 1))

if (!['status', 'apply'].includes(cmd) || dirs.length === 0) {
  console.error('使い方: node scripts/harness-sync.mjs status|apply <フォルダ> ... [--add common,creative]')
  process.exit(64)
}

let code = 0
const worse = (c) => {
  // 1（手で変更・誤り）を 2（古い・未導入）より優先する
  if (c === 1 || (c === 2 && code === 0)) code = c
}

for (const dir of dirs) {
  const agentsPath = join(dir, 'AGENTS.md')
  const claudePath = join(dir, 'CLAUDE.md')
  const agents = read(agentsPath)
  const claude = read(claudePath)
  const name = basename(resolve(dir))

  if (cmd === 'status') {
    const { profiles, errors } = statusOf(agents, canonical)
    const imported = claude != null && /^@AGENTS\.md\s*$/m.test(claude)
    const cells = Object.entries(profiles).map(([p, s]) => `${p}=${LABEL[s]}`)
    console.log(`${name}\t${cells.join('\t')}\tCLAUDE.md→AGENTS.md=${imported ? 'あり' : 'なし'}`)
    for (const e of errors) console.log(`  ✗ ${e}`)
    if (errors.length || Object.values(profiles).some((s) => s === 'modified' || s === 'unknown')) worse(1)
    else if (!imported || Object.values(profiles).includes('outdated')) worse(2)
    // absent は「そのリポジトリの対象外」もありうるため、common が未導入のときだけ数える
    else if (profiles.common === 'absent') worse(2)
    continue
  }

  const plan = planUpdate(agents, canonical, { add })
  if (plan.errors.length) {
    console.log(`${name}: 書き換えない`)
    for (const e of plan.errors) console.log(`  ✗ ${e}`)
    worse(1)
    continue
  }
  const imp = ensureClaudeImport(claude)
  if (plan.changed) writeFileSync(agentsPath, plan.text)
  if (imp.changed) writeFileSync(claudePath, imp.text)
  const summary = plan.changes.map((c) => `${c.name}:${c.action}`).join(' ') || '管理ブロックなし'
  console.log(`${name}: ${summary}${imp.changed ? ' CLAUDE.md:@AGENTS.md を追加' : ''}${plan.changed || imp.changed ? '' : '（変更なし）'}`)
}
process.exit(code)
