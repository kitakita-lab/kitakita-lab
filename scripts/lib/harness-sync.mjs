/**
 * 共通ハーネス（harness/profiles/*.md）を、各リポジトリの AGENTS.md の管理ブロックへ反映する（harness/README.md）。
 * 純粋関数だけを置く（ファイルの読み書きと git は scripts/harness-sync.mjs と、それを動かす AI が行う）。
 *
 * 管理ブロックの形:
 *   <!-- BEGIN:kitakita-harness <名前> rev=<本文の SHA-256 の先頭 12 桁> -->
 *   <!-- 正本: ... 手で書き換えない -->
 *   <本文>
 *   <!-- END:kitakita-harness <名前> -->
 *
 * - rev は本文から計算する。正本と同じ rev なら「最新」、違えば「古い版」。
 * - ブロックの本文が自分の rev と合わなければ「手で変更」とみなし、上書きしない（固有の事情はブロックの外に書く）。
 * - 同じ入力に何度かけても結果は同じ（変更がなければ PR を作らない。無限更新を起こさない）。
 */
import { createHash } from 'node:crypto'

export const SOURCE = 'kitakita-lab/kitakita-lab harness/profiles'
const NAME = '[a-z][a-z0-9-]*'
const BEGIN_RE = new RegExp(`^<!-- BEGIN:kitakita-harness (${NAME}) rev=([0-9a-f]{12}) -->$`)
const END_RE = new RegExp(`^<!-- END:kitakita-harness (${NAME}) -->$`)
const NOTE_RE = /^<!-- 正本: .* -->$/

/** 改行を LF にそろえ、前後の空行を除き、末尾を改行 1 つにする */
export function normalize(text) {
  return text.replace(/\r\n?/g, '\n').replace(/^\n+/, '').replace(/\s+$/, '') + '\n'
}

export function revOf(body) {
  return createHash('sha256').update(normalize(body)).digest('hex').slice(0, 12)
}

export function renderBlock(name, body) {
  const b = normalize(body)
  return [
    `<!-- BEGIN:kitakita-harness ${name} rev=${revOf(b)} -->`,
    `<!-- 正本: ${SOURCE}/${name}.md。このブロックは手で書き換えない（正本を変えて npm run harness:sync で反映する） -->`,
    b.trimEnd(),
    `<!-- END:kitakita-harness ${name} -->`,
  ].join('\n')
}

/**
 * 文章の中の管理ブロックを読む。行番号は 0 始まり、end は END 行。
 * 形が壊れている（閉じていない・入れ子・重複）ときは errors に入れる。
 */
export function parseBlocks(text) {
  const lines = normalize(text).split('\n')
  const blocks = []
  const errors = []
  let open = null
  lines.forEach((line, i) => {
    const b = line.match(BEGIN_RE)
    const e = line.match(END_RE)
    if (b) {
      if (open) errors.push(`${open.name}: 閉じる前に ${b[1]} が始まっている`)
      open = { name: b[1], rev: b[2], start: i }
    } else if (e) {
      if (!open || open.name !== e[1]) {
        errors.push(`${e[1]}: 対応する BEGIN がない`)
        return
      }
      let from = open.start + 1
      if (NOTE_RE.test(lines[from] ?? '')) from++
      const body = lines.slice(from, i).join('\n')
      blocks.push({ ...open, end: i, body, actualRev: revOf(body) })
      open = null
    } else if (line.includes('kitakita-harness') && /^<!-- (BEGIN|END):/.test(line)) {
      errors.push(`${i + 1} 行目: 管理ブロックの目印の形が正しくない`)
    }
  })
  if (open) errors.push(`${open.name}: END がない`)
  const seen = new Set()
  for (const b of blocks) {
    if (seen.has(b.name)) errors.push(`${b.name}: 管理ブロックが 2 つある`)
    seen.add(b.name)
  }
  return { lines, blocks, errors }
}

/**
 * 各プロファイルの状態。
 *   current（最新）/ outdated（古い版）/ modified（手で変更・上書きしない）/ absent（未導入）/ unknown（正本にない名前）
 */
export function statusOf(agentsText, canonical) {
  const { blocks, errors } = parseBlocks(agentsText ?? '')
  const profiles = {}
  for (const name of Object.keys(canonical)) profiles[name] = 'absent'
  for (const b of blocks) {
    if (!(b.name in canonical)) profiles[b.name] = 'unknown'
    else if (b.actualRev !== b.rev) profiles[b.name] = 'modified'
    else if (b.rev === revOf(canonical[b.name])) profiles[b.name] = 'current'
    else profiles[b.name] = 'outdated'
  }
  return { profiles, errors }
}

