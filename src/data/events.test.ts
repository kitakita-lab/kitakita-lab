import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { inspectImageMetadata } from '../../scripts/lib/image-metadata.mjs'
import { events, sortedEvents, brandJourney } from './events'
import { scriptSegments } from '../lib/typo'

/**
 * イベント実績データの整合性テスト。
 * 「壊れたデータ（URL衝突・リンク切れ・h1とSEOタイトルの乖離）を本番に出さない」ためのガード。
 */
describe('events データ', () => {
  it('slug が一意である（詳細ページの URL 衝突防止）', () => {
    const slugs = events.map((e) => e.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('dateISO が有効な ISO 形式（YYYY-MM-DD）である', () => {
    for (const e of events) {
      expect(e.dateISO, `${e.slug} の dateISO`).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(Number.isNaN(new Date(e.dateISO).getTime())).toBe(false)
    }
  })

  it('sortedEvents は開催日の新しい順に並んでいる', () => {
    for (let i = 1; i < sortedEvents.length; i++) {
      const prev = new Date(sortedEvents[i - 1].dateISO).getTime()
      const curr = new Date(sortedEvents[i].dateISO).getTime()
      expect(prev).toBeGreaterThanOrEqual(curr)
    }
  })

  it('画像パスは public 直下からの絶対パスである', () => {
    for (const e of events) {
      const srcs = [
        e.heroImage?.src,
        e.heroImageMobile?.src,
        ...(e.photos?.map((p) => p.src) ?? []),
      ].filter((s): s is string => Boolean(s))
      for (const src of srcs) {
        expect(src, `${e.slug} の画像パス`).toMatch(/^\/.+\.(jpg|jpeg|png|webp)$/)
      }
    }
  })

  it('titleLines は title を意味の単位で分割したものと一致する（h1 と SEO タイトルの乖離防止）', () => {
    for (const e of events) {
      if (!e.titleLines) continue
      const [first, second] = e.titleLines
      expect(first.length, `${e.slug} の titleLines[0]`).toBeGreaterThan(0)
      expect(second.length, `${e.slug} の titleLines[1]`).toBeGreaterThan(0)
      // 「企画名」実施内容 のように連結するか、会場名 実施内容 のように半角スペースで連結する
      expect([first + second, `${first} ${second}`], `${e.slug} の titleLines`).toContain(e.title)
    }
  })

  it('開催概要（overview）と要約（excerpt）が空でない', () => {
    for (const e of events) {
      expect(e.overview.length, `${e.slug} の overview`).toBeGreaterThan(0)
      expect(e.excerpt.trim().length, `${e.slug} の excerpt`).toBeGreaterThan(0)
    }
  })
})

/**
 * 公開前チェック（実績更新ハーネス。docs/EVENT-UPDATE.md）。
 * 実施報告書と写真から実績を追加するときに、機械的に判定できるものをここで止める。
 * 文章の自然さ・写真の公開可否など、機械で判定できないものは EVENT-UPDATE.md のチェックリストで扱う。
 */
describe('events データ（公開前チェック）', () => {
  const PUBLIC_DIR = path.resolve(process.cwd(), 'public')
  const MAX_IMAGE_BYTES = 500 * 1024
  const images = (e: (typeof events)[number]) =>
    [
      e.heroImage && { src: e.heroImage.src, alt: e.heroImage.alt },
      e.heroImageMobile && { src: e.heroImageMobile.src, alt: e.heroImage?.alt ?? '' },
      ...(e.photos ?? []),
    ].filter((x): x is { src: string; alt: string } => Boolean(x))

  it('画像ファイルが実在し、500KB 以下で、撮影情報・位置情報などのメタデータを含まない', () => {
    for (const e of events) {
      for (const { src } of images(e)) {
        const file = path.join(PUBLIC_DIR, src)
        expect(fs.existsSync(file), `${e.slug}: ${src} が public/ にない`).toBe(true)
        const buf = fs.readFileSync(file)
        expect(buf.length, `${e.slug}: ${src} のサイズ`).toBeLessThanOrEqual(MAX_IMAGE_BYTES)
        // ファイル構造をたどり、表示に必要な部分以外（EXIF・XMP・IPTC・PNG/WebP のテキストや EXIF など）がないこと。
        // 解析できない画像も合格にしない（scripts/lib/image-metadata.mjs）。写真は prepare-event-photos.mjs で書き出す
        const meta = inspectImageMetadata(buf)
        expect(meta.error, `${e.slug}: ${src} を解析できない`).toBeUndefined()
        expect(meta.findings, `${e.slug}: ${src} にメタデータが残っている`).toEqual([])
        expect(meta.ok, `${e.slug}: ${src}`).toBe(true)
      }
    }
  })

  it('画像の alt が空でなく、ファイル名のままでもない', () => {
    for (const e of events) {
      for (const { src, alt } of images(e)) {
        expect(alt.trim().length, `${e.slug}: ${src} の alt`).toBeGreaterThan(5)
        expect(alt, `${e.slug}: ${src} の alt`).not.toMatch(/\.(jpe?g|png|webp)$|^IMG_|^DSC/i)
      }
    }
  })

  it('dateISO は会期（dateLabel）の初日と一致する', () => {
    for (const e of events) {
      const m = e.dateLabel.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日/)
      expect(m, `${e.slug} の dateLabel`).not.toBeNull()
      const [, y, mo, d] = m!
      expect(e.dateISO, `${e.slug}`).toBe(`${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`)
    }
  })

  it('日別の数字の合計が参加実績（組数・人数・制作数）と一致する', () => {
    const stat = (e: (typeof events)[number], label: string) => {
      const v = e.stats?.find((s) => s.label === label)?.value
      return v === undefined ? undefined : Number(v.replace(/[^\d]/g, ''))
    }
    for (const e of events) {
      const days = e.dayReports ?? []
      if (days.length === 0) continue
      for (const [unit, label] of [
        ['組', '総参加組数'],
        ['名', '総参加人数'],
        ['本', 'フラワーボトル制作数'],
      ] as const) {
        // 各日の本文で最初に出てくる「N組」「N名」「N本」をその日の数字とする（全日にある場合だけ検算）
        const nums = days.map((d) => d.body.match(new RegExp(`(\\d+)${unit}`))?.[1])
        const total = stat(e, label)
        if (total === undefined || nums.some((n) => n === undefined)) continue
        expect(nums.reduce((a, n) => a + Number(n), 0), `${e.slug}: 日別の${unit}の合計`).toBe(total)
      }
      const dayCount = e.stats?.map((s) => s.value.match(/^(\d+)日間$/)?.[1]).find(Boolean)
      if (dayCount) expect(days.length, `${e.slug}: 開催日数と日別レポートの数`).toBe(Number(dayCount))
    }
  })

  it('統計のラベルは、区切り（文字種の切り替わり）ごとに 8 文字以内（320px 幅のカードに収まる）', () => {
    // 実績ページの統計カードは 320px 幅で文字の幅が約 100px（12px の文字で 8 文字）。ラベルは区切りの位置でだけ折り返す
    // （EventDetailPage の break-keep と scriptBreaks）ため、区切りが長いとはみ出す
    for (const e of events) {
      for (const s of e.stats ?? []) {
        for (const seg of scriptSegments(s.label)) expect(seg.length, `${e.slug}: 「${s.label}」の「${seg}」`).toBeLessThanOrEqual(8)
      }
    }
  })

  it('報告書の宛先・企業名・連絡先を掲載しない', () => {
    // 実施報告書にある提出先（「〜 御中」）、企業名、担当者のメールアドレスなど
    const forbidden = [/御中/, /株式会社/, /J\.?C\.?O\.?S/i, /[\w.+-]+@[\w-]+\.[\w.]+/, /担当[:：]/]
    for (const e of events) {
      const text = JSON.stringify(e)
      for (const re of forbidden) expect(text, `${e.slug} に ${re} が含まれる`).not.toMatch(re)
    }
  })
})

describe('brandJourney（ひとつのブランドの、歩み）', () => {
  it('slug を持つステップは、実在するイベントを指している（リンク切れ防止）', () => {
    const slugs = new Set(events.map((e) => e.slug))
    for (const step of brandJourney) {
      if (step.slug) {
        expect(slugs.has(step.slug), `歩み「${step.title}」の slug`).toBe(true)
      }
    }
  })

  it('開催前（upcoming）のステップにはレポートリンクを付けない', () => {
    for (const step of brandJourney) {
      if (step.upcoming) {
        expect(step.slug, `歩み「${step.title}」`).toBeUndefined()
      }
    }
  })
})
