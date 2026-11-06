import { describe, it, expect } from 'vitest'
import {
  HOLD_MARK,
  parseHold,
  linkedIssues,
  classifyItem,
  buildInventory,
  renderReport,
  snippet,
} from '../../scripts/lib/inventory.mjs'

/**
 * 週次タスク棚卸しの判定（scripts/lib/inventory.mjs）のテスト。
 * 公開リポジトリのため、リポジトリ名・案件名は架空のものを使う。
 */
const NOW = new Date('2026-11-09T00:00:00Z')
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000).toISOString()
const base = { kind: 'pr' as const, title: '何かの変更', body: '', created_at: daysAgo(20), updated_at: daysAgo(10) }
const holdComment = (reason: string, recheck: string, at = daysAgo(5)) => ({
  body: `${HOLD_MARK}\n保留理由: ${reason}\n再確認日: ${recheck}`,
  created_at: at,
})

describe('parseHold', () => {
  it('印のあるコメントがなければ null', () => {
    expect(parseHold([{ body: 'ふつうのコメント', created_at: daysAgo(1) }])).toBeNull()
    expect(parseHold(null)).toBeNull()
  })
  it('最新の保留の記録を採る', () => {
    const h = parseHold([holdComment('古い理由', '2026-11-10', daysAgo(9)), holdComment('印刷担当の回答待ち', '2026-11-20', daysAgo(2))])
    expect(h).toMatchObject({ reason: '印刷担当の回答待ち', recheck: '2026-11-20', valid: true })
  })
  it('全角コロンも読める。再確認日が日付でなければ無効', () => {
    expect(parseHold([{ body: `${HOLD_MARK}\n保留理由：理由\n再確認日：来週`, created_at: daysAgo(1) }])).toMatchObject({ valid: false })
  })
  it('保留理由が空欄なら、次の行を理由として取り込まず無効にする', () => {
    expect(parseHold([{ body: `${HOLD_MARK}\n保留理由:\n再確認日: 2026-11-20`, created_at: daysAgo(1) }])).toMatchObject({ reason: null, valid: false })
  })
  it('再確認日が「解除」なら保留を解いたものとして扱う', () => {
    const h = parseHold([holdComment('理由', '2026-12-01', daysAgo(3)), { body: `${HOLD_MARK}\n再確認日: 解除`, created_at: daysAgo(1) }])
    expect(h).toMatchObject({ released: true })
  })
})

describe('linkedIssues', () => {
  it('Refs・Closes・Issue #・同じリポジトリの issues/ の URL を拾い、ただの #番号は拾わない', () => {
    expect(linkedIssues('Refs #12\nCloses #3\n[Issue #7](x)\nhttps://github.com/o/r/issues/9\nPR #5 の続き', 'o/r')).toEqual([12, 3, 7, 9])
    expect(linkedIssues(null)).toEqual([])
  })
  it('別のリポジトリの Issue の URL は拾わない', () => {
    expect(linkedIssues('https://github.com/o/other/issues/4', 'o/site')).toEqual([])
    expect(linkedIssues('https://github.com/O/Site/issues/4', 'o/site')).toEqual([4])
  })
})