/**
 * 導入済みのブロックを正本に更新し、add に挙げたプロファイルを追加する。
 * 手で変更されたブロック・形の壊れた文章・正本にない名前があれば、何も変えずに errors を返す（上書きしない）。
 */
export function planUpdate(agentsText, canonical, { add = [] } = {}) {
  const source = agentsText ?? ''
  const { lines, blocks, errors } = parseBlocks(source)
  const errs = [...errors]
  for (const name of add) if (!(name in canonical)) errs.push(`${name}: 正本にないプロファイル`)
  for (const b of blocks) {
    if (!(b.name in canonical)) errs.push(`${b.name}: 正本にないプロファイル（正本から消えたなら、人間の判断で外す）`)
    else if (b.actualRev !== b.rev) errs.push(`${b.name}: ブロックが手で変更されている（上書きしない。固有の事情はブロックの外へ移す）`)
  }
  if (errs.length) return { text: source, changes: [], errors: errs, changed: false }

  const changes = []
  const out = [...lines]
  // 後ろから置き換えると、前のブロックの行番号がずれない
  for (const b of [...blocks].sort((x, y) => y.start - x.start)) {
    const fresh = renderBlock(b.name, canonical[b.name])
    const same = b.rev === revOf(canonical[b.name])
    changes.unshift({ name: b.name, action: same ? 'unchanged' : 'updated' })
    if (!same) out.splice(b.start, b.end - b.start + 1, ...fresh.split('\n'))
  }
  const installed = new Set(blocks.map((b) => b.name))
  const toAdd = add.filter((n, i) => !installed.has(n) && add.indexOf(n) === i)
  let text = out.join('\n')
  if (toAdd.length) {
    const added = toAdd.map((n) => renderBlock(n, canonical[n])).join('\n\n')
    const last = blocks.length ? Math.max(...blocks.map((b) => b.end)) : -1
    if (last >= 0) {
      // 既存の管理ブロックの直後に足す（置き換えで行数が変わるため、もう一度読む）
      const re = parseBlocks(text)
      const end = Math.max(...re.blocks.map((b) => b.end))
      const ls = re.lines
      ls.splice(end + 1, 0, '', ...added.split('\n'))
      text = ls.join('\n')
    } else {
      text = text.trim() ? `${text.trimEnd()}\n\n${added}` : added
    }
    for (const n of toAdd) changes.push({ name: n, action: 'added' })
  }
  text = normalize(text)
  return { text, changes, errors: [], changed: changes.some((c) => c.action !== 'unchanged') }
}

/** Claude Code が AGENTS.md を読むように、CLAUDE.md に `@AGENTS.md` の読み込みを置く */
export function ensureClaudeImport(claudeText) {
  if (claudeText == null) return { text: '@AGENTS.md\n', changed: true }
  if (/^@AGENTS\.md\s*$/m.test(claudeText)) return { text: claudeText, changed: false }
  return { text: `@AGENTS.md\n\n${claudeText.replace(/^\n+/, '')}`, changed: true }
}

/**
 * リポジトリ固有のルールにある「Codex レビューの回数」の記述を探す（共通ルールとの衝突の検出）。
 * 共通ルール（harness/profiles/review.md）はリスク区分で上限を決めるが、固有ルールが優先するため、固有ルールに回数が書かれていれば
 * そちらが効く。展開の前に一覧にして、人間がどちらに合わせるかを決める（自動では書き換えない）。
 * 管理ブロックの中（共通ルールそのもの）は数えない。
 * @param {{ path: string, text: string | null }[]} files
 * @returns {{ path: string, line: number, text: string }[]}
 */
export function findReviewLimitRules(files) {
  const out = []
  const CAP = /(最大|上限)[^\n。]{0,12}\d+\s*回|\d+\s*回(まで|以内)|commit\s*\d+\s*つまで|"(reviewCap|maxReviewRounds)"\s*:\s*\d+|maxReviewRounds\s*:\s*\d+/
  const TOPIC = /codex|レビュー|review/i
  for (const f of files) {
    if (f.text == null) continue
    const { lines, blocks } = parseBlocks(f.text)
    const inBlock = (i) => blocks.some((b) => i >= b.start && i <= b.end)
    lines.forEach((line, i) => {
      if (inBlock(i)) return
      if (TOPIC.test(line) && CAP.test(line)) out.push({ path: f.path, line: i + 1, text: line.trim().slice(0, 160) })
    })
  }
  return out
}
