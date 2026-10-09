import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import { ContactPage } from './ContactPage'
import { site } from '@/data/site'

describe('ContactPage', () => {
  it('メールアドレスが表示され、入力フォームは表示されない', () => {
    renderWithProviders(<ContactPage />, { route: '/contact' })

    expect(screen.getByText(site.email)).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('「メールで問い合わせる」は件名を初期入力した mailto リンクになる', () => {
    renderWithProviders(<ContactPage />, { route: '/contact' })

    const link = screen.getByRole('link', { name: /メールで問い合わせる/ })
    expect(link).toHaveAttribute(
      'href',
      `mailto:${site.email}?subject=${encodeURIComponent('KitaKita Labへのお問い合わせ')}`,
    )
  })

  it('「アドレスをコピー」でクリップボードにコピーし、完了を表示する', async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()
    renderWithProviders(<ContactPage />, { route: '/contact' })

    await user.click(screen.getByRole('button', { name: 'アドレスをコピー' }))

    expect(writeText).toHaveBeenCalledWith(site.email)
    expect(screen.getByRole('status')).toHaveTextContent('メールアドレスをコピーしました。')
  })

  it('コピーに失敗した場合は、手動でコピーするよう案内する', async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'))
    renderWithProviders(<ContactPage />, { route: '/contact' })

    await user.click(screen.getByRole('button', { name: 'アドレスをコピー' }))

    expect(screen.getByRole('status')).toHaveTextContent('手動でコピーしてください')
  })

  it('連携のご相談が「お待ちしています」の先頭に表示される', () => {
    renderWithProviders(<ContactPage />, { route: '/contact' })

    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('企業・商業施設・自治体・教育機関との連携のご相談')
  })
})
