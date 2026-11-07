import { describe, it, expect } from 'vitest'
import {
  HOLD_MARK,
  DEADLINE_MARK,
  MAX_DECISIONS,
  jstDate,
  latestRecord,
  parseHold,
  parseDeadline,
  deadlineStatus,
  linkedIssues,
  classifyItem,
  buildInventory,
  selectDecisions,
  renderReport,
  planRecord,
  snippet,
} from '../../scripts/lib/inventory.mjs'

/**
 * 週次タスク棚卸しの判定（scripts/lib/inventory.mjs）のテスト。
 * 公開リポジトリのため、リポジトリ名・案件名は架空のものを使う。
 * NOW は日本時間 2026-11-09 09:00。
 */
const NOW = new Date('2026-11-09T00:00:00Z')
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000).toISOString()
const base = { kind: 'pr' as const, title: '何かの変更', body: '', created_at: daysAgo(20), updated_at: daysAgo(10) }
const holdComment = (reason: string, recheck: string, at = daysAgo(5), id = 1) => ({
  id,
  body: `${HOLD_MARK}\n保留理由: ${reason}\n再確認日: ${recheck}`,
  created_at: at,
  updated_at: at,
})
const deadlineComment = (date: string, at = daysAgo(3), id = 50) => ({
  id,
  body: `${DEADLINE_MARK}\n期限: ${date}\n根拠: 人間の指示`,
  created_at: at,
  updated_at: at,
})
const due = (date: string) => ({ date, source: '本文' })

describe('jstDate', () => {
  it('日本時間の日付にする（UTC 15:00 は翌日）', () => {
    expect(jstDate(new Date('2026-11-08T15:00:00Z'))).toBe('2026-11-09')
    expect(jstDate(new Date('2026-11-08T14:59:00Z'))).toBe('2026-11-08')
  })
})

describe('latestRecord・parseHold', () => {
  it('印のあるコメントがなければ null', () => {
    expect(parseHold([{ body: 'ふつうのコメント', created_at: daysAgo(1) }])).toBeNull()
    expect(parseHold(null)).toBeNull()
  })
  it('最新の保留の記録を採り、件数と id を返す', () => {
    const h = parseHold([holdComment('古い理由', '2026-11-10', daysAgo(9), 1), holdComment('印刷担当の回答待ち', '2026-11-20', daysAgo(2), 2)])
    expect(h).toMatchObject({ id: 2, count: 2, reason: '印刷担当の回答待ち', recheck: '2026-11-20', valid: true, edited: false })
  })
  it('全角コロンも読める。再確認日が日付でなければ無効', () => {
    expect(parseHold([{ body: `${HOLD_MARK}\n保留理由：理由\n再確認日：来週`, created_at: daysAgo(1) }])).toMatchObject({ valid: false })
  })
  it('保留理由が空欄なら、次の行を理由として取り込まず無効にする', () => {
    expect(parseHold([{ body: `${HOLD_MARK}\n保留理由:\n再確認日: 2026-11-20`, created_at: daysAgo(1) }])).toMatchObject({ reason: null, valid: false })
  })
  it('再確認日が「解除」なら保留を解いたものとして扱う', () => {
    expect(parseHold([holdComment('理由', '2026-12-01', daysAgo(3), 1), { id: 2, body: `${HOLD_MARK}\n再確認日: 解除`, created_at: daysAgo(1) }])).toMatchObject({ released: true })
  })
  it('作成後に編集された記録は edited で知らせる', () => {
    const c = { ...holdComment('理由', '2026-12-01'), updated_at: daysAgo(1) }
    expect(latestRecord([c], HOLD_MARK)?.edited).toBe(true)
  })
})

