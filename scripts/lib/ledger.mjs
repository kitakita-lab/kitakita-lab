/**
 * 自律実行ハーネスの進捗台帳（PR 本文）と変更範囲の検査（docs/AUTOPILOT.md §4・§5）。
 *
 * 台帳は PR 本文の目印（LEDGER_START〜LEDGER_END）の内側にある「| 項目 | 値 |」の表。
 * ここには GitHub や git を呼ばない純粋な関数だけを置き、取得と書き込みは pr-gates.mjs が行う。
 *
 * - 台帳の照合: セッションが自分であること、head が期待する commit であることを、書き込む直前に確かめる。
 *   PR 本文の更新は条件付き更新にならないため、直前と直後の照合までしかできない（完全な排他ではない）。
 * - 変更範囲: commit 済みの差分（git diff --name-status -M -z）と、未 commit・未追跡の変更
 *   （git status --porcelain=v1 -uall -z）のすべてを、台帳の「許可ファイル」と照合する。
 *   リネームは元と新の両方のパスを照合する。
 */

export const LEDGER_START = '<!-- ai-ledger:start -->'
export const LEDGER_END = '<!-- ai-ledger:end -->'

/** 表の 1 行（| 項目 | 値 |）。見出し行と区切り行は除く */
const rowOf = (line) => {
  const m = line.match(/^\|\s*(.+?)\s*\|\s*(.*?)\s*\|\s*$/)
  if (!m || /^-+$/.test(m[1]) || m[1] === '項目') return null
  return { key: m[1], value: m[2] }
}

/**
 * 台帳を読む。目印がない・順序がおかしい・2 組以上あるときは null（推測で読まない）。
 * @returns {{ rows: Record<string,string>, keys: string[] } | null}
 */
export function parseLedger(body) {
  if (typeof body !== 'string') return null
  const s = body.indexOf(LEDGER_START)
  const e = body.indexOf(LEDGER_END)
  if (s < 0 || e < 0 || e < s) return null
  if (body.indexOf(LEDGER_START, s + 1) >= 0 || body.indexOf(LEDGER_END, e + 1) >= 0) return null
  const rows = {}
  const keys = []
  for (const line of body.slice(s + LEDGER_START.length, e).split('\n')) {
    const r = rowOf(line.trim())
    if (!r) continue
    if (!(r.key in rows)) keys.push(r.key)
    rows[r.key] = r.value
  }
  return { rows, keys }
}

/** 表のセルに入れられない文字（改行・縦棒）を除く */
const cell = (v) => String(v).replace(/[\r\n]+/g, ' ').replace(/\|/g, '／').trim()

/**
 * 台帳の行を書き換えた本文を返す。目印の外側は 1 文字も変えない。
 * 既にある項目はその行の値だけを、ない項目は表の末尾に行を足す。
 */
export function updateLedgerBody(body, updates) {
  if (!parseLedger(body)) throw new Error('台帳（ai-ledger の目印）が見つからない、または 2 組以上ある')
  const s = body.indexOf(LEDGER_START) + LEDGER_START.length
  const e = body.indexOf(LEDGER_END)
  const pending = new Map(Object.entries(updates).map(([k, v]) => [k, cell(v)]))
  const lines = body.slice(s, e).split('\n')
  let lastRow = -1
  const out = lines.map((line, i) => {
    const r = rowOf(line.trim())
    if (!r && !/^\|/.test(line.trim())) return line
    lastRow = i
    if (r && pending.has(r.key)) {
      const v = pending.get(r.key)
      pending.delete(r.key)
      return `| ${r.key} | ${v} |`
    }
    return line
  })
  if (pending.size > 0) {
    if (lastRow < 0) throw new Error('台帳に表がない')
    out.splice(lastRow + 1, 0, ...[...pending].map(([k, v]) => `| ${k} | ${v} |`))
  }
  return body.slice(0, s) + out.join('\n') + body.slice(e)
}

/**
 * 書き込む前の照合（§4 の 1）。
 * @param {{ ledger: ReturnType<typeof parseLedger>, session: string, actualHead: string, expectedHead?: string }} input
 * @returns {{ ok: boolean, reasons: string[] }}
 */
