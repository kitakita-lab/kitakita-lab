/**
 * 実績ページ用の写真を、サイトの規格に揃えて書き出す（実績更新ハーネス。docs/EVENT-UPDATE.md）。
 *
 *   node scripts/prepare-event-photos.mjs <slug> <名前>=<元画像>[:<比率>][@<x>%,<y>%] ...
 *
 *   例: node scripts/prepare-event-photos.mjs ario-sapporo-harvest-court-2026-10 \
 *         hero=~/photos/IMG_0101.jpg:16x9@50%,40% venue=~/photos/IMG_0102.jpg making=~/photos/IMG_0110.jpg
 *
 * 比率（省略時 4x3）:
 *   16x9 … ヒーロー（1600×900）
 *   4x3  … フォトギャラリー（1200×900）
 *   1x1  … スマホ用ヒーロー heroImageMobile（1000×1000。縦位置の写真で横長に切ると伝わらない場合）
 * @x%,y% は切り抜きの中心（省略時 50%,50%）。
 *
 * - 出力: public/events/<slug>/<名前>.jpg（JPEG。500KB を超えないよう画質を自動調整）
 * - ブラウザ（Chromium）の canvas で描き直すため、EXIF・XMP・PNG/WebP のテキストなどのメタデータは残らない。
 *   向き（EXIF Orientation）は描画時に反映される。書き出した画像は scripts/lib/image-metadata.mjs で検査し、
 *   通らなければ保存しない。
 * - 入力は JPEG / PNG / WebP。HEIC は Chromium が読めないため、先に JPEG へ変換する。
 * - 元画像より大きくは引き伸ばさない（足りない場合は警告して元の解像度のまま書き出す）。
 */
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join, resolve, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'
import { launchChromium } from './lib/browser.mjs'
import { inspectImageMetadata } from './lib/image-metadata.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SIZES = { '16x9': [1600, 900], '4x3': [1200, 900], '1x1': [1000, 1000] }
const MAX_BYTES = 480 * 1024
const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }

const [slug, ...specs] = process.argv.slice(2)
if (!slug || !/^[a-z0-9-]+$/.test(slug) || specs.length === 0) {
  console.error('使い方: node scripts/prepare-event-photos.mjs <slug> <名前>=<元画像>[:16x9|4x3|1x1][@x%,y%] ...')
  process.exit(64)
}

const jobs = specs.map((spec) => {
  const m = spec.match(/^([a-z0-9-]+)=(.+?)(?::(16x9|4x3|1x1))?(?:@(\d+)%,(\d+)%)?$/)
  if (!m) throw new Error(`指定の形式が不正: ${spec}`)
  const [, name, file, ratio = '4x3', x = '50', y = '50'] = m
  const src = resolve(file.replace(/^~(?=\/)/, homedir()))
  if (!existsSync(src)) throw new Error(`元画像がない: ${src}`)
  const mime = MIME[extname(src).toLowerCase()]
  if (!mime) throw new Error(`対応していない形式（JPEG/PNG/WebP のみ）: ${src}`)
  return { name, src, mime, ratio, fx: Number(x) / 100, fy: Number(y) / 100 }
})

const outDir = join(root, 'public', 'events', slug)
await mkdir(outDir, { recursive: true })
const browser = await launchChromium()
const page = await browser.newPage()
await page.setContent('<!doctype html><html><body></body></html>')

const report = []
for (const job of jobs) {
  const [W, H] = SIZES[job.ratio]
  const dataUrl = `data:${job.mime};base64,${(await readFile(job.src)).toString('base64')}`
  const result = await page.evaluate(
    async ({ dataUrl, W, H, fx, fy, maxBytes }) => {
      const img = new Image()
      img.src = dataUrl
      await img.decode()
      const sw0 = img.naturalWidth
      const sh0 = img.naturalHeight
      // 目標比率で最大の切り抜き範囲を、指定した中心に寄せて取る
      const target = W / H
      let sw = sw0
      let sh = sw0 / target
      if (sh > sh0) {
        sh = sh0
        sw = sh0 * target
      }
      const sx = Math.min(Math.max(sw0 * fx - sw / 2, 0), sw0 - sw)
      const sy = Math.min(Math.max(sh0 * fy - sh / 2, 0), sh0 - sh)
      const scale = Math.min(1, W / sw) // 引き伸ばさない
      const outW = Math.round(sw * scale)
      const outH = Math.round(sh * scale)
      const canvas = document.createElement('canvas')
      canvas.width = outW
      canvas.height = outH
      const ctx = canvas.getContext('2d')
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH)
      let q = 0.86
      let blob
      for (;;) {
        blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', q))
        if (blob.size <= maxBytes || q <= 0.6) break
        q = Math.round((q - 0.04) * 100) / 100
      }
      const bytes = new Uint8Array(await blob.arrayBuffer())
      let bin = ''
      for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
      return { b64: btoa(bin), outW, outH, q, source: [sw0, sh0], upscaleNeeded: scale === 1 && sw < W }
    },
    { dataUrl, W, H, fx: job.fx, fy: job.fy, maxBytes: MAX_BYTES },
  )
  const out = join(outDir, `${job.name}.jpg`)
  const buf = Buffer.from(result.b64, 'base64')
  // 書き出した画像を、公開前チェック（events.test.ts）と同じ検査にかける。通らなければ残さない
  const meta = inspectImageMetadata(buf)
  if (!meta.ok) {
    await rm(out, { force: true })
    console.error(`${job.name}: 書き出した画像にメタデータが残っている、または解析できない: ${[...meta.findings, meta.error].filter(Boolean).join(' / ')}`)
    process.exitCode = 1
    continue
  }
  await writeFile(out, buf)
  report.push({
    file: `public/events/${slug}/${job.name}.jpg`,
    size: `${result.outW}×${result.outH}`,
    kb: Math.round(buf.length / 1024),
    quality: result.q,
    source: result.source.join('×'),
    warning: result.upscaleNeeded ? `元画像が小さく ${W}×${H} に満たない` : buf.length > MAX_BYTES ? '480KB を超えた' : undefined,
  })
}
await browser.close()
console.table(report)
