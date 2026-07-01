import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/test-utils'
import { ContactForm } from './ContactForm'

describe('ContactForm', () => {
  it('すべての入力項目と送信ボタンが表示される', () => {
    renderWithProviders(<ContactForm />)

    expect(screen.getByLabelText(/お名前/)).toBeInTheDocument()
    expect(screen.getByLabelText(/メールアドレス/)).toBeInTheDocument()
    expect(screen.getByLabelText('お問い合わせ種別')).toBeInTheDocument()
    expect(screen.getByLabelText(/お問い合わせ内容/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /送信する/ })).toBeInTheDocument()
  })

  it('未入力で送信すると必須項目のエラーが表示される', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ContactForm />)

    await user.click(screen.getByRole('button', { name: /送信する/ }))

    expect(screen.getByText('お名前を入力してください。')).toBeInTheDocument()
    expect(screen.getByText('メールアドレスを入力してください。')).toBeInTheDocument()
    expect(screen.getByText('お問い合わせ内容を入力してください。')).toBeInTheDocument()

    // aria-invalid が設定され、エラーと入力欄が関連付けられている
    expect(screen.getByLabelText(/お名前/)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText(/お名前/)).toHaveAttribute(
      'aria-describedby',
      'name-error',
    )
  })

  it('メールアドレスの形式が不正な場合にエラーが表示される', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ContactForm />)

    await user.type(screen.getByLabelText(/お名前/), 'テスト太郎')
    await user.type(screen.getByLabelText(/メールアドレス/), 'not-an-email')
    await user.type(screen.getByLabelText(/お問い合わせ内容/), 'テストです。')
    await user.click(screen.getByRole('button', { name: /送信する/ }))

    expect(
      screen.getByText('メールアドレスの形式が正しくありません。'),
    ).toBeInTheDocument()
    // 送信は行われない（成功画面に遷移しない）
    expect(screen.queryByText('送信ありがとうございます')).not.toBeInTheDocument()
  })

  it('入力し直すとエラーが解消される', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ContactForm />)

    await user.click(screen.getByRole('button', { name: /送信する/ }))
    expect(screen.getByText('お名前を入力してください。')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/お名前/), 'テ')
    expect(screen.queryByText('お名前を入力してください。')).not.toBeInTheDocument()
  })

  it('お問い合わせ種別を選択できる', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ContactForm />)

    const select = screen.getByLabelText('お問い合わせ種別')
    await user.selectOptions(select, '取材・メディア')
    expect(select).toHaveValue('取材・メディア')
  })

  it('正常入力で送信すると完了画面（モック）が表示される', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ContactForm />)

    await user.type(screen.getByLabelText(/お名前/), 'テスト太郎')
    await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
    await user.type(screen.getByLabelText(/お問い合わせ内容/), 'よろしくお願いします。')
    await user.click(screen.getByRole('button', { name: /送信する/ }))

    // 完了メッセージが status ロールで通知される（スクリーンリーダー対応）
    expect(screen.getByRole('status')).toHaveTextContent('送信ありがとうございます')
    // フォームは非表示になる
    expect(screen.queryByRole('button', { name: /送信する/ })).not.toBeInTheDocument()
  })

  it('完了画面から「別の内容を送る」で空のフォームに戻る', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ContactForm />)

    await user.type(screen.getByLabelText(/お名前/), 'テスト太郎')
    await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
    await user.type(screen.getByLabelText(/お問い合わせ内容/), 'テスト。')
    await user.click(screen.getByRole('button', { name: /送信する/ }))
    await user.click(screen.getByRole('button', { name: '別の内容を送る' }))

    // フォームが再表示され、入力はリセットされている
    expect(screen.getByLabelText(/お名前/)).toHaveValue('')
    expect(screen.getByLabelText(/メールアドレス/)).toHaveValue('')
    expect(screen.getByLabelText(/お問い合わせ内容/)).toHaveValue('')
  })
})