export function checkLedgerOwner({ ledger, session, actualHead, expectedHead }) {
  const reasons = []
  if (!ledger) return { ok: false, reasons: ['台帳が読めない（目印がない、または 2 組以上ある）'] }
  const owner = ledger.rows['セッション']
  if (!session) reasons.push('自分のセッションが指定されていない')
  else if (owner !== session) reasons.push(`台帳のセッションが自分ではない（${owner ?? 'なし'}）`)
  const head = (actualHead ?? '').toLowerCase()
  if (!/^[0-9a-f]{7,40}$/.test(head)) reasons.push('PR の head が取得できない')
  else {
    if (expectedHead && !head.startsWith(expectedHead.toLowerCase())) {
      reasons.push(`PR の head（${head.slice(0, 7)}）が期待する commit（${expectedHead}）と違う`)
    }
    const recorded = (ledger.rows['head'] ?? '').toLowerCase()
    if (!/^[0-9a-f]{7,40}$/.test(recorded)) reasons.push('台帳の head が読めない')
    else if (!head.startsWith(recorded) && !(expectedHead && head.startsWith(expectedHead.toLowerCase()))) {
      reasons.push(`台帳の head（${recorded}）が PR の head（${head.slice(0, 7)}）と違う`)
    }
  }
  return { ok: reasons.length === 0, reasons }
}

/** 台帳の「許可ファイル」（カンマ・読点・空白区切り）を配列にする */
export function parseAllowed(text) {
  return String(text ?? '')
    .split(/[,、\s]+/)
    .map((p) => p.trim().replace(/^`|`$/g, ''))
    .filter(Boolean)
}

/**
 * `git diff --name-status -M -z <base>...HEAD` の出力を読む。
 * 形式: 状態 NUL パス NUL（R・C は 状態 NUL 元 NUL 新 NUL）
 * @returns {{ status: string, paths: string[] }[]}
 */
export function parseNameStatusZ(text) {
  const parts = String(text ?? '').split('\0').filter((p) => p !== '')
  const out = []
  for (let i = 0; i < parts.length; ) {
    const status = parts[i++]
    const n = /^[RC]/.test(status) ? 2 : 1
    const paths = parts.slice(i, i + n)
    i += n
    if (paths.length < n) throw new Error(`git diff の出力を読めない: ${status}`)
    out.push({ status: status[0], paths })
  }
  return out
}

/**
 * `git status --porcelain=v1 -uall -z` の出力を読む。
 * 形式: XY SP パス NUL（リネーム・コピーは XY SP 新 NUL 元 NUL）。?? は未追跡。
 * @returns {{ status: string, paths: string[] }[]}
 */
export function parsePorcelainZ(text) {
  const parts = String(text ?? '').split('\0').filter((p) => p !== '')
  const out = []
  for (let i = 0; i < parts.length; ) {
    const entry = parts[i++]
    if (entry.length < 4 || entry[2] !== ' ') throw new Error(`git status の出力を読めない: ${entry}`)
    const xy = entry.slice(0, 2)
    const paths = [entry.slice(3)]
    if (/[RC]/.test(xy)) {
      if (i >= parts.length) throw new Error(`git status のリネームを読めない: ${entry}`)
      paths.push(parts[i++])
    }
    out.push({ status: xy === '??' ? '?' : xy.trim()[0] ?? xy[0], paths })
  }
  return out
}

/**
 * 変更範囲の検査（§5）。許可ファイル以外のパスが 1 つでもあれば ok=false。
 * @param {{ allowed: string[], committed: {status:string,paths:string[]}[], working: {status:string,paths:string[]}[] }} input
 */
export function checkScope({ allowed, committed, working }) {
  const allow = new Set(allowed)
  const changed = new Map()
  for (const [source, list] of [['commit 済み', committed], ['未 commit', working]]) {
    for (const { status, paths } of list) {
      for (const path of paths) {
        if (!changed.has(path)) changed.set(path, { path, status, source })
      }
    }
  }
  const violations = [...changed.values()].filter((c) => !allow.has(c.path))
  const reasons = []
  if (allow.size === 0) reasons.push('許可ファイルが台帳に書かれていない')
  for (const v of violations) reasons.push(`許可ファイルの外: ${v.path}（${v.source}・${v.status}）`)
  return { ok: reasons.length === 0, changed: [...changed.keys()].sort(), violations, reasons }
}