describe('parseDeadline・deadlineStatus', () => {
  it('期限の記録 → 本文の「期限:」→ マイルストーンの順に使う', () => {
    const milestone = { due_on: '2026-11-20T07:00:00Z', title: 'ラソラ' }
    expect(parseDeadline({ body: '期限: 2026-11-12', comments: [deadlineComment('2026-11-11')], milestone })).toMatchObject({ date: '2026-11-11', source: '期限の記録' })
    expect(parseDeadline({ body: '- 期限: 2026-11-12', milestone })).toMatchObject({ date: '2026-11-12', source: '本文' })
    expect(parseDeadline({ body: '', milestone })).toMatchObject({ date: '2026-11-20' })
  })
  it('期限が書かれていなければ null（イベント日などから推測しない）', () => {
    expect(parseDeadline({ body: 'イベントは 11/13〜17 開催' })).toBeNull()
    expect(parseDeadline()).toBeNull()
  })
  it('読めない期限は invalid、「期限: 解除」は期限なし', () => {
    expect(parseDeadline({ body: '期限: 来週中' })).toMatchObject({ invalid: true })
    expect(parseDeadline({ body: '期限: 2026-11-12', comments: [{ id: 9, body: `${DEADLINE_MARK}\n期限: 解除`, created_at: daysAgo(1) }] })).toBeNull()
  })
  it('超過・7 日以内・それより先・不明を分ける（日本時間の日付で比べる）', () => {
    expect(deadlineStatus(due('2026-11-08'), NOW)).toMatchObject({ state: 'overdue', daysLeft: -1, urgent: true })
    expect(deadlineStatus(due('2026-11-09'), NOW)).toMatchObject({ state: 'soon', daysLeft: 0, urgent: true })
    expect(deadlineStatus(due('2026-11-16'), NOW)).toMatchObject({ state: 'soon', urgent: true })
    expect(deadlineStatus(due('2026-11-17'), NOW)).toMatchObject({ state: 'later', urgent: false })
    expect(deadlineStatus(null, NOW)).toMatchObject({ state: 'unknown', urgent: false })
  })
})

describe('linkedIssues・snippet', () => {
  it('Refs・Closes・Issue #・同じリポジトリの issues/ の URL を拾い、ただの #番号は拾わない', () => {
    expect(linkedIssues('Refs #12\nCloses #3\n[Issue #7](x)\nhttps://github.com/o/r/issues/9\nPR #5 の続き', 'o/r')).toEqual([12, 3, 7, 9])
    expect(linkedIssues(null)).toEqual([])
  })
  it('別のリポジトリの Issue の URL は拾わない', () => {
    expect(linkedIssues('https://github.com/o/other/issues/4', 'o/site')).toEqual([])
    expect(linkedIssues('https://github.com/O/Site/issues/4', 'o/site')).toEqual([4])
  })
  it('一致した行を記号を除いて返し、長い行は 60 字で切る', () => {
    expect(snippet('## マージ前に判断が必要なこと\n本文', /マージ前に判断/)).toBe('マージ前に判断が必要なこと')
    expect(snippet('あ'.repeat(70) + '判断待ち', /判断待ち/)?.endsWith('…')).toBe(true)
    expect(snippet('なし', /判断待ち/)).toBeNull()
  })
})

