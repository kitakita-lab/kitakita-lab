import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { About } from './About'
import { events } from '@/data/events'

describe('About', () => {
  it('現在の活動の補足と、開催実績・依頼条件への文字リンクが表示される', () => {
    const { container } = renderWithProviders(<About />)

    expect(container.textContent).toContain(
      '現在の活動のひとつが、ハンドメイドアクセサリーブランド ikyu と取り組むフラワーボトルづくり体験です。2026年6月から10月にかけて、札幌市・北広島市の商業施設や公共空間で8会期を開催。制作されたフラワーボトルは、計1,552本になりました。',
    )
    expect(screen.getByRole('link', { name: '開催実績を見る' })).toHaveAttribute('href', '/events')
    expect(screen.getByRole('link', { name: '開催のご相談について' })).toHaveAttribute(
      'href',
      '/workshop#consultation',
    )
  })

  // 実績の文は期間を区切って手で書く（イベントを追加しても自動では変わらない）。
  // ここでは、文に書いた期間に開催初日があるイベントだけを数え、会期数・制作数が一致するかを確かめる。
  // 期間の外にイベントを追加しても、このテストは変わらない。
  it('実績の文の会期数・制作数が、書いた期間内のイベントデータと一致する', () => {
    const { container } = renderWithProviders(<About />)
    const m = (container.textContent ?? '').match(
      /(\d{4})年(\d{1,2})月から(\d{1,2})月にかけて、[^。]*?(\d+)会期を開催。[^。]*?計([\d,]+)本/,
    )
    expect(m).not.toBeNull()
    const [, year, from, to, sessions, bottles] = m!
    const pad = (n: string) => n.padStart(2, '0')
    const start = `${year}-${pad(from)}-01`
    const end = `${year}-${pad(to)}-31`
    const inPeriod = events.filter((e) => e.dateISO >= start && e.dateISO <= end)

    expect(inPeriod).toHaveLength(Number(sessions))
    const counts = inPeriod.map((e) => {
      const stat = e.stats?.find((s) => s.label === 'フラワーボトル制作数')
      // 期間内のどの会期にも制作数があること（欠けたまま合計しない）
      expect(stat, e.slug).toBeDefined()
      return Number(stat!.value.replace(/[^\d]/g, ''))
    })
    expect(counts.reduce((a, b) => a + b, 0)).toBe(Number(bottles.replace(/,/g, '')))
  })
})
