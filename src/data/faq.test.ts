import { describe, it, expect } from 'vitest'
import { faqItems } from './faq'

/** FAQ データ。企業向けの相談前の質問と、実績と今後の相談を混同しない書き方を守る。 */
describe('faqItems', () => {
  const byId = (id: string) => faqItems.find((f) => f.id === id)

  it('id が重複しない', () => {
    const ids = faqItems.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('企業向けに、予算・範囲・実施報告・地域の質問がある', () => {
    for (const id of ['consult-before-budget', 'consult-scope', 'report-after-event', 'area-outside-sapporo']) {
      expect(byId(id)?.audience, id).toBe('企業・自治体の方')
    }
  })

  it('実施報告は、すべての案件で必ず提出する約束にしない', () => {
    const answer = byId('report-after-event')!.answer
    expect(answer).toContain('開催内容に応じて')
    expect(answer).not.toMatch(/必ず|お渡ししています|提出します/)
  })

  it('自治体・教育機関やブランドとの協業は、実績ではなく相談できる領域として書く', () => {
    const answer = byId('corporate-collab-inquiry')!.answer
    expect(answer).toContain('これまでは主に、商業施設での体験イベント・ワークショップの企画と運営')
    expect(answer).toContain('自治体・教育機関との企画も、目的に合わせてご相談いただけます')
    expect(answer).not.toContain('設計します')
  })
})
