import { describe, it, expect } from 'vitest'
import { formatDate } from './date'

describe('formatDate', () => {
  it('ISO 日付を YYYY.MM.DD 形式に変換する', () => {
    expect(formatDate('2025-04-01')).toBe('2025.04.01')
  })

  it('月・日を 2 桁にゼロ埋めする', () => {
    expect(formatDate('2025-01-05')).toBe('2025.01.05')
    expect(formatDate('2025-12-31')).toBe('2025.12.31')
  })

  it('不正な日付文字列はそのまま返す（表示を壊さない）', () => {
    expect(formatDate('未定')).toBe('未定')
    expect(formatDate('')).toBe('')
  })
})
