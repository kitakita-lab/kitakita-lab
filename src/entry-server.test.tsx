// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { prerenderPages, render } from './entry-server'
import { events } from '@/data/events'
import { newsItems } from '@/data/news'

/**
 * ビルド時プリレンダリング（SSG）の契約テスト。
 *
 * scripts/prerender.mjs は本モジュールの `prerenderPages` と `render()` に
 * 依存している。ここが壊れると「ビルドは通るのに特定URLの静的HTMLや
 * sitemap が欠ける」事故になるため、jsdom ではなく実際の実行環境に近い
 * Node 環境で検証する。
 */
describe('prerenderPages（静的化する URL 一覧）', () => {
  it('path が一意で、すべて / から始まる', () => {
    const paths = prerenderPages.map((p) => p.path)
    expect(new Set(paths).size).toBe(paths.length)
    for (const p of paths) expect(p).toMatch(/^\//)
  })

  it('全イベント・全ニュースの詳細 URL を含む（追加漏れ防止）', () => {
    const paths = new Set(prerenderPages.map((p) => p.path))
    for (const e of events) expect(paths.has(`/events/${e.slug}`), e.slug).toBe(true)
    for (const n of newsItems) expect(paths.has(`/news/${n.slug}`), n.slug).toBe(true)
  })

  it('404 ページは sitemap に含めず、それ以外は sitemap 設定を持つ', () => {
    const notFound = prerenderPages.find((p) => p.path === '/404')
    expect(notFound?.sitemap).toBe(false)
    for (const p of prerenderPages) {
      if (p.path === '/404') continue
      expect(p.sitemap, p.path).not.toBe(false)
      expect(p.expectTitle.length, p.path).toBeGreaterThan(0)
    }
  })
})

describe('render()（サーバー描画）', () => {
  it('トップページを描画し、helmet から title と canonical が取れる', async () => {
    const { html, helmet } = await render('/')

    expect(html).toContain('<h1')
    expect(helmet.title.toString()).toContain('ちょっと進めてみる')
    expect(helmet.link.toString()).toContain('rel="canonical"')
  })

  it('イベント詳細（lazy ルート）を解決して本文まで描画する', async () => {
    const event = events[0]
    const { html, helmet } = await render(`/events/${event.slug}`)

    expect(helmet.title.toString()).toContain(event.title)
    expect(html).toContain(event.venue)
    // Article / BreadcrumbList の JSON-LD が出力される
    expect(helmet.script.toString()).toContain('"@type":"Article"')
    expect(helmet.script.toString()).toContain('"@type":"BreadcrumbList"')
  })

  it('各 prerender ページの title に expectTitle が含まれる（prerender.mjs の検証と同じ契約）', async () => {
    // 全件は時間がかかるため、静的ページ・イベント・ニュース・404 を1件ずつ代表で確認
    const samples = [
      prerenderPages.find((p) => p.path === '/events')!,
      prerenderPages.find((p) => p.path.startsWith('/events/'))!,
      prerenderPages.find((p) => p.path.startsWith('/news/'))!,
      prerenderPages.find((p) => p.path === '/404')!,
    ]
    for (const page of samples) {
      const { helmet } = await render(page.path)
      expect(helmet.title.toString(), page.path).toContain(page.expectTitle)
    }
  })
})
