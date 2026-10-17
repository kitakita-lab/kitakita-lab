import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, userEvent, within } from '@/test/test-utils'
import { Header } from './Header'
import { navItems, desktopNavItems } from '@/data/site'

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

  it('PC のメインナビゲーションは 6 項目（Activities・Creators・News は出さない）', () => {
    renderWithProviders(<Header />)

    const nav = screen.getByRole('navigation', { name: 'メインナビゲーション' })
    const labels = within(nav)
      .getAllByRole('link')
      .map((a) => a.textContent)
    expect(labels).toEqual(['KitaKita Labとは', 'Workshop', 'Events', 'Research', 'Collaboration', 'FAQ'])
    expect(within(nav).getByRole('link', { name: 'KitaKita Labとは' })).toHaveAttribute('href', '/#about')
  })

  it('PC ヘッダーの項目は 6 項目以内（1024px で 1 行に収めるため）', () => {
    expect(desktopNavItems.length).toBeLessThanOrEqual(6)
  })

  it('モバイルメニューには全 9 項目が表示される', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header />)

    await user.click(screen.getByRole('button', { name: 'メニューを開く' }))
    const mobileNav = screen.getByRole('navigation', { name: 'モバイルナビゲーション' })
    const labels = within(mobileNav)
      .getAllByRole('link')
      .map((a) => a.textContent)
      .filter((t) => t !== 'お問い合わせ')
    expect(labels).toEqual(navItems.map((i) => i.label))
    expect(labels).toHaveLength(9)
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

  it('閉じているモバイルメニューは visibility: hidden（Tab・読み上げの対象外）で、開くと表示される', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header />)

    // jsdom は Tailwind の CSS を解釈しないため、付与されるクラスで確認する。
    const panel = document.querySelector('#mobile-menu > div') as HTMLElement
    expect(panel).toHaveClass('invisible')
    expect(panel).not.toHaveClass('visible')

    await user.click(screen.getByRole('button', { name: 'メニューを開く' }))
    expect(panel).toHaveClass('visible')
    expect(panel).not.toHaveClass('invisible')
  })

  it('開いている間は Escape で閉じ、フォーカスが開閉ボタンへ戻る', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header />)

    const toggle = screen.getByRole('button', { name: 'メニューを開く' })
    await user.click(toggle)
    const mobileNav = screen.getByRole('navigation', { name: 'モバイルナビゲーション' })
    within(mobileNav).getAllByRole('link')[0].focus()

    await user.keyboard('{Escape}')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveFocus()
  })

  it('開いている間の Tab は開閉ボタンとメニュー内の項目だけを巡回する', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header />)

    const toggle = screen.getByRole('button', { name: 'メニューを開く' })
    await user.click(toggle)
    const mobileNav = screen.getByRole('navigation', { name: 'モバイルナビゲーション' })
    const items = within(mobileNav).getAllByRole('link')
    const first = items[0]
    const last = items[items.length - 1]

    toggle.focus()
    await user.tab()
    expect(first).toHaveFocus()

    await user.tab({ shift: true })
    expect(toggle).toHaveFocus()

    await user.tab({ shift: true })
    expect(last).toHaveFocus()

    await user.tab()
    expect(toggle).toHaveFocus()
  })

  it('フォーカスがメニューの外（body 等）にあるときも、Tab でメニューへ入る', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header />)

    await user.click(screen.getByRole('button', { name: 'メニューを開く' }))
    const mobileNav = screen.getByRole('navigation', { name: 'モバイルナビゲーション' })
    const items = within(mobileNav).getAllByRole('link')

    // iOS Safari ではタップしてもボタンにフォーカスが移らない状況を再現する
    ;(document.activeElement as HTMLElement | null)?.blur()
    expect(document.body).toHaveFocus()
    await user.tab()
    expect(items[0]).toHaveFocus()

    ;(document.activeElement as HTMLElement | null)?.blur()
    await user.tab({ shift: true })
    expect(items[items.length - 1]).toHaveFocus()
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
