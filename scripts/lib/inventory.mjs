/**
 * 週次タスク棚卸しの判定（.claude/skills/inventory/SKILL.md）。GitHub も git も呼ばない純粋な関数だけを置く。
 *
 * 開いている PR・Issue を「要判断」「保留中」「終了候補」「不明」に分け、長期停止・今週の変化を付ける。
 * 判定は提案であり、クローズ・マージ・コメントは行わない（人間が決める）。
 */
import { parseLedger } from './ledger.mjs'

export const HOLD_MARK = '<!-- ai-hold -->'
export const CATEGORIES = ['要判断', '保留中', '終了候補', '不明']
export const STALE_DAYS = 14 // これ以上更新がなければ「長期停止」
export const ABANDON_DAYS = 30 // 理由不明のまま、これ以上更新がなければ「終了候補」
export const NO_MERGE_GRACE_DAYS = 7 // 「マージしない」と書かれた PR を終了候補にするまでの日数
export const WEEK_DAYS = 7

const DAY = 86_400_000
const toDate = (s) => (s ? new Date(s) : null)
const days = (from, to) => Math.floor((to.getTime() - from.getTime()) / DAY)
const dateOnly = (d) => d.toISOString().slice(0, 10)

/**
 * 保留の記録（人間の指示で AI が PR・Issue に書くコメント）を読む。最新のものを採る。形式:
 *
 *   <!-- ai-hold -->
 *   保留理由: 印刷担当の回答待ち
 *   再確認日: 2026-11-20
 *
 * 「再確認日」が読めないものは保留として扱わない（推測で補わない）。
 * comments: [{ body, created_at }]（GitHub の issue comments の形）
 */
export function parseHold(comments) {
  const marked = (comments ?? []).filter((c) => typeof c?.body === 'string' && c.body.includes(HOLD_MARK))
  if (marked.length === 0) return null
  const latest = [...marked].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at))).at(-1)
  // 空白は行の中だけで照合する（空欄のとき次の行を値として取り込まない）。空欄は null
  const field = (name) => latest.body.match(new RegExp(`^[ \\t]*${name}[ \\t]*[:：][ \\t]*(.*?)[ \\t]*$`, 'm'))?.[1] || null
  const reason = field('保留理由')
  const recheck = field('再確認日')
  const valid = Boolean(reason) && /^\d{4}-\d{2}-\d{2}$/.test(recheck ?? '')
  if (recheck === '解除') return { released: true, recordedAt: latest.created_at }
  return { reason, recheck, recordedAt: latest.created_at, valid }
}

/**
 * PR 本文から、同じリポジトリの Issue 番号への参照（Refs #12・Issue #12・github.com/<repo>/issues/12）を拾う。
 * URL は owner/repo が repo と一致するものだけ（別のリポジトリの Issue をまとめない）。repo がなければ URL は拾わない。
 */
