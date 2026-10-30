import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { CollaborationPage } from './CollaborationPage'

/**
 * Collaboration（/collaboration）の相談導線。
 * 担当できる範囲を示しつつ、実績のない仕事を実績のように書かないことを守る。
 */
describe('CollaborationPage', () => {
  it('「一緒に担当できること」に5つの領域が並ぶ', () => {
    renderWithProviders(<CollaborationPage />, { route: '/collaboration' })

    const heading = screen.getByRole('heading', { name: '一緒に担当できること' })
    const block = heading.closest('div')!.parentElement!
    for (const text of [
      '体験イベント・ワークショップの企画',
      '開催に向けた準備と、会場のレイアウト',
      '当日の運営と、スタッフの体制',
      '参加状況の集計と、実施報告',
      '必要に応じて、企画や調査、改善のご提案',
    ]) {
      expect(block).toHaveTextContent(text)
    }
    expect(screen.getByRole('link', { name: '開催実績' })).toHaveAttribute('href', '/events')
    expect(screen.getByRole('link', { name: 'Research' })).toHaveAttribute('href', '/research')
  })

  it('実績のない仕事を、提供実績や常設サービスのように書かない', () => {
    const { container } = renderWithProviders(<CollaborationPage />, { route: '/collaboration' })
    const text = container.textContent ?? ''

    expect(text).not.toContain('ノベルティ')
    expect(text).not.toMatch(/POP|Web制作|資料制作/)
    // ブランドとの協業・社内イベントは「ご相談いただけます」として書く
    expect(text).toContain('ブランドとの協業や、社内イベントでの開催も、ご相談いただけます。')
  })

  it('予算や開催時期が未定でも相談できることを伝える', () => {
    renderWithProviders(<CollaborationPage />, { route: '/collaboration' })
    expect(screen.getByText(/予算・開催時期が決まっていない段階でも大丈夫です/)).toBeInTheDocument()
  })
})