describe('classifyItem', () => {
  it('再確認日が先の保留は「保留中」で、長期停止の警告を出さない', () => {
    const r = classifyItem({ ...base, updated_at: daysAgo(40), hold: parseHold([holdComment('理由A', '2026-11-30')]) }, NOW)
    expect(r.category).toBe('保留中')
    expect(r.stale).toBe(false)
    expect(r.reasons[0]).toContain('再確認日 2026-11-30')
  })
  it('再確認日になった保留は「要判断」に戻る（当日を含む）', () => {
    expect(classifyItem({ ...base, hold: parseHold([holdComment('理由A', '2026-11-09')]) }, NOW).category).toBe('要判断')
    expect(classifyItem({ ...base, hold: parseHold([holdComment('理由A', '2026-11-08')]) }, NOW).reasons[0]).toContain('になった')
  })
  it('保留中でも期限が近ければ「要判断」に出す', () => {
    const r = classifyItem({ ...base, hold: parseHold([holdComment('理由A', '2026-11-30')]), deadline: due('2026-11-12') }, NOW)
    expect(r.category).toBe('要判断')
    expect(r.reasons[0]).toContain('期限が近い')
  })
  it('読めない・編集された保留の記録は、そのことを理由に書く', () => {
    const r = classifyItem({ ...base, hold: parseHold([{ body: `${HOLD_MARK}\n保留理由: 理由`, created_at: daysAgo(2), updated_at: daysAgo(1) }]) }, NOW)
    expect(r.category).not.toBe('保留中')
    expect(r.reasons.join()).toContain('読めない')
    expect(r.reasons.join()).toContain('編集されている')
  })
  it('タイトルの「マージしない」「実習」は作成から 7 日たてば「終了候補」。7 日未満は対象外', () => {
    expect(classifyItem({ ...base, title: '企画書 Version 1（マージしない・レビュー用）' }, NOW).category).toBe('終了候補')
    expect(classifyItem({ ...base, title: '【実習・マージ禁止】', created_at: daysAgo(3), updated_at: daysAgo(3) }, NOW).category).not.toBe('終了候補')
  })
  it('本文の一般的な「マージ禁止設定」では終了候補にしない', () => {
    expect(classifyItem({ ...base, body: '手順書・マージ禁止設定の上に検査を足す。' }, NOW).category).toBe('不明')
  })
  it('[TEST] の Issue は終了候補', () => {
    expect(classifyItem({ ...base, kind: 'issue', title: '[TEST] 引き継ぎ検証' }, NOW).category).toBe('終了候補')
  })
  it('台帳が 15/15 なら「要判断」', () => {
    const body = '<!-- ai-ledger:start -->\n| 項目 | 値 |\n|---|---|\n| 工程 | 15/15 最終承認待ちで停止（Draft のまま） |\n<!-- ai-ledger:end -->'
    const r = classifyItem({ ...base, body }, NOW)
    expect(r.category).toBe('要判断')
    expect(r.reasons[0]).toContain('15/15')
  })
  it('判断待ちの記載があれば「要判断」で、該当する行を理由に示す', () => {
    const r = classifyItem({ ...base, body: '## マージ前に判断が必要なこと\n- 待ち時間' }, NOW)
    expect(r.category).toBe('要判断')
    expect(r.reasons[0]).toContain('マージ前に判断が必要なこと')
  })
  it('記載がなく 30 日以上更新がなければ「終了候補」。期限が近ければ終了候補にしない', () => {
    const old = { ...base, created_at: daysAgo(60), updated_at: daysAgo(31) }
    expect(classifyItem(old, NOW).category).toBe('終了候補')
    expect(classifyItem({ ...old, deadline: due('2026-11-10') }, NOW).category).toBe('不明')
    expect(classifyItem(base, NOW).category).toBe('不明')
  })
  it('14 日以上の更新なしは長期停止。新規と今週の更新を区別する', () => {
    expect(classifyItem({ ...base, body: '承認待ち', updated_at: daysAgo(14) }, NOW).stale).toBe(true)
    expect(classifyItem({ ...base, created_at: daysAgo(2), updated_at: daysAgo(1) }, NOW)).toMatchObject({ isNew: true, changed: false })
    expect(classifyItem({ ...base, updated_at: daysAgo(2) }, NOW)).toMatchObject({ isNew: false, changed: true })
  })
  it('期限の表示: 不明・超過・残り日数・読めない', () => {
    expect(classifyItem(base, NOW).due.text).toBe('期限不明')
    expect(classifyItem({ ...base, deadline: due('2026-11-07') }, NOW).due.text).toContain('期限超過 2 日')
    expect(classifyItem({ ...base, deadline: due('2026-11-12') }, NOW).due.text).toContain('あと 3 日')
    expect(classifyItem({ ...base, deadline: { invalid: true, source: '本文' } }, NOW).due.text).toContain('読めない')
  })
})

