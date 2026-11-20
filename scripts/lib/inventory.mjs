/**
 * 週次タスク棚卸しの判定（.claude/skills/inventory/SKILL.md）。GitHub も git も呼ばない純粋な関数だけを置く。
 *
 * 開いている PR・Issue を「要判断」「保留中」「終了候補」「不明」に分け、期限・長期停止・今週の変化を付ける。
 * 判定は提案であり、クローズ・マージは行わない（人間が決める）。
 * 優先順位は「期限」が第一。7／14／30 日の経過日数は補助の指標。期限は書かれたものだけを使い、推測で決めない。
 */
import { parseLedger } from './ledger.mjs'

export const HOLD_MARK = '<!-- ai-hold -->'
export const DEADLINE_MARK = '<!-- ai-deadline -->'
export const CATEGORIES = ['要判断', '保留中', '終了候補', '不明']
export const STALE_DAYS = 14 // これ以上更新がなければ「長期停止」
export const ABANDON_DAYS = 30 // 理由不明のまま、これ以上更新がなければ「終了候補」
export const NO_MERGE_GRACE_DAYS = 7 // 「マージしない」と書かれた PR を終了候補にするまでの日数
export const WEEK_DAYS = 7
export const DUE_SOON_DAYS = 7 // 期限まで、この日数以内なら「期限間近」（緊急）
export const MAX_DECISIONS = 5 // 判断事項の通常の上限。緊急の案件は上限を超えても省略しない

const DAY = 86_400_000
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
/** YYYY-MM-DD の形で、暦の上で実在する日付か（2026-13-01・2026-02-30 は不可） */
export const isValidDate = (s) => {
  if (!DATE_RE.test(s ?? '')) return false
  const t = Date.parse(`${s}T00:00:00Z`)
  return !Number.isNaN(t) && new Date(t).toISOString().slice(0, 10) === s
}
const toDate = (s) => (s ? new Date(s) : null)
const days = (from, to) => Math.floor((to.getTime() - from.getTime()) / DAY)
const dateOnly = (d) => d.toISOString().slice(0, 10)
/** 日本時間の日付（YYYY-MM-DD）。期限・再確認日は日本時間の日付で比べる */
export const jstDate = (d) => dateOnly(new Date(d.getTime() + 9 * 3_600_000))
const dateDiff = (a, b) => Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / DAY) // a - b（日）

/** 行の中だけで「名前: 値」を読む（空欄のとき次の行を値として取り込まない）。空欄は null */
const field = (body, name) =>
  String(body ?? '').match(new RegExp(`^[ \\t>*-]*${name}[ \\t]*[:：][ \\t]*(.*?)[ \\t]*$`, 'm'))?.[1] || null

/**
 * 印（mark）のあるコメントのうち、最新（作成日時）を返す。記録は追記だけで残す決まりなので、
 * 作成後に編集されたもの（updated_at が created_at と違う）は edited として知らせる。
 * comments: [{ id, body, created_at, updated_at }]（GitHub の issue comments の形）
 */
export function latestRecord(comments, mark) {
  const marked = (comments ?? []).filter((c) => typeof c?.body === 'string' && c.body.includes(mark))
  if (marked.length === 0) return null
  const sorted = [...marked].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))
  const latest = sorted.at(-1)
  return {
    id: latest.id ?? null,
    body: latest.body,
    recordedAt: latest.created_at,
    edited: Boolean(latest.updated_at && latest.created_at && latest.updated_at !== latest.created_at),
    count: marked.length,
  }
}

/**
 * 保留の記録（人間の指示で AI が PR・Issue に追記するコメント）を読む。形式:
 *
 *   <!-- ai-hold -->
 *   保留理由: 印刷担当の回答待ち
 *   再確認日: 2026-11-20
 *
 * 保留理由・再確認日（YYYY-MM-DD）のどちらかが読めないものは保留として扱わない。「再確認日: 解除」で解除。
 */
export function parseHold(comments) {
  const rec = latestRecord(comments, HOLD_MARK)
  if (!rec) return null
  const reason = field(rec.body, '保留理由')
  const recheck = field(rec.body, '再確認日')
  const base = { id: rec.id, recordedAt: rec.recordedAt, edited: rec.edited, count: rec.count }
  if (recheck === '解除') return { ...base, released: true }
  return { ...base, reason, recheck, valid: Boolean(reason) && isValidDate(recheck) }
}

/**
 * 期限を読む。書かれたものだけを使う（推測しない）。優先順:
 *   1. 期限の記録のコメント（<!-- ai-deadline --> と「期限: YYYY-MM-DD」。人間の指示で追記。「期限: 解除」で取り消し）
 *   2. 本文の「期限: YYYY-MM-DD」の行
 *   3. マイルストーンの期日（due_on）
 * 返り値: { date, source } / { invalid: true, source } / null（期限不明）
 */
