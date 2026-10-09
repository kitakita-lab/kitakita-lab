import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, within } from '@/test/test-utils'
import { WorkshopPage } from './WorkshopPage'

/**
 * 依頼条件カードは、1 枚資料の裏面と共通の確定原稿（Version4 第3章）。
 * データを経由せず原稿の文をそのまま書き、描画結果と一字一句一致することを確かめる。
 */
const MANUSCRIPT = [
  'ワークショップ開催のご相談について',
  'ご依頼いただける内容',
  'ハンドメイドアクセサリーブランド ikyu による、フラワーボトルづくり体験です。企画・当日運営・実施報告は KitaKita Lab が担当します。',
  'これまでの開催では',
  '2026年6月から9月にかけて、札幌市・北広島市の商業施設や公共空間で6会期の開催実績があります',
  '参加無料・予約不要の形式で開催しています',
  '1組あたりの制作時間は、おおむね10〜15分です',
  '材料と道具は、こちらで用意して持ち込んでいます',
  '開催後には、参加組数や時間帯などをまとめた実施報告書をお渡ししています',
  '各回の参加組数・人数は、開催実績ページでご覧いただけます',
  '会場や内容に合わせて、ご相談のうえ決めること',
  '同時に制作できる組数と、必要なスペース',
  '運営スタッフの人数',
  '開催日数と時間帯',
  'テーブル・椅子などの什器',
  '開催地域（札幌市・北広島市以外での開催もご相談ください）',
  '費用について',
  '会場や開催条件をお伺いしたうえで、個別にお見積もりします。',
  'お見積もりの際にお伺いすること',
  '1.開催の時期・日数・時間帯',
  '2.施設名と開催スペース（おおよその広さ、屋内か屋外か）',
  '3.開催の目的',
  '4.想定している来場者層と規模',
  '5.参加費をいただく形式かどうか',
  '6.什器や電源のご用意',
  '開催時期や会場がまだ決まっていない段階でも、ご相談いただけます。わかる範囲で、お気軽にお知らせください。',
  'お問い合わせ',
  '開催実績を見る',
]

function card() {
  const { container } = renderWithProviders(<WorkshopPage />, { route: '/workshop' })
  const el = container.querySelector<HTMLElement>('#consultation')
  if (!el) throw new Error('依頼条件カードが見つからない')
  // 見出しは h2（ページの章立ての一つとして読み上げる）
  expect(el.querySelector('h2')?.textContent).toBe('ワークショップ開催のご相談について')
  return el
}

describe('WorkshopPage 依頼条件カード', () => {
  it('原稿の文が、順番どおり一字一句そのまま表示される', () => {
    const text = card().textContent ?? ''
    let from = 0
    for (const line of MANUSCRIPT) {
      const at = text.indexOf(line, from)
      expect(at, line).toBeGreaterThanOrEqual(from)
      from = at + line.length
    }
    // 原稿にない文が混ざっていない（原稿の文をつなげた長さと一致）
    expect(text.length).toBe(MANUSCRIPT.join('').length)
  })

  it('「お問い合わせ」は /contact、「開催実績を見る」は /events へリンクする', () => {
    const el = card()
    expect(within(el).getByRole('link', { name: 'お問い合わせ' })).toHaveAttribute('href', '/contact')
    expect(within(el).getByRole('link', { name: '開催実績を見る' })).toHaveAttribute('href', '/events')
  })

  it('Scenes の直後、Flow の前に置かれる', () => {
    const el = card()
    const scenes = screen.getByText('Scenes')
    const flow = screen.getByText('Flow')
    expect(scenes.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(el.compareDocumentPosition(flow) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
