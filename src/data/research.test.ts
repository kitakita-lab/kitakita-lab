import { describe, it, expect } from 'vitest'
import { researchReports } from './research'

/**
 * Research データの整合テスト。
 * 見出しの折り返し制御（titleSegments）が title と食い違わないこと、
 * 320px 幅のカードで各文節が収まる長さであることを保証する。
 */
describe('researchReports', () => {
  it('title・summary・topics・status が空でない', () => {
    expect(researchReports.length).toBeGreaterThan(0)
    for (const r of researchReports) {
      expect(r.title.trim().length, r.id).toBeGreaterThan(0)
      expect(r.summary.trim().length, r.id).toBeGreaterThan(0)
      expect(r.status.trim().length, r.id).toBeGreaterThan(0)
      expect(r.topics.length, r.id).toBeGreaterThan(0)
    }
  })

  it('titleSegments は連結すると title に一致し、各文節は 11 文字以内', () => {
    for (const r of researchReports) {
      if (!r.titleSegments) continue
      expect(r.titleSegments.join(''), r.id).toBe(r.title)
      for (const seg of r.titleSegments) {
        expect(seg.length, `${r.id}: 「${seg}」`).toBeLessThanOrEqual(11)
      }
    }
  })
})
