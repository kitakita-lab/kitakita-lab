import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, within } from '@/test/test-utils'
import { App } from '@/App'
import { sortedEvents, brandJourney } from '@/data/events'

/**
 * イベント実績一覧（/events）の回帰テスト。
 * 実データ（src/data/events.ts）を使い、「データを追加するだけで一覧が完成する」
 * データ駆動の前提が崩れていないことを保証する。
 */
describe('EventsPage（/events）', () => {
  it('h1 と、実データのイベント数ぶんのカードが描画される', async () => {
    renderWithProviders(<App />, { route: '/events' })

    const h1 = await screen.findByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('イベント実績')

    // カード = 詳細ページへのリンク（歩みタイムラインの「レポートを見る」は除く）
    const cards = screen
      .getAllByRole('link', { name: /レポートを見る/ })
      .filter((a) => a.querySelector('h2'))
    expect(cards).toHaveLength(sortedEvents.length)
  })

  it('カードは開催日の新しい順に並び、詳細ページへリンクする', async () => {
    renderWithProviders(<App />, { route: '/events' })
    await screen.findByRole('heading', { level: 1 })

    const cards = screen
      .getAllByRole('link', { name: /レポートを見る/ })
      .filter((a) => a.querySelector('h2'))
    cards.forEach((card, i) => {
      expect(card).toHaveAttribute('href', `/events/${sortedEvents[i].slug}`)
    })
  })

  it('titleLines を持つイベントは、カードのタイトルが意味の単位で2行に分かれる', async () => {
    renderWithProviders(<App />, { route: '/events' })
    await screen.findByRole('heading', { level: 1 })

    for (const event of sortedEvents) {
      if (!event.titleLines) continue
      const card = screen
        .getAllByRole('link', { name: /レポートを見る/ })
        .filter((a) => a.querySelector('h2')) // 歩みタイムラインの同一 slug リンクを除く
        .find((a) => a.getAttribute('href') === `/events/${event.slug}`)!
      const lines = within(card)
        .getByRole('heading', { level: 2 })
        .querySelectorAll('span.block')
      expect(Array.from(lines).map((s) => s.textContent)).toEqual(event.titleLines)
    }
  })

  it('カードに会期・会場・主要な参加実績（最大3件）が表示される', async () => {
    renderWithProviders(<App />, { route: '/events' })
    await screen.findByRole('heading', { level: 1 })

    const event = sortedEvents[0]
    const card = screen
      .getAllByRole('link', { name: /レポートを見る/ })
      .filter((a) => a.querySelector('h2'))
      .find((a) => a.getAttribute('href') === `/events/${event.slug}`)!
    expect(card).toHaveTextContent(event.dateLabel)
    expect(card).toHaveTextContent(event.venue)
    for (const stat of (event.stats ?? []).slice(0, 3)) {
      expect(card).toHaveTextContent(`${stat.label} ${stat.value}`)
    }
  })

  it('「ひとつのブランドの、歩み」が全ステップ描画され、slug 付きはレポートへリンクする', async () => {
    renderWithProviders(<App />, { route: '/events' })
    await screen.findByRole('heading', { level: 1 })

    expect(screen.getByRole('heading', { level: 2, name: /ひとつのブランドの、\s*歩み/ })).toBeInTheDocument()
    for (const step of brandJourney) {
      expect(screen.getByRole('heading', { level: 3, name: step.title })).toBeInTheDocument()
    }
    const journeyLinks = screen
      .getAllByRole('link', { name: /^レポートを見る$/ })
      .filter((a) => !a.querySelector('h2'))
    expect(journeyLinks).toHaveLength(brandJourney.filter((s) => s.slug).length)
  })
})