describe('buildInventory', () => {
  it('PR が参照する同じリポジトリの Issue だけを PR にまとめ、Issue の期限を PR が引き継ぐ', () => {
    const inv = buildInventory(
      [
        { ...base, repo: 'o/site', number: 5, url: 'u5', body: 'Refs #4', deadline: due('2026-11-30') },
        { ...base, repo: 'o/site', number: 4, kind: 'issue' as const, url: 'u4', title: '案件', deadline: due('2026-11-11') },
        { ...base, repo: 'o/other', number: 4, kind: 'issue' as const, url: 'x4', title: '別' },
      ],
      NOW,
    )
    const pr = inv.find((i) => i.number === 5)
    expect(inv.find((i) => i.repo === 'o/site' && i.number === 4)?.pairedPr).toBe(5)
    expect(inv.find((i) => i.repo === 'o/other')?.pairedPr).toBeNull()
    expect(pr?.deadline).toMatchObject({ date: '2026-11-11' })
    expect(pr?.due.urgent).toBe(true)
    expect(pr?.due.text).toContain('Issue #4')
  })
  it('別のリポジトリの Issue の URL を参照する PR は、同じ番号の Issue をまとめない', () => {
    const inv = buildInventory(
      [
        { ...base, repo: 'o/site', number: 5, url: 'u5', body: 'https://github.com/o/other/issues/4' },
        { ...base, repo: 'o/site', number: 4, kind: 'issue' as const, url: 'u4', title: '承認待ちの Issue' },
      ],
      NOW,
    )
    expect(inv.find((i) => i.number === 4)?.pairedPr).toBeNull()
  })
})

describe('selectDecisions', () => {
  const mk = (n: number, extra: object) => ({ ...base, repo: 'o/r', number: n, url: `u${n}`, body: '承認待ち', ...extra })
  it('期限超過・期限間近は、更新が新しくても先頭に並ぶ', () => {
    const inv = buildInventory(
      [mk(1, { updated_at: daysAgo(25) }), mk(2, { updated_at: daysAgo(0), created_at: daysAgo(1), deadline: due('2026-11-11') }), mk(3, { deadline: due('2026-11-05') })],
      NOW,
    )
    const { urgent, others } = selectDecisions(inv)
    expect(urgent.map((i) => i.number)).toEqual([3, 2])
    expect(others.map((i) => i.number)).toEqual([1])
  })
  it('緊急が 6 件以上なら上限を超えてもすべて出し、緊急でないものは補わない', () => {
    const inv = buildInventory(
      [...Array.from({ length: 7 }, (_, i) => mk(i + 1, { deadline: due('2026-11-12') })), mk(20, {})],
      NOW,
    )
    const { urgent, others, omitted } = selectDecisions(inv)
    expect(urgent).toHaveLength(7)
    expect(urgent.length).toBeGreaterThan(MAX_DECISIONS)
    expect(others).toHaveLength(0)
    expect(omitted).toBe(1)
  })
  it('緊急がなければ要判断 → 不明 → 終了候補の順で 5 件まで。保留中は入れない', () => {
    const inv = buildInventory(
      [
        ...Array.from({ length: 4 }, (_, i) => mk(i + 1, {})),
        mk(10, { body: '' }),
        mk(11, { title: '[TEST] x', body: '' }),
        mk(12, { hold: parseHold([holdComment('理由', '2026-12-01')]) }),
      ],
      NOW,
    )
    const { urgent, others, omitted } = selectDecisions(inv)
    expect(urgent).toHaveLength(0)
    expect(others.map((i) => i.number)).toEqual([1, 2, 3, 4, 10])
    expect(omitted).toBe(1)
  })
})

describe('renderReport', () => {
  const inv = buildInventory(
    [
      { ...base, repo: 'o/site', number: 5, url: 'u5', body: 'Refs #4\n承認待ち', created_at: daysAgo(2), updated_at: daysAgo(1) },
      { ...base, repo: 'o/site', number: 4, kind: 'issue' as const, url: 'u4', title: '案件の Issue' },
      { ...base, repo: 'o/site', number: 9, url: 'u9', hold: parseHold([holdComment('先方の回答待ち', '2026-12-01')]) },
    ],
    NOW,
  )
  it('すべて取得でき Notion も照合済みなら「不完全」と書かない', () => {
    const md = renderReport(inv, NOW, { repos: ['o/site'], failed: [], notion: 'ok' })
    expect(md).toContain('# 週次タスク棚卸し 2026-11-09\n')
    expect(md).not.toContain('不完全')
    expect(md).toContain('1/1 リポジトリを取得')
    expect(md).toContain('要判断 1・保留中 1・終了候補 0・不明 0')
    expect(md).toContain('先方の回答待ち')
    expect(md).not.toContain('案件の Issue')
  })
  it('取得に失敗したリポジトリがあれば、冒頭で不完全と明示し、件数を「取得できた範囲」と書く', () => {
    const md = renderReport(inv, NOW, { repos: ['o/site', 'o/x'], failed: ['o/x（HTTP 403）'], notion: 'ok' })
    expect(md).toContain('# 週次タスク棚卸し 2026-11-09（不完全）')
    expect(md).toContain('完全な一覧ではない')
    expect(md).toContain('1/2 リポジトリを取得（失敗: o/x（HTTP 403））')
    expect(md).toContain('取得できた範囲で 開いている')
  })
  it('Notion を照合していなければ不完全（既定でも不完全）', () => {
    expect(renderReport(inv, NOW, { repos: ['o/site'], failed: [], notion: '未照合（接続できない）' })).toContain('Notion 未照合（接続できない）')
    expect(renderReport(inv, NOW)).toContain('（不完全）')
  })
  it('空なら判断事項も一覧も「なし」', () => {
    const md = renderReport([], NOW, { repos: ['o/site'], notion: 'ok' })
    expect(md).toContain('緊急 0 件')
    expect(md).toContain('## 要判断（0）\n- なし')
  })
})

