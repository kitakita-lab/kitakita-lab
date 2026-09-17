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

  it('「ひとつのブランドの、歩み」（brandJourney）は一覧に表示しない。主人公は KitaKita Lab', async () => {
    renderWithProviders(<App />, { route: '/events' })
    await screen.findByRole('heading', { level: 1 })

    // データは将来の再利用のために残っているが、Events 一覧には描画しない
    expect(brandJourney.length).toBeGreaterThan(0)
    expect(screen.queryByRole('heading', { level: 2, name: /ひとつのブランドの/ })).toBeNull()
    for (const step of brandJourney) {
      expect(screen.queryByRole('heading', { level: 3, name: step.title })).toBeNull()
    }
    // 「レポートを見る」はカード（h2 を含むリンク）だけ。タイムライン由来のリンクはない
    const reportLinks = screen.getAllByRole('link', { name: /レポートを見る/ })
    expect(reportLinks.every((a) => a.querySelector('h2'))).toBe(true)
    expect(reportLinks).toHaveLength(sortedEvents.length)
  })

  it('構成は PageHeader → 実績カード → CTA だけ（h2 見出しはカードのタイトルのみ）', async () => {
    renderWithProviders(<App />, { route: '/events' })
    await screen.findByRole('heading', { level: 1 })

    const h2s = screen.getAllByRole('heading', { level: 2 })
    // カードのタイトル（イベント数）＋ CtaBand の見出し 1 つ
    expect(h2s).toHaveLength(sortedEvents.length + 1)
    expect(h2s[h2s.length - 1]).toHaveTextContent('次のイベント、一緒につくりませんか。')
  })
})