export function linkedIssues(body, repo) {
  const out = new Set()
  const text = String(body ?? '')
  for (const m of text.matchAll(/(?:\b(?:Refs|Closes|Fixes|Resolves)\s+|Issue\s*)#(\d+)/gi)) out.add(Number(m[1]))
  for (const m of text.matchAll(/github\.com\/([\w.-]+\/[\w.-]+)\/issues\/(\d+)/gi)) {
    if (repo && m[1].toLowerCase() === repo.toLowerCase()) out.add(Number(m[2]))
  }
  return [...out]
}

// タイトルに書かれていれば強い印。本文は「AI はマージしない」のような一般的な記述と区別するため、強い言い方だけを見る
const NO_MERGE_TITLE = /マージしない|マージ禁止|レビュー用|実習用/
const NO_MERGE_BODY = /実習用\s*PR|この\s*PR\s*は(?:レビュー用|マージしない)/
const ASKS_HUMAN = /マージ前に(?:人間が)?判断|人間の判断待ち|承認待ち|判断待ち|最終承認/

/** 一致した箇所を含む行を、記号を除いて 60 字までにして返す（報告で理由を示すため） */
export function snippet(text, re) {
  const hit = String(text ?? '').split('\n').find((l) => re.test(l))
  if (!hit) return null
  const clean = hit.replace(/[#>*`|_-]+/g, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > 60 ? `${clean.slice(0, 60)}…` : clean
}

/**
 * 1 件を判定する。
 * item: { kind: 'pr'|'issue', title, body, draft?, created_at, updated_at, hold? }
 * now: Date
 * 返り値: { category, reasons[], idleDays, ageDays, isNew, changed, stale, recommend, hold }
 */
export function classifyItem(item, now) {
  const created = toDate(item.created_at)
  const updated = toDate(item.updated_at) ?? created
  const idleDays = updated ? days(updated, now) : null
  const ageDays = created ? days(created, now) : null
  const isNew = ageDays !== null && ageDays < WEEK_DAYS
  const changed = !isNew && idleDays !== null && idleDays < WEEK_DAYS
  const title = String(item.title ?? '')
  const body = String(item.body ?? '')
  const ledger = item.kind === 'pr' ? parseLedger(body) : null
  const hold = item.hold && !item.hold.released ? item.hold : null
  const reasons = []
  let category

  if (hold?.valid) {
    const recheck = new Date(`${hold.recheck}T00:00:00Z`)
    if (recheck.getTime() > now.getTime()) {
      category = '保留中'
      reasons.push(`保留理由: ${hold.reason}（再確認日 ${hold.recheck}・記録から ${days(new Date(hold.recordedAt), now)} 日）`)
    } else {
      category = '要判断'
      reasons.push(`保留の再確認日 ${hold.recheck} を過ぎた（保留理由: ${hold.reason}）`)
    }
  } else if (/\[TEST\]|テスト用|検証用/.test(title) || ((NO_MERGE_TITLE.test(title) || NO_MERGE_BODY.test(body)) && ageDays >= NO_MERGE_GRACE_DAYS)) {
    category = '終了候補'
    reasons.push(/\[TEST\]|テスト用|検証用/.test(title) ? 'テスト・検証用' : `「${snippet(title, NO_MERGE_TITLE) ?? snippet(body, NO_MERGE_BODY)}」と書かれ、作成から ${ageDays} 日たった`)
  } else if (ledger && /15\/15|停止/.test(ledger.rows['工程'] ?? '')) {
    category = '要判断'
    reasons.push(`台帳: ${ledger.rows['工程']}`)
  } else if (ASKS_HUMAN.test(body) || ASKS_HUMAN.test(title)) {
    category = '要判断'
    reasons.push(`判断待ちの記載: 「${snippet(title, ASKS_HUMAN) ?? snippet(body, ASKS_HUMAN)}」`)
  } else if (idleDays !== null && idleDays >= ABANDON_DAYS) {
    category = '終了候補'
    reasons.push(`停止理由の記載がないまま ${idleDays} 日更新なし`)
  } else {
    category = '不明'
    reasons.push('停止理由・判断待ちの記載が見つからない')
  }
  if (hold && !hold.valid) reasons.push('保留の記録があるが、保留理由か再確認日（YYYY-MM-DD）が読めない')

  const stale = category !== '保留中' && idleDays !== null && idleDays >= STALE_DAYS
  if (stale) reasons.push(`${idleDays} 日更新なし（長期停止）`)

  const recommend = {
    要判断: '続行（マージ等の判断）・保留（理由と再確認日を記録）・クローズのどれかを選ぶ',
    保留中: '再確認日まで判断不要',
    終了候補: 'クローズを推奨（実施は人間）。続けるなら保留理由を記録する',
    不明: '続行するか、保留理由と再確認日を記録する',
  }[category]

  return { category, reasons, idleDays, ageDays, isNew, changed, stale, recommend, hold }
}

/**
 * 全件を判定し、Issue を同じリポジトリで参照している開いた PR の下にまとめる。
 * items: [{ repo, kind, number, title, body, draft, created_at, updated_at, url, hold }]
 */
export function buildInventory(items, now) {
  const prLinks = new Map() // `${repo}#${issue}` -> PR 番号
  for (const it of items) {
    if (it.kind !== 'pr') continue
    for (const n of linkedIssues(it.body, it.repo)) prLinks.set(`${it.repo}#${n}`, it.number)
  }
  return items.map((it) => {
    const result = classifyItem(it, now)
    const pairedPr = it.kind === 'issue' ? prLinks.get(`${it.repo}#${it.number}`) ?? null : null
    return { ...it, ...result, pairedPr }
  })
}

const label = (it) => `${it.repo} ${it.kind === 'pr' ? 'PR' : 'Issue'} #${it.number}${it.draft ? '（Draft）' : ''}`
const line = (it) => `- [${label(it)}](${it.url}) ${it.title} — ${it.reasons.join('／')}。推奨: ${it.recommend}`

/** 人が読む報告の下書き（Markdown）。Notion との照合と「人間が今回判断すべき事項」の絞り込みは AI が書き足す */
export function renderReport(inventory, now) {
  const main = inventory.filter((it) => it.pairedPr === null)
  const by = (c) => main.filter((it) => it.category === c)
  const count = (c) => by(c).length
  const out = []
  out.push(`# 週次タスク棚卸し ${dateOnly(now)}`)
  out.push('')
  out.push(
    `開いている PR・Issue ${inventory.length} 件（PR に紐づく Issue ${inventory.length - main.length} 件はまとめた）: ` +
      CATEGORIES.map((c) => `${c} ${count(c)}`).join('・'),
  )
  const fresh = main.filter((it) => it.isNew)
  const changed = main.filter((it) => it.changed)
  const stale = main.filter((it) => it.stale)
  out.push('')
  out.push(`## 今週の変化`)
  out.push(`- 新しく発生: ${fresh.length ? fresh.map(label).join('、') : 'なし'}`)
  out.push(`- 先週から更新あり: ${changed.length ? changed.map(label).join('、') : 'なし'}`)
  out.push(`- 長期停止（${STALE_DAYS} 日以上）: ${stale.length ? stale.map(label).join('、') : 'なし'}`)
  for (const c of ['要判断', '不明', '終了候補', '保留中']) {
    out.push('')
    out.push(`## ${c}（${count(c)}）`)
    const list = by(c).sort((a, b) => (b.idleDays ?? 0) - (a.idleDays ?? 0))
    out.push(...(list.length ? list.map(line) : ['- なし']))
  }
  return out.join('\n') + '\n'
}