describe('planRecord（保留・期限の記録の追記）', () => {
  const today = '2026-11-09'
  it('最新の記録の id を --expect-latest に要求する', () => {
    expect(planRecord([], 'hold', { reason: 'r', recheck: '2026-12-01' }, { today })).toMatchObject({ action: 'error', latestId: 'none' })
  })
  it('記録がなく expectLatest=none なら追記の本文を作る', () => {
    const p = planRecord([], 'hold', { reason: '印刷担当の回答待ち', recheck: '2026-11-20' }, { expectLatest: 'none', today })
    expect(p.action).toBe('write')
    expect(p.body).toContain(HOLD_MARK)
    expect(parseHold([{ id: 1, body: p.body, created_at: daysAgo(0) }])).toMatchObject({ valid: true, recheck: '2026-11-20' })
  })
  it('同じ内容が最新にあれば skip（重複を作らない）', () => {
    const c = [holdComment('印刷担当の回答待ち', '2026-11-20', daysAgo(1), 7)]
    expect(planRecord(c, 'hold', { reason: '印刷担当の回答待ち', recheck: '2026-11-20' }, { expectLatest: 7, today }).action).toBe('skip')
  })
  it('指示の時点から最新の記録が変わっていれば conflict（古い記録を前提に上書きしない）', () => {
    const c = [holdComment('A', '2026-11-20', daysAgo(3), 7), holdComment('B', '2026-11-25', daysAgo(1), 8)]
    expect(planRecord(c, 'hold', { reason: 'C', recheck: '2026-11-30' }, { expectLatest: 7, today })).toMatchObject({ action: 'conflict', latestId: 8 })
  })
  it('入力の誤り（空の理由・日付の形式・今日以前・改行・根拠のない期限）は error', () => {
    expect(planRecord([], 'hold', { reason: '', recheck: '2026-12-01' }, { expectLatest: 'none', today }).action).toBe('error')
    expect(planRecord([], 'hold', { reason: 'r', recheck: '12/1' }, { expectLatest: 'none', today }).action).toBe('error')
    expect(planRecord([], 'hold', { reason: 'r', recheck: '2026-11-09' }, { expectLatest: 'none', today }).action).toBe('error')
    expect(planRecord([], 'hold', { reason: 'a\n再確認日: 2027-01-01', recheck: '2026-12-01' }, { expectLatest: 'none', today }).action).toBe('error')
    expect(planRecord([], 'deadline', { date: '2026-11-12', basis: '' }, { expectLatest: 'none', today }).action).toBe('error')
    expect(planRecord([], 'other', {}, { expectLatest: 'none', today }).action).toBe('error')
  })
  it('解除と期限の記録も作れる', () => {
    const rel = planRecord([holdComment('A', '2026-11-20', daysAgo(1), 7)], 'hold', { recheck: '解除' }, { expectLatest: 7, today })
    expect(rel.body).toContain('再確認日: 解除')
    const d = planRecord([], 'deadline', { date: '2026-11-12', basis: '印刷の入稿締切（人間の指示）' }, { expectLatest: 'none', today })
    expect(parseDeadline({ comments: [{ id: 1, body: d.body, created_at: daysAgo(0) }] })).toMatchObject({ date: '2026-11-12' })
  })
})
