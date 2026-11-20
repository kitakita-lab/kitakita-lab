import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, within } from '@/test/test-utils'
import { CreatorsPage } from './CreatorsPage'
import { applicationFields, creatorApplication, creatorRoles, isApplicationOpen } from '@/data/creators'

/**
 * 作家・つくり手・事業者の募集ページ（/creators）。
 * 応募フォームは、承認済みの URL とプライバシーポリシーがそろうまで導線を出さない。
 */
describe('CreatorsPage', () => {
  it('募集の目的・活動・実績（2026年6〜9月・6会期・計1,127本）を掲載する', () => {
    const { container } = renderWithProviders(<CreatorsPage />, { route: '/creators' })
    const text = container.textContent ?? ''
    expect(text).toContain('今回の募集は、今後のワークショップや体験イベントで、ご一緒できるかを考えていける')
    expect(text).toContain('6会期')
    expect(text).toContain('計1,127本')
    expect(text).toContain('2026年6月から9月にかけて、札幌市・北広島市の商業施設や公共空間で開催しました。')
    expect(screen.getByRole('link', { name: '開催実績を見る' })).toHaveAttribute('href', '/events')
  })

  it('案件・採用・契約・出店の機会を保証しない旨を掲載する', () => {
    const { container } = renderWithProviders(<CreatorsPage />, { route: '/creators' })
    expect(container.textContent).toContain('応募いただいても、案件のご依頼・採用・契約・出店の機会をお約束するものではありません。')
  })

  it('募集の方向性・応募後の流れ・フォームでお伺いすることを表示する', () => {
    const { container } = renderWithProviders(<CreatorsPage />, { route: '/creators' })
    for (const role of creatorRoles) {
      expect(role.titleSegments.join(''), role.title).toBe(role.title)
      expect(container.textContent).toContain(role.title)
    }
    expect(screen.getByRole('heading', { name: '応募後の流れ' })).toBeInTheDocument()
    for (const f of applicationFields) expect(container.textContent).toContain(f.label)
  })

  it('フォーム未公開の間は、フォームへのリンクを出さず「準備中」と /contact を案内する', () => {
    expect(isApplicationOpen()).toBe(false)
    const { container } = renderWithProviders(<CreatorsPage />, { route: '/creators' })
    const apply = container.querySelector<HTMLElement>('#apply')!
    expect(apply.textContent).toContain('応募フォームは、現在準備中です。')
    expect(within(apply).getByRole('link', { name: 'お問い合わせ' })).toHaveAttribute('href', '/contact')
    expect(container.querySelector('a[href*="docs.google.com/forms"], a[href*="forms.gle"]')).toBeNull()
  })

  it('ヘッダーのボタンは応募について（#apply）へ移動する', () => {
    renderWithProviders(<CreatorsPage />, { route: '/creators' })
    expect(screen.getByRole('link', { name: '応募について' })).toHaveAttribute('href', '/creators#apply')
  })
})

describe('isApplicationOpen（応募フォームの公開条件）', () => {
  it('フォーム URL とプライバシーポリシーの両方がそろうときだけ公開する', () => {
    expect(isApplicationOpen({ formUrl: 'https://forms.gle/abc', privacyPolicyPath: '/privacy' })).toBe(true)
    expect(isApplicationOpen({ formUrl: 'https://docs.google.com/forms/d/e/x/viewform', privacyPolicyPath: '/privacy' })).toBe(true)
    expect(isApplicationOpen({ formUrl: 'https://forms.gle/abc', privacyPolicyPath: null })).toBe(false)
    expect(isApplicationOpen({ formUrl: null, privacyPolicyPath: '/privacy' })).toBe(false)
  })

  it('Google フォーム以外の URL では公開しない', () => {
    expect(isApplicationOpen({ formUrl: 'https://example.com/form', privacyPolicyPath: '/privacy' })).toBe(false)
    expect(isApplicationOpen({ formUrl: 'http://forms.gle/abc', privacyPolicyPath: '/privacy' })).toBe(false)
  })

  it('現在の設定は未公開（URL・プライバシーポリシーとも未承認）', () => {
    expect(creatorApplication).toEqual({ formUrl: null, privacyPolicyPath: null })
  })
})
