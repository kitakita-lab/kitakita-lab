import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { About } from './About'

describe('About', () => {
  it('現在の活動の補足と、開催実績・依頼条件への文字リンクが表示される', () => {
    const { container } = renderWithProviders(<About />)

    expect(container.textContent).toContain(
      '現在の活動のひとつが、ハンドメイドアクセサリーブランド ikyu と取り組むフラワーボトルづくり体験です。2026年6月から9月にかけて、札幌市・北広島市の商業施設や公共空間で6会期を開催。制作されたフラワーボトルは、計1,127本になりました。',
    )
    expect(screen.getByRole('link', { name: '開催実績を見る' })).toHaveAttribute('href', '/events')
    expect(screen.getByRole('link', { name: '開催のご相談について' })).toHaveAttribute(
      'href',
      '/workshop#consultation',
    )
  })
})
