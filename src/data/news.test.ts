import { describe, it, expect } from 'vitest'
import { newsItems, sortedNews } from './news'

/**
 * データ整合性テスト。
 * CMS 移行前のデータ層に対する「壊れたデータを本番に出さない」ためのガード。
 */
describe('news データ', () => {
  it('slug が一意である（詳細ページの URL 衝突防止）', () => {
    const slugs = newsItems.map((n) => n.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('date が有効な ISO 形式（YYYY-MM-DD）である', () => {
    for (const item of newsItems) {
      expect(item.date, `${item.slug} の date`).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(Number.isNaN(new Date(item.date).getTime())).toBe(false)
    }
  })

  it('本文（body）が 1 段落以上ある', () => {
    for (const item of newsItems) {
      expect(item.body.length, `${item.slug} の body`).toBeGreaterThan(0)
    }
  })

  it('sortedNews は日付の新しい順に並んでいる', () => {
    for (let i = 1; i < sortedNews.length; i++) {
      const prev = new Date(sortedNews[i - 1].date).getTime()
      const curr = new Date(sortedNews[i].date).getTime()
      expect(prev).toBeGreaterThanOrEqual(curr)
    }
  })
})
