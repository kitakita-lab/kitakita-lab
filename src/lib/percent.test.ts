import { describe, it, expect } from 'vitest'
import { percent, formatPercent, formatRatio, formatCount } from './percent'

describe('percent', () => {
  it('小数第1位に四捨五入する', () => {
    expect(percent(427, 1023)).toBe(41.7)
    expect(percent(324, 538)).toBe(60.2)
    expect(percent(103, 485)).toBe(21.2)
  })

  it('ちょうど .x5 のときは切り上げる（126/224 = 56.25%）', () => {
    expect(percent(126, 224)).toBe(56.3)
  })

  it('対象人数が 0 なら 0', () => {
    expect(percent(1, 0)).toBe(0)
  })

  it('表示形式', () => {
    expect(formatPercent(604, 1023)).toBe('59.0%')
    expect(formatCount(1023)).toBe('1,023')
    expect(formatRatio(427, 1023)).toBe('427/1,023名（41.7%）')
  })
})
