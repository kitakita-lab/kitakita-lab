import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, userEvent, within } from '@/test/test-utils'
import { Header } from './Header'

describe('Header', () => {
  it('ロゴ（ホームへのリンク）が表示される', () => {
    renderWithProviders(<Header />)

    // ロゴのアクセシブルネームは「K KitaKita Lab（+ 補足あり得る）」。
    // 「KitaKita Labとは」等のナビ項目と区別するため末尾一致で特定する。
    const links = screen.getAllByRole('link')
    const logo = links.find((l) => l.getAttribute('href') === '/')
    expect(logo).toBeDefined()
    expect(logo).toHaveAccessibleName(/KitaKita Lab/)
  })

  it('メインナビゲーションに全メニュー項目が表示される', () => {
    renderWithProviders(<Header />)

    const nav = screen.getByRole('navigation', { name: 'メインナビゲーション' })
    for (const label of [
      'KitaKita Labとは',
      'Activities',
      'Workshop',
      'Research',
      'Collaboration',
      'Creators',
      'News',
      'FAQ',
    ]) {
      expect(within(nav).getByText(label)).toBeInTheDocument()
    }
  })

  it('メニューボタンで開閉状態（aria-expanded）が切り替わる', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header />)

    const toggle = screen.getByRole('button', { name: 'メニューを開く' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(toggle).toHaveAccessibleName('メニューを閉じる')

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAccessibleName('メニューを開く')
  })

  it('メニュー展開中は背景スクロールがロックされ、閉じると解除される', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header />)

    const toggle = screen.getByRole('button', { name: 'メニューを開く' })
    await user.click(toggle)
    expect(document.body.style.overflow).toBe('hidden')

    await user.click(toggle)
    expect(document.body.style.overflow).toBe('')
  })

  it('モバイルメニューのリンクを押すとメニューが閉じる', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header />)

    const toggle = screen.getByRole('button', { name: 'メニューを開く' })
    await user.click(toggle)

    const mobileNav = screen.getByRole('navigation', {
      name: 'モバイルナビゲーション',
    })
    await user.click(within(mobileNav).getByText('Workshop'))

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('お問い合わせボタンが /contact へリンクしている', () => {
    renderWithProviders(<Header />)

    const links = screen.getAllByRole('link', { name: 'お問い合わせ' })
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(link).toHaveAttribute('href', '/contact')
    }
  })
})
