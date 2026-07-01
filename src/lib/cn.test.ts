import { describe, it, expect } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('複数のクラス名をスペース区切りで結合する', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('falsy な値（false / null / undefined / 空文字）を除外する', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b')
  })

  it('条件付きクラスの典型パターンで動作する', () => {
    const active = true
    const disabled = false
    expect(cn('base', active && 'active', disabled && 'disabled')).toBe('base active')
  })

  it('引数なしなら空文字を返す', () => {
    expect(cn()).toBe('')
  })
})
