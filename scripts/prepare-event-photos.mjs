/**
 * 実績ページ用の写真を、サイトの規格に揃えて書き出す（実績更新ハーネス。docs/EVENT-UPDATE.md）。
 *
 *   node scripts/prepare-event-photos.mjs <slug> <名前>=<元画像>[:<比率>][*<幅>%][@<x>%,<y>%][<±n>ev] ...
 *   node scripts/prepare-event-photos.mjs --audit [<slug> ...]     … 公開中の画像の明るさを監査する（書き出さない）
 *
 *   例: node scripts/prepare-event-photos.mjs ario-sapporo-harvest-court-2026-10 \
 *         hero=~/photos/IMG_0101.jpg:16x9@50%,40% venue=~/photos/IMG_0102.jpg making=~/photos/IMG_0110.jpg
 *
 * 比率（省略時 4x3）:
 *   16x9 … ヒーロー（1600×900）
 *   4x3  … フォトギャラリー（1200×900）
 *   1x1  … スマホ用ヒーロー heroImageMobile（1000×1000。縦位置の写真で横長に切ると伝わらない場合）
 * @x%,y% は切り抜きの中心（省略時 50%,50%）。
 * *n% は切り抜きの大きさ（比率に合う最大の範囲に対する幅の割合。50〜100%、省略時 100%）。写り込みを外すために
 *   寄せたいときに使う。書き出しが規格サイズに満たなくなる場合は警告が出る。
 * ±nev は露出の補正（例: +0.3ev。±1ev まで。省略時は補正しない）。暗すぎる写真に、画像ごとに指定したときだけ使う。
 *   補正の曲線と「暗い」の基準は scripts/lib/photo-tone.mjs。+0.3ev から 0.1 刻みで試し、中央値 L* が基準に届く
 *   最小の補正にする（見た目が不自然になるなら補正しない）。
 *
 * - 出力: public/events/<slug>/<名前>.jpg（JPEG。500KB を超えないよう画質を自動調整）
 * - ブラウザ（Chromium）の canvas で描き直すため、EXIF・XMP・PNG/WebP のテキストなどのメタデータは残らない。
 *   向き（EXIF Orientation）は描画時に反映される。書き出した画像は scripts/lib/image-metadata.mjs で検査し、
 *   通らなければ保存しない。
 * - 入力は JPEG / PNG / WebP。HEIC は Chromium が読めないため、先に JPEG へ変換する。
 * - 元画像より大きくは引き伸ばさない（足りない場合は警告して元の解像度のまま書き出す）。
 * - 書き出した画像の明るさ（中央値 L*）を表示し、暗すぎる・白飛びの可能性があれば警告する（警告だけで、自動では補正しない）。
 */
import { mkdir, readFile, writeFile, rm, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join, resolve, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'
import { launchChromium } from './lib/browser.mjs'
import { inspectImageMetadata } from './lib/image-metadata.mjs'
import { SRGB_TO_LINEAR, toneGainLut, lightnessStats, brightnessVerdict, parsePhotoSpec, exposePixel } from './lib/photo-tone.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SIZES = { '16x9': [1600, 900], '4x3': [1200, 900], '1x1': [1000, 1000] }
const MAX_BYTES = 480 * 1024
const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }

const HIST_BINS = 1024
const args = process.argv.slice(2)
const audit = args[0] === '--audit'
const [slug, ...specs] = args
if (!audit && (!slug || !/^[a-z0-9-]+$/.test(slug) || specs.length === 0)) {
  console.error('使い方: node scripts/prepare-event-photos.mjs <slug> <名前>=<元画像>[:16x9|4x3|1x1][@x%,y%][+0.3ev] ...\n      node scripts/prepare-event-photos.mjs --audit [<slug> ...]')
  process.exit(64)
}

const browser = await launchChromium()
const page = await browser.newPage()
await page.setContent('<!doctype html><html><body></body></html>')

// 露出の補正（1 画素）は、テストしている lib の関数をそのままページに渡して使う
await page.evaluate(`window.exposePixel = ${exposePixel.toString()}`)
// canvas の画素から、リニア輝度 Y のヒストグラム（HIST_BINS 段階）を作る関数をページに用意する（画素は変えない）
await page.evaluate(() => {
  window.lumaHistogram = (ctx, w, h, lin, bins) => {
    const { data } = ctx.getImageData(0, 0, w, h)
    const hist = new Array(bins).fill(0)
    for (let i = 0; i < data.length; i += 4) {
      const y = 0.2126 * lin[data[i]] + 0.7152 * lin[data[i + 1]] + 0.0722 * lin[data[i + 2]]
      hist[Math.min(bins - 1, Math.floor(y * bins))]++
    }
    return hist
  }
})
const describe = (hist) => {
  const stats = lightnessStats(hist)
  return { stats, verdict: brightnessVerdict(stats) }
}

