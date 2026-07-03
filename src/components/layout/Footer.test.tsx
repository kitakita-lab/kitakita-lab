import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, within } from '@/test/test-utils'
import { Footer } from './Footer'
import { site, footerGroups } from '@/data/site'

describe('Footer', () => {
  it('サイト名とタグラインが表示される', () => {
    renderWithProviders(<Footer />)

    // ロゴ（ホームへのリンク）を href で特定（「KitaKita Labとは」等と区別）
    const logo = screen.getAllByRole('link').find((l) => l.getAttribute('href') === '/')
    expect(logo).toBeDefined()
    expect(logo).toHaveAccessibleName(/KitaKita Lab/)
    expect(screen.getByText(site.tagline)).toBeInTheDocument()
  })

  it('メールアドレス未設定の間は mailto リンクを表示しない', () => {
    renderWithProviders(<Footer />)

    // TODO: 正式なメールアドレス設定後は「mailto リンクが表示される」テストに戻す
    const mailto = screen
      .queryAllByRole('link')
      .filter((l) => (l.getAttribute('href') ?? '').startsWith('mailto:'))
    expect(mailto).toHaveLength(0)
  })

  it('全リンクグループ（About / Programs / Information）が表示される', () => {
    renderWithProviders(<Footer />)

    for (const group of footerGroups) {
      const heading = screen.getByRole('heading', { name: group.title })
      expect(heading).toBeInTheDocument()
      // 各グループのリンクがすべて表示されている
      const section = heading.parentElement as HTMLElement
      for (const link of group.links) {
        expect(within(section).getByText(link.label)).toBeInTheDocument()
      }
    }
  })

  it('コピーライトに現在の年が表示される', () => {
    renderWithProviders(<Footer />)

    const year = new Date().getFullYear()
    expect(
      screen.getByText(`© ${year} ${site.name}. All rights reserved.`),
    ).toBeInTheDocument()
  })
})