describe('snippet', () => {
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
  it('再確認日を過ぎた保留は「要判断」に戻る', () => {
    const r = classifyItem({ ...base, hold: parseHold([holdComment('理由A', '2026-11-08')]) }, NOW)
    expect(r.category).toBe('要判断')
    expect(r.reasons[0]).toContain('過ぎた')
  })
  it('読めない保留の記録は保留扱いにせず、そのことを理由に書く', () => {
    const hold = parseHold([{ body: `${HOLD_MARK}\n保留理由: 理由`, created_at: daysAgo(1) }])
    const r = classifyItem({ ...base, hold }, NOW)
    expect(r.category).not.toBe('保留中')
    expect(r.reasons.join()).toContain('読めない')
  })
  it('タイトルの「マージしない」「実習」は作成から 7 日たてば「終了候補」。7 日未満は対象外', () => {
    expect(classifyItem({ ...base, title: '企画書 Version 1（マージしない・レビュー用）' }, NOW).category).toBe('終了候補')
    expect(classifyItem({ ...base, title: '【実習・マージ禁止】', created_at: daysAgo(3), updated_at: daysAgo(3) }, NOW).category).not.toBe('終了候補')
  })
  it('本文の一般的な「マージ禁止設定」では終了候補にしない', () => {
    const r = classifyItem({ ...base, body: '手順書・マージ禁止設定の上に検査を足す。' }, NOW)
    expect(r.category).toBe('不明')
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
  it('記載がなく 30 日以上更新がなければ「終了候補」、それより短ければ「不明」', () => {
    expect(classifyItem({ ...base, created_at: daysAgo(60), updated_at: daysAgo(31) }, NOW).category).toBe('終了候補')
    expect(classifyItem(base, NOW).category).toBe('不明')
  })
  it('14 日以上の更新なしは長期停止。新規と今週の更新を区別する', () => {
    expect(classifyItem({ ...base, body: '承認待ち', updated_at: daysAgo(14) }, NOW).stale).toBe(true)
    expect(classifyItem({ ...base, created_at: daysAgo(2), updated_at: daysAgo(1) }, NOW)).toMatchObject({ isNew: true, changed: false })
    expect(classifyItem({ ...base, updated_at: daysAgo(2) }, NOW)).toMatchObject({ isNew: false, changed: true })
  })
})

describe('buildInventory と renderReport', () => {
  const items = [
    { ...base, repo: 'o/site', number: 5, url: 'u5', body: 'Refs #4\n承認待ち', created_at: daysAgo(2), updated_at: daysAgo(1) },
    { ...base, repo: 'o/site', number: 4, kind: 'issue' as const, url: 'u4', title: '案件の Issue' },
    { ...base, repo: 'o/other', number: 4, kind: 'issue' as const, url: 'x4', title: '別リポジトリの同じ番号' },
    { ...base, repo: 'o/site', number: 9, url: 'u9', hold: parseHold([holdComment('先方の回答待ち', '2026-12-01')]) },
  ]
  const inv = buildInventory(items, NOW)
  it('別のリポジトリの Issue の URL を参照する PR は、同じ番号の Issue をまとめない', () => {
    const inv2 = buildInventory(
      [
        { ...base, repo: 'o/site', number: 5, url: 'u5', body: 'https://github.com/o/other/issues/4' },
        { ...base, repo: 'o/site', number: 4, kind: 'issue' as const, url: 'u4', title: '承認待ちの Issue' },
      ],
      NOW,
    )
    expect(inv2.find((i) => i.number === 4)?.pairedPr).toBeNull()
    expect(renderReport(inv2, NOW)).toContain('要判断 1')
  })
  it('PR が参照する同じリポジトリの Issue だけを PR にまとめる', () => {
    expect(inv.find((i) => i.repo === 'o/site' && i.number === 4)?.pairedPr).toBe(5)
    expect(inv.find((i) => i.repo === 'o/other')?.pairedPr).toBeNull()
  })
  it('区分ごとの件数・今週の変化・保留理由を出し、まとめた Issue は一覧に出さない', () => {
    const md = renderReport(inv, NOW)
    expect(md).toContain('# 週次タスク棚卸し 2026-11-09')
    expect(md).toContain('PR に紐づく Issue 1 件はまとめた')
    expect(md).toContain('要判断 1・保留中 1・終了候補 0・不明 1')
    expect(md).toContain('新しく発生: o/site PR #5')
    expect(md).toContain('先方の回答待ち')
    expect(md).not.toContain('案件の Issue')
  })
  it('空なら「なし」と書く', () => {
    expect(renderReport([], NOW)).toContain('## 要判断（0）\n- なし')
  })
})
