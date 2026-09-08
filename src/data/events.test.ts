import { describe, it, expect } from 'vitest'
import { events, sortedEvents, brandJourney } from './events'

/**
 * イベント実績データの整合性テスト。
 * 「壊れたデータ（URL衝突・リンク切れ・h1とSEOタイトルの乖離）を本番に出さない」ためのガード。
 */
describe('events データ', () => {
  it('slug が一意である（詳細ページの URL 衝突防止）', () => {
    const slugs = events.map((e) => e.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('dateISO が有効な ISO 形式（YYYY-MM-DD）である', () => {
    for (const e of events) {
      expect(e.dateISO, `${e.slug} の dateISO`).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(Number.isNaN(new Date(e.dateISO).getTime())).toBe(false)
    }
  })

  it('sortedEvents は開催日の新しい順に並んでいる', () => {
    for (let i = 1; i < sortedEvents.length; i++) {
      const prev = new Date(sortedEvents[i - 1].dateISO).getTime()
      const curr = new Date(sortedEvents[i].dateISO).getTime()
      expect(prev).toBeGreaterThanOrEqual(curr)
    }
  })

  it('画像パスは public 直下からの絶対パスである', () => {
    for (const e of events) {
      const srcs = [
        e.heroImage?.src,
        e.heroImageMobile?.src,
        ...(e.photos?.map((p) => p.src) ?? []),
      ].filter((s): s is string => Boolean(s))
      for (const src of srcs) {
        expect(src, `${e.slug} の画像パス`).toMatch(/^\/.+\.(jpg|jpeg|png|webp)$/)
      }
    }
  })

  it('titleLines は title を意味の単位で分割したものと一致する（h1 と SEO タイトルの乖離防止）', () => {
    for (const e of events) {
      if (!e.titleLines) continue
      const [first, second] = e.titleLines
      expect(first.length, `${e.slug} の titleLines[0]`).toBeGreaterThan(0)
      expect(second.length, `${e.slug} の titleLines[1]`).toBeGreaterThan(0)
      // 「企画名」実施内容 のように連結するか、会場名 実施内容 のように半角スペースで連結する
      expect([first + second, `${first} ${second}`], `${e.slug} の titleLines`).toContain(e.title)
    }
  })

  it('開催概要（overview）と要約（excerpt）が空でない', () => {
    for (const e of events) {
      expect(e.overview.length, `${e.slug} の overview`).toBeGreaterThan(0)
      expect(e.excerpt.trim().length, `${e.slug} の excerpt`).toBeGreaterThan(0)
    }
  })
})

describe('brandJourney（ひとつのブランドの、歩み）', () => {
  it('slug を持つステップは、実在するイベントを指している（リンク切れ防止）', () => {
    const slugs = new Set(events.map((e) => e.slug))
    for (const step of brandJourney) {
      if (step.slug) {
        expect(slugs.has(step.slug), `歩み「${step.title}」の slug`).toBe(true)
      }
    }
  })

  it('開催前（upcoming）のステップにはレポートリンクを付けない', () => {
    for (const step of brandJourney) {
      if (step.upcoming) {
        expect(step.slug, `歩み「${step.title}」`).toBeUndefined()
      }
    }
  })
})
