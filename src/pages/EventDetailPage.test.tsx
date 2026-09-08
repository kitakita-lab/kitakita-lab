import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, within } from '@/test/test-utils'
import { App } from '@/App'
import { events } from '@/data/events'

/**
 * イベント実績 詳細（/events/:slug）の回帰テスト。
 * 実データを使い、slug から正しいイベントが選ばれ、主要セクションが
 * データどおりに描画されることを保証する。
 */
describe('EventDetailPage（/events/:slug）', () => {
  it.each(events.map((e) => [e.slug, e] as const))(
    '%s: slug に対応するイベントの h1・会場・開催概要が表示される',
    async (_slug, event) => {
      renderWithProviders(<App />, { route: `/events/${event.slug}` })

      const h1 = await screen.findByRole('heading', { level: 1 })
      // titleLines があれば2行（span.block）、なければ title そのもの
      if (event.titleLines) {
        const lines = Array.from(h1.querySelectorAll('span.block')).map((s) => s.textContent)
        expect(lines).toEqual(event.titleLines)
      } else {
        expect(h1).toHaveTextContent(event.title)
      }

      const article = screen.getByRole('article')
      expect(article).toHaveTextContent(event.venue)
      expect(article).toHaveTextContent(event.dateLabel)

      const overview = screen.getByRole('heading', { level: 2, name: '開催概要' }).parentElement!
      for (const row of event.overview) {
        expect(within(overview).getByText(row.label)).toBeInTheDocument()
        expect(within(overview).getByText(row.value)).toBeInTheDocument()
      }
    },
  )

  it('参加実績（stats）の数値がすべて表示される', async () => {
    const event = events.find((e) => e.stats && e.stats.length > 0)!
    renderWithProviders(<App />, { route: `/events/${event.slug}` })
    await screen.findByRole('heading', { level: 1 })

    const results = screen.getByRole('heading', { level: 2, name: '参加実績' }).closest('section')!
    for (const stat of event.stats!) {
      expect(within(results).getByText(stat.value)).toBeInTheDocument()
      expect(within(results).getByText(stat.label)).toBeInTheDocument()
    }
  })

  it('本文セクション・日別レポート・フォトギャラリーがデータどおり描画される', async () => {
    const event = events.find((e) => e.sections?.length && e.dayReports?.length && e.photos?.length)!
    renderWithProviders(<App />, { route: `/events/${event.slug}` })
    await screen.findByRole('heading', { level: 1 })

    for (const section of event.sections!) {
      expect(screen.getByRole('heading', { level: 2, name: section.heading })).toBeInTheDocument()
      for (const para of section.body) {
        expect(screen.getByText(para)).toBeInTheDocument()
      }
    }
    for (const day of event.dayReports!) {
      expect(screen.getByText(day.body)).toBeInTheDocument()
    }
    for (const photo of event.photos!) {
      expect(screen.getByAltText(photo.alt)).toHaveAttribute('src', photo.src)
    }
  })

  it('heroImageMobile を持つイベントは <picture> でスマホ用画像を出し分ける', async () => {
    const event = events.find((e) => e.heroImageMobile)!
    renderWithProviders(<App />, { route: `/events/${event.slug}` })
    await screen.findByRole('heading', { level: 1 })

    const hero = screen.getByAltText(event.heroImage!.alt)
    expect(hero).toHaveAttribute('src', event.heroImage!.src)
    const picture = hero.closest('picture')
    expect(picture).not.toBeNull()
    const source = picture!.querySelector('source')!
    expect(source).toHaveAttribute('srcset', event.heroImageMobile!.src)
    expect(source.getAttribute('media')).toMatch(/max-width/)
  })

  it('heroImageMobile を持たないイベントは従来どおり <img> のみ（16:9）で描画される', async () => {
    const event = events.find((e) => e.heroImage && !e.heroImageMobile)!
    renderWithProviders(<App />, { route: `/events/${event.slug}` })
    await screen.findByRole('heading', { level: 1 })

    const hero = screen.getByAltText(event.heroImage!.alt)
    expect(hero.closest('picture')).toBeNull()
    expect(hero.className).toContain('aspect-[16/9]')
  })

  it('存在しない slug は一覧（/events）へリダイレクトする', async () => {
    renderWithProviders(<App />, { route: '/events/no-such-event' })

    const h1 = await screen.findByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('イベント実績')
  })
})
