import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { App } from '@/App'
import { newsItems } from '@/data/news'

/**
 * お知らせ 詳細（/news/:slug）の関連リンクの回帰テスト。
 * サイト外（note など）へのリンクは新しいタブで開き、サイト内のリンクは経路のまま使う。
 */
describe('NewsDetailPage（/news/:slug）の関連リンク', () => {
  it('note の記事へのリンクは、外部リンクとして新しいタブで開く', async () => {
    renderWithProviders(<App />, { route: '/news/note-report-ai-2026-11' })

    const link = await screen.findByRole('link', { name: /noteで記事を読む/ })
    expect(link).toHaveAttribute('href', 'https://note.com/kitakitalab1125/n/n904e5bfdde39')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link).toHaveTextContent('新しいタブで開きます')
  })

  it('有料記事であることと価格を本文に書いている', async () => {
    renderWithProviders(<App />, { route: '/news/note-report-ai-2026-11' })

    const article = await screen.findByRole('article')
    expect(article).toHaveTextContent('noteの有料記事（1,480円）です。')
  })

  it('サイト内のリンクは新しいタブにせず、同じ経路で開く', async () => {
    const item = newsItems.find((n) => n.links?.some((l) => l.href.startsWith('/')))!
    const internal = item.links!.find((l) => l.href.startsWith('/'))!
    renderWithProviders(<App />, { route: `/news/${item.slug}` })

    const link = await screen.findByRole('link', { name: internal.label })
    expect(link).toHaveAttribute('href', internal.href)
    expect(link).not.toHaveAttribute('target')
  })
})
