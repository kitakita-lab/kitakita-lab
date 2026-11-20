import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { CreatorsPage } from './CreatorsPage'

/**
 * 応募フォームを公開したあとの表示（URL とプライバシーポリシーを設定した状態）。
 * 実際の設定（src/data/creators.ts）は未公開のまま。ここでは設定だけを差し替えて確かめる。
 */
vi.mock('@/data/creators', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/creators')>()
  const config = { formUrl: 'https://forms.gle/example', privacyPolicyPath: '/privacy' }
  return { ...actual, creatorApplication: config, isApplicationOpen: () => actual.isApplicationOpen(config) }
})

describe('CreatorsPage（応募フォーム公開後）', () => {
  it('応募フォームのボタンは別タブで開き、プライバシーポリシーへのリンクを添える', () => {
    const { container } = renderWithProviders(<CreatorsPage />, { route: '/creators' })
    const form = screen.getByRole('link', { name: '応募フォームへ' })
    expect(form).toHaveAttribute('href', 'https://forms.gle/example')
    expect(form).toHaveAttribute('target', '_blank')
    expect(form).toHaveAttribute('rel', expect.stringContaining('noopener'))
    expect(screen.getByRole('link', { name: 'プライバシーポリシー' })).toHaveAttribute('href', '/privacy')
    expect(container.textContent).not.toContain('現在準備中')
  })
})
