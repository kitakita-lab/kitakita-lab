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

  it('連絡先メールアドレスが mailto リンクで表示される', () => {
    renderWithProviders(<Footer />)

    const mail = screen.getByRole('link', { name: site.email })
    expect(mail).toHaveAttribute('href', `mailto:${site.email}`)
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
