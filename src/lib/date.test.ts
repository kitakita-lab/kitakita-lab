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

  it('閲覧者のタイムゾーンに関係なく同じ日付を表示する（UTC より西でも前日にならない）', () => {
    const original = process.env.TZ
    try {
      for (const tz of ['America/Los_Angeles', 'Asia/Tokyo', 'UTC']) {
        process.env.TZ = tz
        expect(formatDate('2026-06-01'), tz).toBe('2026.06.01')
        expect(formatDate('2026-08-31'), tz).toBe('2026.08.31')
      }
    } finally {
      process.env.TZ = original
    }
  })

  it('不正な日付文字列はそのまま返す（表示を壊さない）', () => {
    expect(formatDate('未定')).toBe('未定')
    expect(formatDate('')).toBe('')
  })
})
