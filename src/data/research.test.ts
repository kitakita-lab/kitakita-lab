import { describe, it, expect } from 'vitest'
import { researchReports } from './research'
import { events } from './events'
import { newsItems } from './news'
import { percent } from '@/lib/percent'

/**
 * Research データの整合テスト。
 * - 本文中の「人数/対象人数名（割合）」をすべて検算する（手書きの数字のずれを防ぐ）
 * - 図の人数が対象人数を超えない、積み上げの区分が対象人数と一致する
 * - 見出しの分割が見出しと一致する
 */

const toNum = (s: string) => Number(s.replace(/,/g, ''))
const RATIO = /(\d[\d,]*)\/(\d[\d,]*)名（(\d+\.\d)%）/g

function allTexts(r: (typeof researchReports)[number]): string[] {
  return [
    r.summary,
    r.description,
    ...r.intro,
    ...r.readingNotes,
    ...r.sections.flatMap((s) => [...s.lead, s.reading ?? '']),
  ]
}

describe('researchReports', () => {
  it('slug・title・summary が空でなく、slug は一意', () => {
    expect(researchReports.length).toBeGreaterThan(0)
    const slugs = new Set(researchReports.map((r) => r.slug))
    expect(slugs.size).toBe(researchReports.length)
    for (const r of researchReports) {
      expect(r.slug).toMatch(/^[a-z0-9-]+$/)
      expect(r.title.trim().length, r.slug).toBeGreaterThan(0)
      expect(r.summary.trim().length, r.slug).toBeGreaterThan(0)
    }
  })

  it('本文中の「人数/対象人数名（割合）」はすべて計算と一致する', () => {
    let checked = 0
    for (const r of researchReports) {
      for (const text of allTexts(r)) {
        for (const m of text.matchAll(RATIO)) {
          const [, c, n, p] = m
          expect(percent(toNum(c), toNum(n)).toFixed(1), `${r.slug}: ${m[0]}`).toBe(p)
          expect(toNum(c), m[0]).toBeLessThanOrEqual(toNum(n))
          checked++
        }
      }
    }
    expect(checked).toBeGreaterThan(20)
  })

  it('description の割合は要点の数字と一致する', () => {
    for (const r of researchReports) {
      for (const k of r.keyFindings) {
        const p = percent(k.count, k.n).toFixed(1)
        expect(r.description, `${r.slug}: ${k.label}`).toContain(`${p}%`)
      }
    }
  })

  it('図の人数は対象人数を超えず、積み上げは区分の合計が対象人数と一致する', () => {
    for (const r of researchReports) {
      for (const s of r.sections) {
        for (const f of s.figures) {
          if (f.kind === 'bars') {
            for (const b of f.items) expect(b.count, `${s.id}: ${b.label}`).toBeLessThanOrEqual(b.n)
          } else if (f.kind === 'stacked') {
            for (const row of f.rows) {
              expect(row.counts.length, `${s.id}: ${row.label}`).toBe(f.legend.length)
              expect(row.counts.reduce((a, b) => a + b, 0), `${s.id}: ${row.label}`).toBe(row.n)
            }
          } else {
            for (const item of f.items) {
              expect(item.counts.length).toBe(f.groups.length)
              item.counts.forEach((c, g) => expect(c).toBeLessThanOrEqual(f.groups[g].n))
            }
          }
        }
      }
    }
  })

  it('主要な数字（再検証済み）', () => {
    const r = researchReports.find((x) => x.slug === 'hokkaido-mall-workshop-demand-2026')!
    const intent = r.sections.find((s) => s.id === 'intent')!.figures[0]
    expect(intent.kind).toBe('stacked')
    if (intent.kind === 'stacked') {
      const pos = (i: number) => intent.rows[i].counts[0] + intent.rows[i].counts[1]
      expect([pos(0), intent.rows[0].n]).toEqual([427, 1023])
      expect([pos(1), intent.rows[1].n]).toEqual([203, 311])
      expect([pos(2), intent.rows[2].n]).toEqual([224, 712])
    }
    const freq = r.sections.find((s) => s.id === 'frequency')!.figures
    if (freq[0].kind === 'bars' && freq[1].kind === 'bars') {
      expect(freq[0].items.map((i) => [i.count, i.n])).toEqual([
        [324, 538],
        [103, 485],
      ])
      // 詳細 7 区分の合計が、月1回以上／未満と一致する
      const detail = freq[1].items
      const sum = (xs: typeof detail) => xs.reduce((a, b) => [a[0] + b.count, a[1] + b.n], [0, 0])
      expect(sum(detail.slice(0, 4))).toEqual([324, 538])
      expect(sum(detail.slice(4))).toEqual([103, 485])
    }
  })

  it('見出しの分割は連結すると見出しに一致する', () => {
    for (const r of researchReports) {
      if (r.titleSegments) {
        expect(r.titleSegments.join(''), r.slug).toBe(r.title)
        for (const seg of r.titleSegments) expect(seg.length, seg).toBeLessThanOrEqual(11)
      }
      for (const s of r.sections) {
        if (s.headingSegments) expect(s.headingSegments.join(''), s.id).toBe(s.heading)
      }
    }
  })

  it('関連実績の slug は events に存在する', () => {
    for (const r of researchReports) {
      for (const slug of r.relatedEventSlugs) {
        expect(events.some((e) => e.slug === slug), slug).toBe(true)
      }
    }
  })

  it('掲載しない名称を含まない', () => {
    const forbidden = ['株式会社all', 'PR TIMES', 'サクリサ', '当社', '弊社']
    const texts = [
      ...researchReports.flatMap((r) => [...allTexts(r), ...r.overview.map((o) => o.value), ...r.sample]),
      ...newsItems.flatMap((n) => [n.title, n.excerpt, ...n.body]),
    ]
    for (const t of texts) {
      for (const word of forbidden) expect(t, word).not.toContain(word)
    }
  })

  it('調査レポートへのリンクは実在するレポートを指す', () => {
    for (const n of newsItems) {
      for (const link of n.links ?? []) {
        if (!link.href.startsWith('/research/')) continue
        const slug = link.href.replace('/research/', '')
        expect(researchReports.some((r) => r.slug === slug), link.href).toBe(true)
      }
    }
  })
})
