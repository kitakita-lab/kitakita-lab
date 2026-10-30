import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest'
import { renderToString } from 'react-dom/server'
import { renderWithProviders } from '@/test/test-utils'
import { Hero } from './Hero'

// React は同じ警告を 1 回しか出さないため、どのテストが最初に描画しても拾えるよう、
// すべてのテストで描画の前から console.error を見張り、終わりに確かめる。
let error: MockInstance

beforeEach(() => {
  error = vi.spyOn(console, 'error')
})

afterEach(() => {
  const messages = error.mock.calls.map((args) => args.map(String).join(' '))
  vi.restoreAllMocks()
  // React が DOM の属性として認識しない prop（camelCase の fetchPriority など）の警告を出さない
  expect(messages.filter((m) => m.includes('does not recognize'))).toEqual([])
})

describe('Hero', () => {
  it('背景画像に読み込み優先度 high を、HTML の属性 fetchpriority として付ける', () => {
    const { container } = renderWithProviders(<Hero />)
    const img = container.querySelector('img')
    expect(img).not.toBeNull()
    expect(img).toHaveAttribute('fetchpriority', 'high')
  })

  it('プリレンダーの HTML にも fetchpriority="high" が出る', () => {
    expect(renderToString(<Hero />)).toContain('fetchpriority="high"')
  })
})
