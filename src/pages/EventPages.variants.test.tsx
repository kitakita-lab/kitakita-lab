import { describe, it, expect, vi } from 'vitest'
import { Routes, Route } from 'react-router-dom'
import { renderWithProviders, screen, within } from '@/test/test-utils'
import type { EventReport, JourneyStep } from '@/data/events'

/**
 * 一覧・詳細テンプレートの「任意項目あり／なし」分岐テスト。
 *
 * 実データは全イベントが titleLines を持つなど分岐の片側しか通らないため、
 * ここでは最小のフィクスチャでモジュールを差し替え、両方の分岐を固定する。
 * （実データが変わっても、このテストの意味は変わらない）
 */
const full: EventReport = {
  slug: 'full-event',
  title: '「テスト企画」フラワーボトルワークショップ',
  titleLines: ['「テスト企画」', 'フラワーボトルワークショップ'],
  category: '商業施設',
  dateISO: '2026-09-04',
  dateLabel: '2026年9月4日（金）〜9月7日（月）',
  venue: 'テスト会場',
  excerpt: 'フル項目のテストイベントです。',
  heroImage: { src: '/events/full/hero.jpg', alt: 'フルイベントのヒーロー' },
  heroImageMobile: { src: '/events/full/hero-mobile.jpg' },
  cardImagePosition: 'center bottom',
  overview: [{ label: '会場', value: 'テスト会場' }],
  stats: [
    { value: '10組', label: '総参加組数' },
    { value: '20名', label: '総参加人数' },
    { value: '15本', label: '制作数' },
    { value: '4日間', label: '開催期間' },
  ],
  sections: [{ heading: '概要', body: ['本文1'], points: ['ポイントA'] }],
  dayReports: [{ label: 'Day 1', date: '9月4日', body: '初日の様子' }],
  photos: [{ src: '/events/full/p1.jpg', alt: '写真1', caption: 'キャプション1' }],
  voices: [{ quote: '楽しかった', context: '参加者' }],
  commitments: [{ title: '大切なこと', body: '説明' }],
}

const minimal: EventReport = {
  slug: 'minimal-event',
  title: 'ミニマル会場 ワークショップ体験会',
  category: '公共空間',
  dateISO: '2026-06-19',
  dateLabel: '2026年6月19日（金）',
  venue: 'ミニマル会場',
  excerpt: '必須項目だけのテストイベントです。',
  heroImage: { src: '/events/minimal/hero.jpg', alt: 'ミニマルのヒーロー' },
  overview: [{ label: '会場', value: 'ミニマル会場' }],
}

const journey: JourneyStep[] = [
  { period: 'これまで', title: '始まり', body: '市場から。' },
  { period: '2026年9月', title: '試してみる', body: '会場へ。', slug: 'full-event' },
  { period: 'これから', title: '次の場所へ', body: '開催が決まっています。', upcoming: true },
]

vi.mock('@/data/events', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/events')>()
  const events = [full, minimal]
  return { ...actual, events, sortedEvents: events, brandJourney: journey }
})

// モック後に読み込む（ページはモックされたデータを参照する）
const { EventsPage } = await import('@/pages/EventsPage')
const { EventDetailPage } = await import('@/pages/EventDetailPage')

function renderDetail(slug: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/events" element={<h1>一覧へ戻った</h1>} />
      <Route path="/events/:slug" element={<EventDetailPage />} />
    </Routes>,
    { route: `/events/${slug}` },
  )
}

describe('EventsPage の分岐', () => {
  it('titleLines がないカードは title をそのまま1要素で表示する', () => {
    renderWithProviders(<EventsPage />, { route: '/events' })

    const card = screen
      .getAllByRole('link', { name: /レポートを見る/ })
      .find((a) => a.getAttribute('href') === '/events/minimal-event')!
    const h2 = within(card).getByRole('heading', { level: 2 })
    expect(h2).toHaveTextContent(minimal.title)
    expect(h2.querySelectorAll('span.block')).toHaveLength(0)
  })

  it('cardImagePosition は該当カードの画像にだけ object-position として適用される', () => {
    renderWithProviders(<EventsPage />, { route: '/events' })

    expect(screen.getByAltText(full.heroImage!.alt)).toHaveStyle({ objectPosition: 'center bottom' })
    expect(screen.getByAltText(minimal.heroImage!.alt).style.objectPosition).toBe('')
  })

  it('stats がないカードは参加実績バッジを出さない', () => {
    renderWithProviders(<EventsPage />, { route: '/events' })

    const card = screen
      .getAllByRole('link', { name: /レポートを見る/ })
      .find((a) => a.getAttribute('href') === '/events/minimal-event')!
    expect(within(card).queryByRole('list')).toBeNull()
  })

  it('歩みの開催前ステップは「次の挑戦」バッジ付きでリンクなし、slug 付きはリンクあり', () => {
    renderWithProviders(<EventsPage />, { route: '/events' })

    expect(screen.getByText('次の挑戦')).toBeInTheDocument()
    const journeyLinks = screen
      .getAllByRole('link', { name: /^レポートを見る$/ })
      .filter((a) => !a.querySelector('h2'))
    expect(journeyLinks).toHaveLength(1)
    expect(journeyLinks[0]).toHaveAttribute('href', '/events/full-event')
  })
})

describe('EventDetailPage の分岐', () => {
  it('titleLines がない場合、h1 は title をそのまま表示する', () => {
    renderDetail('minimal-event')

    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent(minimal.title)
    expect(h1.querySelectorAll('span.block')).toHaveLength(0)
  })

  it('任意セクション（参加実績・当日の様子・反応・大切にしていること）は未入力なら表示しない', () => {
    renderDetail('minimal-event')

    expect(screen.queryByRole('heading', { level: 2, name: '参加実績' })).toBeNull()
    expect(screen.queryByRole('heading', { level: 2, name: '当日の様子' })).toBeNull()
    expect(screen.queryByRole('heading', { level: 2, name: '参加者の反応' })).toBeNull()
    expect(screen.queryByRole('heading', { level: 2, name: /大切にしていること/ })).toBeNull()
    // 開催概要は必須なので常に出る
    expect(screen.getByRole('heading', { level: 2, name: '開催概要' })).toBeInTheDocument()
  })

  it('フル項目のイベントは全セクションと、ポイント・写真キャプション・反応・大切にしていることを描画する', () => {
    renderDetail('full-event')

    expect(screen.getByRole('heading', { level: 2, name: '参加実績' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: '当日の様子' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: '参加者の反応' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /大切にしていること/ })).toBeInTheDocument()
    expect(screen.getByText('ポイントA')).toBeInTheDocument()
    expect(screen.getByText('キャプション1')).toBeInTheDocument()
    expect(screen.getByText('楽しかった')).toBeInTheDocument()
    expect(screen.getByText('大切なこと')).toBeInTheDocument()
    expect(screen.getByText('初日の様子')).toBeInTheDocument()
  })

  it('heroImageMobile ありは <picture>、なしは <img> のみ', () => {
    const { unmount } = renderDetail('full-event')
    const heroFull = screen.getByAltText(full.heroImage!.alt)
    expect(heroFull.closest('picture')?.querySelector('source')).toHaveAttribute(
      'srcset',
      full.heroImageMobile!.src,
    )
    unmount()

    renderDetail('minimal-event')
    const heroMin = screen.getByAltText(minimal.heroImage!.alt)
    expect(heroMin.closest('picture')).toBeNull()
  })

  it('存在しない slug は /events へ遷移する', () => {
    renderDetail('nope')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('一覧へ戻った')
  })
})
