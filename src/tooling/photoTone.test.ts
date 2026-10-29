import { describe, it, expect } from 'vitest'
import { lightness, toneCurve, toneGainLut, lightnessStats, brightnessVerdict, parsePhotoSpec, SRGB_TO_LINEAR, EV_LIMIT } from '../../scripts/lib/photo-tone.mjs'

/**
 * 写真の明るさの監査と露出の補正（scripts/lib/photo-tone.mjs）のテスト。
 * L* の値は CIE の定義（Y = 0.18 の中間の灰色 ≈ L* 49.5）で確かめる。
 */
const hist = (ys: number[], bins = 1024) => {
  const h = new Array(bins).fill(0)
  for (const y of ys) h[Math.min(bins - 1, Math.floor(y * bins))]++
  return h
}

describe('lightness', () => {
  it('CIE L* の定義どおり（黒 0・中間の灰色 49.5・白 100）', () => {
    expect(lightness(0)).toBe(0)
    expect(lightness(0.18)).toBeCloseTo(49.5, 1)
    expect(lightness(1)).toBeCloseTo(100, 5)
  })

  it('sRGB の対応表は 0 → 0、255 → 1、128 → 約 0.216', () => {
    expect(SRGB_TO_LINEAR[0]).toBe(0)
    expect(SRGB_TO_LINEAR[255]).toBeCloseTo(1, 10)
    expect(SRGB_TO_LINEAR[128]).toBeCloseTo(0.2158, 3)
  })
})

describe('toneCurve / toneGainLut', () => {
  it('黒と白は動かさない（白飛びを作らない）', () => {
    for (const ev of [-1, -0.3, 0.3, 0.6, 1]) {
      expect(toneCurve(0, ev)).toBe(0)
      expect(toneCurve(1, ev)).toBeCloseTo(1, 12)
    }
  })

  it('+0.5ev で中間の灰色（L* 49.5）が約 55.8 に上がる（控えめな持ち上げ）', () => {
    expect(lightness(toneCurve(0.18, 0.5))).toBeCloseTo(55.8, 0)
  })

  it('単調増加で、プラスは明るく・マイナスは暗くする', () => {
    let prev = -1
    for (let y = 0; y <= 1; y += 0.01) {
      const v = toneCurve(y, 0.6)
      expect(v).toBeGreaterThanOrEqual(prev)
      expect(v).toBeGreaterThanOrEqual(y - 1e-12)
      expect(toneCurve(y, -0.6)).toBeLessThanOrEqual(y + 1e-12)
      prev = v
    }
  })

  it('補正なし（0ev）は倍率がすべて 1', () => {
    expect(toneGainLut(0, 16).every((k) => Math.abs(k - 1) < 1e-12)).toBe(true)
  })

  it(`±${EV_LIMIT}ev を超える指定・数値でない指定は受け付けない`, () => {
    expect(() => toneGainLut(1.5)).toThrow()
    expect(() => toneGainLut(-2)).toThrow()
    expect(() => toneGainLut(Number.NaN)).toThrow()
  })
})

describe('lightnessStats / brightnessVerdict', () => {
  it('すべて中間の灰色なら中央値 L* ≈ 49.5、暗部・白飛び 0', () => {
    const s = lightnessStats(hist(new Array(100).fill(0.18)))
    expect(s.median).toBeCloseTo(49.5, 0)
    expect(s.shadowShare).toBe(0)
    expect(s.highlightShare).toBe(0)
  })

  it('画素がなければ例外（判定しない）', () => {
    expect(() => lightnessStats(new Array(1024).fill(0))).toThrow()
  })

  it('中央値 L* が 42 未満なら dark（ザ・ビッグ厚別店の補正前: 36.4）', () => {
    expect(brightnessVerdict({ mean: 37.7, p05: 10, median: 36.4, p95: 80, shadowShare: 0.37, highlightShare: 0 }).level).toBe('dark')
  })

  it('暗部が多くても、中央値が基準以上なら dark にしない（黒い服・椅子は露出の不足ではない）', () => {
    expect(brightnessVerdict({ mean: 45, p05: 8, median: 43.1, p95: 82, shadowShare: 0.32, highlightShare: 0 }).level).toBe('ok')
  })

  it('L* 97 超が 5% を超えれば bright（白飛び・補正しすぎ）', () => {
    expect(brightnessVerdict({ mean: 70, p05: 30, median: 72, p95: 99, shadowShare: 0, highlightShare: 0.06 }).level).toBe('bright')
  })

  it('公開済みの基準どおりの明るさ（中央値 49.8〜69.5）は ok', () => {
    for (const median of [49.8, 51.8, 56.1, 63.1, 67.7, 69.5]) {
      expect(brightnessVerdict({ mean: median, p05: 10, median, p95: 85, shadowShare: 0.15, highlightShare: 0.01 }).level).toBe('ok')
    }
  })
})

describe('parsePhotoSpec', () => {
  it('従来の指定（比率・中心）はそのまま読める（補正なし・切り抜き 100%）', () => {
    expect(parsePhotoSpec('venue=/p/a.jpg:4x3@53%,50%')).toEqual({ name: 'venue', file: '/p/a.jpg', ratio: '4x3', zoom: 1, fx: 0.53, fy: 0.5, ev: 0 })
    expect(parsePhotoSpec('hero=/p/a.jpg:16x9')).toMatchObject({ ratio: '16x9', zoom: 1, fx: 0.5, fy: 0.5, ev: 0 })
  })

  it('切り抜きの大きさと露出の補正を読む', () => {
    expect(parsePhotoSpec('hero=/p/a.jpg:16x9*67%@50%,100%')).toMatchObject({ zoom: 0.67, fx: 0.5, fy: 1, ev: 0 })
    expect(parsePhotoSpec('hero=/p/a.jpg:16x9+0.6ev')).toMatchObject({ ev: 0.6 })
    expect(parsePhotoSpec('hero=/p/a.jpg:16x9*80%@40%,60%-0.2ev')).toMatchObject({ zoom: 0.8, ev: -0.2 })
  })

  it('範囲外の指定は受け付けない（大きすぎる補正・寄せすぎ）', () => {
    expect(() => parsePhotoSpec('hero=/p/a.jpg:16x9+1.5ev')).toThrow()
    expect(() => parsePhotoSpec('hero=/p/a.jpg:16x9*30%')).toThrow()
    expect(() => parsePhotoSpec('hero=/p/a.jpg:16x9@150%,50%')).toThrow()
    expect(() => parsePhotoSpec('Hero=/p/a.jpg')).toThrow()
  })
})
