import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { CreatorsPage } from './CreatorsPage'
import { site } from '@/data/site'
import { applicationFields, applicationMailSubject, buildApplicationMailto } from '@/data/creators'

describe('CreatorsPage（メールでの応募受付）', () => {
  it('応募先のメールアドレスと、件名・項目のひな形を入れた mailto リンクを表示する', () => {
    renderWithProviders(<CreatorsPage />, { route: '/creators' })

    expect(screen.getByText(site.email)).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /メールで応募する/ })
    expect(link).toHaveAttribute('href', buildApplicationMailto())
    const href = decodeURIComponent(link.getAttribute('href') ?? '')
    expect(href.startsWith(`mailto:${site.email}?subject=${applicationMailSubject}`)).toBe(true)
    for (const f of applicationFields) expect(href).toContain(f.label)
  })

  it('外部フォームへのリンクを置かない（応募はメールだけ）', () => {
    const { container } = renderWithProviders(<CreatorsPage />, { route: '/creators' })
    const hrefs = [...container.querySelectorAll('a')].map((a) => a.getAttribute('href') ?? '')
    expect(hrefs.some((h) => /forms\.gle|docs\.google\.com\/forms/.test(h))).toBe(false)
  })

  it('案件・採用・契約・報酬を約束しないこと、利用目的と運営主体を明記する', () => {
    const { container } = renderWithProviders(<CreatorsPage />, { route: '/creators' })
    const text = container.textContent ?? ''
    expect(text).toContain('お約束するものではありません')
    expect(text).toContain('ためにだけ使います')
    expect(text).toContain(site.operator)
  })

  it('実績の数字を直接書かず、Events へ案内する', () => {
    const { container } = renderWithProviders(<CreatorsPage />, { route: '/creators' })
    const text = container.textContent ?? ''
    expect(text).not.toMatch(/\d[\d,]*\s*(本|名|人|会期|回)/)
    expect(screen.getByRole('link', { name: 'Events' })).toHaveAttribute('href', '/events')
  })
})