if (audit) {
  // 公開中の実績画像（ヒーロー）の明るさを監査する。書き出しはしない
  const eventsDir = join(root, 'public', 'events')
  const slugs = args.slice(1)
  const targets = []
  for (const s of slugs.length ? slugs : (await readdir(eventsDir)).sort()) {
    for (const f of (await readdir(join(eventsDir, s)).catch(() => [])).sort()) if (/^hero.*\.(jpe?g|png|webp)$/.test(f)) targets.push(join(eventsDir, s, f))
  }
  const rows = []
  for (const file of targets) {
    const dataUrl = `data:${MIME[extname(file).toLowerCase()]};base64,${(await readFile(file)).toString('base64')}`
    const hist = await page.evaluate(
      async ({ dataUrl, lin, bins }) => {
        const img = new Image()
        img.src = dataUrl
        await img.decode()
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        return window.lumaHistogram(ctx, canvas.width, canvas.height, lin, bins)
      },
      { dataUrl, lin: SRGB_TO_LINEAR, bins: HIST_BINS },
    )
    const { stats, verdict } = describe(hist)
    rows.push({ file: file.replace(root + '/', ''), 'L*中央値': stats.median, 'L*平均': stats.mean, '暗部(L*<25)': `${Math.round(stats.shadowShare * 100)}%`, '白飛び(L*>97)': `${Math.round(stats.highlightShare * 100)}%`, 判定: verdict.reasons.length ? `要確認: ${verdict.reasons.join(' / ')}` : 'ok' })
  }
  await browser.close()
  console.table(rows)
  console.log('判定は警告です。スクリーンショット（390px・1440px）で見え方を確かめてから、必要な画像だけ ±nev で書き出し直してください。')
  process.exit(0)
}

const jobs = specs.map((spec) => {
  const { name, file, ratio, zoom, fx, fy, ev } = parsePhotoSpec(spec)
  const src = resolve(file.replace(/^~(?=\/)/, homedir()))
  if (!existsSync(src)) throw new Error(`元画像がない: ${src}`)
  const mime = MIME[extname(src).toLowerCase()]
  if (!mime) throw new Error(`対応していない形式（JPEG/PNG/WebP のみ）: ${src}`)
  // 露出の補正を指定したときだけ、画素を変える（指定がなければ従来と同じ書き出し）
  return { name, src, mime, ratio, zoom, fx, fy, ev, gain: ev === 0 ? null : toneGainLut(ev, HIST_BINS) }
})

const outDir = join(root, 'public', 'events', slug)
await mkdir(outDir, { recursive: true })

const report = []
for (const job of jobs) {
  const [W, H] = SIZES[job.ratio]
  const dataUrl = `data:${job.mime};base64,${(await readFile(job.src)).toString('base64')}`
  const result = await page.evaluate(
    async ({ dataUrl, W, H, zoom, fx, fy, maxBytes, lin, gain, bins }) => {
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
      sw *= zoom
      sh *= zoom
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
      const histogram = window.lumaHistogram
      let before = null
      if (gain) {
        // 露出の補正: リニアの輝度に応じた倍率を RGB に同じだけ掛ける（色相を保つ。photo-tone.mjs の toneCurve・exposePixel）
        before = histogram(ctx, outW, outH, lin, bins)
        const image = ctx.getImageData(0, 0, outW, outH)
        const d = image.data
        const toSrgb = (v) => {
          const c = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055
          return Math.max(0, Math.min(255, Math.round(c * 255)))
        }
        for (let i = 0; i < d.length; i += 4) {
          const r = lin[d[i]]
          const g = lin[d[i + 1]]
          const b = lin[d[i + 2]]
          const y = 0.2126 * r + 0.7152 * g + 0.0722 * b
          const [r2, g2, b2] = window.exposePixel(r, g, b, gain[Math.min(bins - 1, Math.round(y * (bins - 1)))])
          d[i] = toSrgb(r2)
          d[i + 1] = toSrgb(g2)
          d[i + 2] = toSrgb(b2)
        }
        ctx.putImageData(image, 0, 0)
      }
      const after = histogram(ctx, outW, outH, lin, bins)
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
      return { b64: btoa(bin), outW, outH, q, source: [sw0, sh0], upscaleNeeded: scale === 1 && sw < W, before, after }
    },
    { dataUrl, W, H, zoom: job.zoom, fx: job.fx, fy: job.fy, maxBytes: MAX_BYTES, lin: SRGB_TO_LINEAR, gain: job.gain, bins: HIST_BINS },
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
  const tone = describe(result.after)
  const beforeTone = result.before ? describe(result.before) : null
  const warnings = [
    result.upscaleNeeded ? `元画像が小さく ${W}×${H} に満たない` : buf.length > MAX_BYTES ? '480KB を超えた' : null,
    ...tone.verdict.reasons,
    tone.verdict.dark && !tone.verdict.bright ? '見え方を確かめ、必要なら +0.3ev から試す' : null,
    tone.verdict.dark && tone.verdict.bright ? '白飛びがあるため、露出の補正より別の写真を検討する' : null,
  ].filter(Boolean)
  report.push({
    file: `public/events/${slug}/${job.name}.jpg`,
    size: `${result.outW}×${result.outH}`,
    kb: Math.round(buf.length / 1024),
    quality: result.q,
    source: result.source.join('×'),
    'L*中央値': beforeTone ? `${beforeTone.stats.median} → ${tone.stats.median}（${job.ev > 0 ? '+' : ''}${job.ev}ev）` : tone.stats.median,
    warning: warnings.join(' / ') || undefined,
  })
}
await browser.close()
console.table(report)
