import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { App } from './App'

/**
 * ルーティングのスモークテスト。
 * 全ページが「クラッシュせずに描画され、主要コンテンツが表示される」ことを保証する。
 * ページを追加したら、このテーブルに 1 行追加すること（README のテストルール参照）。
 */
const routes: Array<{ path: string; heading: string | RegExp }> = [
  { path: '/', heading: /少し進めてみる。/ },
  { path: '/workshop', heading: /つくる楽しさを、/ },
  { path: '/research', heading: /現場の声を、/ },
  { path: '/collaboration', heading: /ものづくりの力で、/ },
  { path: '/creators', heading: /その「少し」を、/ },
  { path: '/news', heading: 'お知らせ' },
  { path: '/faq', heading: 'よくある質問' },
  { path: '/contact', heading: 'お問い合わせ' },
]

describe('App ルーティング', () => {
  it.each(routes)('$path が描画され h1 が表示される', async ({ path, heading }) => {
    renderWithProviders(<App />, { route: path })

    const h1 = await screen.findByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent(heading)
  })

  it('ニュース詳細ページが slug から記事を表示する', async () => {
    renderWithProviders(<App />, { route: '/news/kitakita-lab-launch' })

    const h1 = await screen.findByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('KitaKita Lab を始動しました')
  })

  it('存在しない slug のニュース詳細は一覧へリダイレクトする', async () => {
    renderWithProviders(<App />, { route: '/news/no-such-article' })

    const h1 = await screen.findByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('お知らせ')
  })

  it('存在しないパスは 404 ページを表示する', async () => {
    renderWithProviders(<App />, { route: '/no-such-page' })

    const h1 = await screen.findByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('ページが見つかりませんでした')
  })

  it('全ページ共通でヘッダーとフッターが表示される', async () => {
    renderWithProviders(<App />, { route: '/' })

    expect(
      screen.getByRole('navigation', { name: 'メインナビゲーション' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument() // footer
    expect(screen.getByText('本文へスキップ')).toBeInTheDocument() // スキップリンク
  })
})