export function parseDeadline({ body, comments, milestone } = {}) {
  const rec = latestRecord(comments, DEADLINE_MARK)
  if (rec) {
    const v = field(rec.body, '期限')
    if (v === '解除') return null
    return isValidDate(v) ? { date: v, source: '期限の記録', edited: rec.edited } : { invalid: true, source: '期限の記録' }
  }
  const fromBody = field(body, '期限')
  if (fromBody) return isValidDate(fromBody) ? { date: fromBody, source: '本文' } : { invalid: true, source: '本文' }
  if (milestone?.due_on) return { date: jstDate(new Date(milestone.due_on)), source: `マイルストーン「${milestone.title ?? ''}」` }
  return null
}

/** 期限の状態。overdue（超過）・soon（DUE_SOON_DAYS 日以内）・later・unknown（期限不明） */
export function deadlineStatus(deadline, now) {
  if (!isValidDate(deadline?.date)) return { state: 'unknown', daysLeft: null, urgent: false }
  const daysLeft = dateDiff(deadline.date, jstDate(now))
  const state = daysLeft < 0 ? 'overdue' : daysLeft <= DUE_SOON_DAYS ? 'soon' : 'later'
  return { state, daysLeft, urgent: state !== 'later' }
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
  const clean = hit.replace(/[#>*`|_]+/g, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > 60 ? `${clean.slice(0, 60)}…` : clean
}

const deadlineText = (deadline, st) => {
  if (deadline?.invalid) return `期限不明（${deadline.source}の期限が YYYY-MM-DD で読めない）`
  if (st.state === 'unknown') return '期限不明'
  if (st.state === 'overdue') return `期限超過 ${-st.daysLeft} 日（${deadline.date}・${deadline.source}）`
  return `期限 ${deadline.date}（あと ${st.daysLeft} 日・${deadline.source}）`
}

/**
 * 1 件を判定する。
 * item: { kind: 'pr'|'issue', title, body, draft?, created_at, updated_at, hold?, deadline? }
 * now: Date
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
  const deadline = item.deadline ?? null
  const due = deadlineStatus(deadline, now)
  const reasons = []
  let category

  if (hold?.valid && hold.recheck > jstDate(now) && !due.urgent) {
    category = '保留中'
    reasons.push(`保留理由: ${hold.reason}（再確認日 ${hold.recheck}・記録から ${days(new Date(hold.recordedAt), now)} 日）`)
  } else if (hold?.valid) {
    category = '要判断'
    reasons.push(
      hold.recheck > jstDate(now)
        ? `保留中だが期限が近い（保留理由: ${hold.reason}・再確認日 ${hold.recheck}）`
        : `保留の再確認日 ${hold.recheck} になった（保留理由: ${hold.reason}）`,
    )
  } else if (/\[TEST\]|テスト用|検証用/.test(title) || ((NO_MERGE_TITLE.test(title) || NO_MERGE_BODY.test(body)) && ageDays >= NO_MERGE_GRACE_DAYS)) {
    category = '終了候補'
    reasons.push(/\[TEST\]|テスト用|検証用/.test(title) ? 'テスト・検証用' : `「${snippet(title, NO_MERGE_TITLE) ?? snippet(body, NO_MERGE_BODY)}」と書かれ、作成から ${ageDays} 日たった`)
  } else if (ledger && /15\/15|停止/.test(ledger.rows['工程'] ?? '')) {
    category = '要判断'
    reasons.push(`台帳: ${ledger.rows['工程']}`)
  } else if (ASKS_HUMAN.test(body) || ASKS_HUMAN.test(title)) {
    category = '要判断'
    reasons.push(`判断待ちの記載: 「${snippet(title, ASKS_HUMAN) ?? snippet(body, ASKS_HUMAN)}」`)
  } else if (idleDays !== null && idleDays >= ABANDON_DAYS && !due.urgent) {
    category = '終了候補'
    reasons.push(`停止理由の記載がないまま ${idleDays} 日更新なし`)
  } else {
    category = '不明'
    reasons.push('停止理由・判断待ちの記載が見つからない')
  }
  if (hold && !hold.valid) reasons.push('保留の記録があるが、保留理由か再確認日（実在する YYYY-MM-DD）が読めない')
  if (item.hold?.edited) reasons.push('最新の保留の記録が作成後に編集されている（記録は追記で残す決まり）')
  if (deadline?.edited) reasons.push('最新の期限の記録が作成後に編集されている')

  const stale = category !== '保留中' && idleDays !== null && idleDays >= STALE_DAYS
  if (stale) reasons.push(`${idleDays} 日更新なし（長期停止）`)

  const recommend = {
    要判断: '続行（マージ等の判断）・保留（理由と再確認日を記録）・クローズのどれかを選ぶ',
    保留中: '再確認日まで判断不要',
    終了候補: 'クローズを推奨（実施は人間）。続けるなら保留理由を記録する',
    不明: '続行するか、保留理由と再確認日を記録する',
  }[category]

  return {
    category,
    reasons,
    idleDays,
    ageDays,
    isNew,
    changed,
    stale,
    recommend,
    hold,
    deadline,
    due: { ...due, text: deadlineText(deadline, due) },
  }
}

/**
 * 全件を判定し、Issue を同じリポジトリで参照している開いた PR の下にまとめる。
 * ただし次の Issue はまとめずに単独で表示する（PR の区分に隠れて判断事項から消えないようにする）:
 *   - 自分の保留・期限の記録（または本文の期限）を持つ
 *   - 自分は「要判断」なのに、まとめ先の PR が「要判断」でない（保留中・終了候補・不明）
 * items: [{ repo, kind, number, title, body, draft, created_at, updated_at, url, hold, deadline }]
 */
export function buildInventory(items, now) {
  const prLinks = new Map() // `${repo}#${issue}` -> PR 番号
  for (const it of items) {
    if (it.kind !== 'pr') continue
    for (const n of linkedIssues(it.body, it.repo)) prLinks.set(`${it.repo}#${n}`, it.number)
  }
  const classified = items.map((it) => ({ ...it, ...classifyItem(it, now) }))
  const prCategory = new Map(classified.filter((it) => it.kind === 'pr').map((it) => [`${it.repo}#${it.number}`, it.category]))
  return classified.map((it) => {
    const pr = it.kind === 'issue' ? prLinks.get(`${it.repo}#${it.number}`) ?? null : null
    const ownRecord = Boolean((it.hold && !it.hold.released) || it.deadline)
    const hidden = it.category === '要判断' && prCategory.get(`${it.repo}#${pr}`) !== '要判断'
    return { ...it, pairedPr: pr !== null && !ownRecord && !hidden ? pr : null }
  })
}

/** 並べる順: 期限超過（超過日数の多い順）→ 期限間近（近い順）→ 期限あり → 期限不明。同じなら更新のない日数が長い順 */
export function byPriority(a, b) {
  const rank = (it) => ({ overdue: 0, soon: 1, later: 2, unknown: 3 })[it.due.state]
  if (rank(a) !== rank(b)) return rank(a) - rank(b)
  if (a.due.daysLeft !== null && b.due.daysLeft !== null && a.due.daysLeft !== b.due.daysLeft) return a.due.daysLeft - b.due.daysLeft
  return (b.idleDays ?? 0) - (a.idleDays ?? 0)
}

/**
 * 今回人間が判断する事項を選ぶ。緊急（期限超過・期限間近）はすべて入れる（上限を超えても省略しない）。
 * 残りは MAX_DECISIONS 件まで、要判断 → 不明 → 終了候補の順に、期限・停止日数で並べて補う。保留中は入れない（緊急を除く）。
 */
export function selectDecisions(inventory) {
  const main = inventory.filter((it) => it.pairedPr === null)
  const urgent = main.filter((it) => it.due.urgent).sort(byPriority)
  const order = { 要判断: 0, 不明: 1, 終了候補: 2 }
  const rest = main
    .filter((it) => !it.due.urgent && it.category in order)
    .sort((a, b) => order[a.category] - order[b.category] || byPriority(a, b))
  const filled = rest.slice(0, Math.max(0, MAX_DECISIONS - urgent.length))
  return { urgent, others: filled, omitted: rest.length - filled.length }
}

const label = (it) => `${it.repo} ${it.kind === 'pr' ? 'PR' : 'Issue'} #${it.number}${it.draft ? '（Draft）' : ''}`
const line = (it) => `- [${label(it)}](${it.url}) ${it.title} — ${it.due.text}／${it.reasons.join('／')}。推奨: ${it.recommend}`

/**
 * 人が読む報告の下書き（Markdown）。
 * status: { repos: 対象のリポジトリ, failed: 取得できなかったもの（文字列）, notion: 'ok' または未照合の理由 }
 * 取得できなかったものがある・Notion を照合していないときは、冒頭で「不完全」と明示し、件数を「取得できた範囲」と書く。
 */
export function renderReport(inventory, now, status = {}) {
  const repos = status.repos ?? []
  const failed = status.failed ?? []
  const notion = status.notion ?? '未照合'
  const complete = failed.length === 0 && notion === 'ok'
  const main = inventory.filter((it) => it.pairedPr === null)
  const by = (c) => main.filter((it) => it.category === c)
  const count = (c) => by(c).length
  const out = []
  out.push(`# 週次タスク棚卸し ${jstDate(now)}${complete ? '' : '（不完全）'}`)
  out.push('')
  if (!complete) {
    const why = [
      ...(failed.length ? [`GitHub の取得に失敗 ${failed.length} 件`] : []),
      ...(notion !== 'ok' ? [`Notion ${notion}`] : []),
    ].join('・')
    out.push(`> ⚠ 不完全な棚卸し（${why}）。下の件数と一覧は取得できた範囲だけで、完全な一覧ではない。`)
    out.push('')
  }
  out.push(`- GitHub: ${repos.length - failed.length}/${repos.length} リポジトリを取得${failed.length ? `（失敗: ${failed.join('、')}）` : ''}`)
  out.push(`- Notion の照合: ${notion === 'ok' ? '照合済み' : notion}`)
  out.push(
    `- ${complete ? '' : '取得できた範囲で '}開いている PR・Issue ${inventory.length} 件（PR に紐づく Issue ${inventory.length - main.length} 件はまとめた）: ` +
      CATEGORIES.map((c) => `${c} ${count(c)}`).join('・'),
  )

  const { urgent, others, omitted } = selectDecisions(inventory)
  out.push('')
  out.push(`## 今回あなたが判断すること（緊急 ${urgent.length} 件はすべて表示・ほか ${others.length} 件${omitted ? `、残り ${omitted} 件は下の一覧` : ''}）`)
  const decisions = [...urgent, ...others]
  out.push(...(decisions.length ? decisions.map((it, i) => `${i + 1}. ${line(it).slice(2)}`) : ['- なし']))

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
    const list = by(c).sort(byPriority)
    out.push(...(list.length ? list.map(line) : ['- なし']))
  }
  return out.join('\n') + '\n'
}

/**
 * 記録（保留・期限）のコメントを追記するかを決める。既存の記録は書き換えず、追記だけで残す。
 * - 同じ内容がすでに最新なら skip（重複を作らない）
 * - expectLatest（指示を受けた時点の最新の記録の id。なければ 'none'）が今の最新と違えば conflict（別の記録が先に書かれた）
 * kind: 'hold' | 'deadline'、values: hold は { reason, recheck }（recheck は YYYY-MM-DD か「解除」）、deadline は { date, basis }
 */
export function planRecord(comments, kind, values, { expectLatest, today } = {}) {
  const mark = kind === 'hold' ? HOLD_MARK : DEADLINE_MARK
  const errors = []
  if (kind === 'hold') {
    if (values.recheck !== '解除') {
      if (!values.reason) errors.push('保留理由が空')
      if (!isValidDate(values.recheck)) errors.push('再確認日が実在する YYYY-MM-DD でない')
      else if (today && values.recheck <= today) errors.push('再確認日が今日以前')
    }
  } else if (kind === 'deadline') {
    if (values.date !== '解除') {
      if (!isValidDate(values.date)) errors.push('期限が実在する YYYY-MM-DD でない')
      if (!values.basis) errors.push('期限の根拠が空（推測で期限を書かない）')
    }
  } else errors.push(`種類が不明: ${kind}`)
  if (/\r|\n/.test(Object.values(values).join(''))) errors.push('値に改行を含めない')
  if (errors.length) return { action: 'error', reasons: errors }

  const latest = latestRecord(comments, mark)
  const latestId = latest?.id ?? 'none'
  if (expectLatest === undefined) return { action: 'error', reasons: ['--expect-latest が必要（指示を受けた時点の最新の記録の id、なければ none）'], latestId }
  if (String(expectLatest) !== String(latestId)) {
    return { action: 'conflict', reasons: [`最新の記録が指示の時点（${expectLatest}）から変わっている（現在 ${latestId}）`], latestId }
  }
  const lines =
    kind === 'hold'
      ? values.recheck === '解除'
        ? ['再確認日: 解除']
        : [`保留理由: ${values.reason}`, `再確認日: ${values.recheck}`]
      : values.date === '解除'
        ? ['期限: 解除']
        : [`期限: ${values.date}`, `根拠: ${values.basis}`]
  if (latest) {
    const same = lines.every((l) => {
      const [name, ...v] = l.split(': ')
      return field(latest.body, name) === v.join(': ')
    })
    if (same) return { action: 'skip', reasons: ['同じ内容の記録が最新にある'], latestId }
  }
  const body = [mark, ...lines, '（記録: 人間の指示により AI が追記。既存の記録は書き換えない）'].join('\n')
  return { action: 'write', reasons: [], latestId, body }
}
