/**
 * 写真の明るさの監査と、露出の補正（純粋関数。画像の読み書きは scripts/prepare-event-photos.mjs が Chromium で行う）。
 *
 * 明るさは CIE L*（知覚的な明度。0 = 黒、50 = 中間の灰色、100 = 白）で測る。
 * 画素の sRGB をリニアに戻して輝度 Y（Rec.709 の係数）を求め、L* に換算する。
 *
 * 「暗い」の基準（ヒーロー画像）: 中央値 L* が 42 未満（画面の半分以上が、中間の灰色より明らかに暗い）。
 *   公開済みの実績のヒーロー（8 枚。npm run photos:audit、2026-10-29）は中央値 49.8〜73.1 で、
 *   ザ・ビッグ厚別店のヒーロー（中央値 36.4）だけがこの基準に当たった。
 *   L* 25 未満の画素の割合（暗部）は参考として表示するが、判定には使わない。黒い服・椅子など被写体そのものが
 *   黒い部分でも増え、露出の不足と区別できないため（ザ・ビッグ厚別店は +0.7ev でも 31% のまま）。
 * 「白飛び」の基準: L* 97 超の画素が 5% 超（補正しすぎの検出にも使う）。
 * どちらも警告で、最終判断はスクリーンショットを見て行う（自動では補正しない）。
 *
 * 露出の補正（+0.3ev など。画像ごとに指定したときだけ使う）:
 *   リニアの輝度 Y に対して Y' = gY / (1 + (g - 1)Y)、g = 2^ev。
 *   - Y = 0 と Y = 1 は動かない（黒は黒、白は白のまま。白飛びを作らない）
 *   - 中間調ほど持ち上がる（+0.5ev で中間の灰色 L* 49.5 → 約 55.8）
 *   - RGB を同じ倍率で掛けるので、色相は変えない（色味を変えない）。鮮やかな色で倍率を掛けるとどれかのチャンネルが
 *     1 を超える場合は、超えない倍率までに抑える（チャンネルごとに切り詰めると、比率が崩れて色相が変わるため）
 *   - 指定できる範囲は ±1ev まで（大きな補正は不自然になるため）
 */

export const EV_LIMIT = 1
export const TONE_THRESHOLDS = { darkMedian: 42, shadowL: 25, highlightL: 97, highlightShare: 0.05 }

/** sRGB（0〜255）→ リニア（0〜1）の対応表 */
export const SRGB_TO_LINEAR = Array.from({ length: 256 }, (_, i) => {
  const c = i / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
})

/** リニアの輝度 Y（0〜1）→ L*（0〜100） */
export function lightness(y) {
  return y > 216 / 24389 ? 116 * Math.cbrt(y) - 16 : (24389 / 27) * y
}

/** 露出の補正曲線（リニアの輝度に対して） */
export function toneCurve(y, ev) {
  const g = 2 ** ev
  return (g * y) / (1 + (g - 1) * y)
}

/**
 * 1 画素の露出の補正（リニアの RGB に倍率 k を掛ける）。どのチャンネルも 1 を超えない倍率までに抑え、RGB の比率（色相）を保つ。
 * ブラウザ側（prepare-event-photos.mjs）にもこの関数をそのまま渡して使う（外の変数を参照しないこと）。
 */
export function exposePixel(r, g, b, k) {
  const m = Math.max(r, g, b)
  const kk = m > 0 ? Math.min(k, 1 / m) : k
  return [r * kk, g * kk, b * kk]
}

/**
 * 輝度 Y を size 段階に分けたときの、各段階の倍率（Y' / Y）。ブラウザ側で画素ごとに掛ける。
 * @param {number} ev 補正量（±EV_LIMIT まで）
 */
export function toneGainLut(ev, size = 1024) {
  if (!Number.isFinite(ev) || Math.abs(ev) > EV_LIMIT) throw new Error(`露出の補正は ±${EV_LIMIT}ev までで指定する: ${ev}`)
  return Array.from({ length: size }, (_, i) => {
    const y = i / (size - 1)
    return y === 0 ? 1 : toneCurve(y, ev) / y
  })
}

/**
 * 輝度 Y のヒストグラム（Y を bins 段階に分けた画素数）から、L* の統計を求める。
 * @param {number[]} hist
 */
export function lightnessStats(hist) {
  const bins = hist.length
  const total = hist.reduce((a, b) => a + b, 0)
  if (total === 0) throw new Error('画素がない')
  const lOf = (i) => lightness((i + 0.5) / bins)
  let acc = 0
  let mean = 0
  let shadow = 0
  let highlight = 0
  const q = { p05: null, median: null, p95: null }
  for (let i = 0; i < bins; i++) {
    const n = hist[i]
    if (!n) continue
    const l = lOf(i)
    mean += l * n
    if (l < TONE_THRESHOLDS.shadowL) shadow += n
    if (l > TONE_THRESHOLDS.highlightL) highlight += n
    acc += n
    if (q.p05 === null && acc >= total * 0.05) q.p05 = l
    if (q.median === null && acc >= total * 0.5) q.median = l
    if (q.p95 === null && acc >= total * 0.95) q.p95 = l
  }
  const r1 = (v) => Math.round(v * 10) / 10
  return {
    mean: r1(mean / total),
    p05: r1(q.p05),
    median: r1(q.median),
    p95: r1(q.p95),
    shadowShare: Math.round((shadow / total) * 1000) / 1000,
    highlightShare: Math.round((highlight / total) * 1000) / 1000,
  }
}

/**
 * 明るさの判定（警告だけ。合否ではない）。暗さと白飛びは別々に判定する（明暗差の大きい写真では両方に当たる）。
 * @returns {{ dark: boolean, bright: boolean, reasons: string[] }}
 */
export function brightnessVerdict(stats, t = TONE_THRESHOLDS) {
  const dark = stats.median < t.darkMedian
  const bright = stats.highlightShare > t.highlightShare
  const reasons = []
  if (dark) reasons.push(`暗い可能性: 中央値 L* ${stats.median}（${t.darkMedian} 未満）・参考: L* ${t.shadowL} 未満 ${Math.round(stats.shadowShare * 100)}%`)
  if (bright) reasons.push(`白飛びの可能性: L* ${t.highlightL} 超が ${Math.round(stats.highlightShare * 100)}%`)
  return { dark, bright, reasons }
}

/**
 * 書き出しの指定 `<名前>=<元画像>[:<比率>][*<幅>%][@<x>%,<y>%][<±n>ev]` を読む（prepare-event-photos.mjs）。
 * 範囲外（切り抜き 50〜100%、露出 ±EV_LIMIT）は例外にする。
 * @returns {{ name: string, file: string, ratio: string, zoom: number, fx: number, fy: number, ev: number }}
 */
export function parsePhotoSpec(spec) {
  const m = spec.match(/^([a-z0-9-]+)=(.+?)(?::(16x9|4x3|1x1))?(?:\*(\d+)%)?(?:@(\d+)%,(\d+)%)?(?:([+-]\d+(?:\.\d+)?)ev)?$/)
  if (!m) throw new Error(`指定の形式が不正: ${spec}`)
  const [, name, file, ratio = '4x3', zoom = '100', x = '50', y = '50', ev = '0'] = m
  if (Number(zoom) < 50 || Number(zoom) > 100) throw new Error(`切り抜きの大きさは 50〜100% で指定する: ${spec}`)
  if (Number(x) > 100 || Number(y) > 100) throw new Error(`切り抜きの中心は 0〜100% で指定する: ${spec}`)
  if (Math.abs(Number(ev)) > EV_LIMIT) throw new Error(`露出の補正は ±${EV_LIMIT}ev までで指定する: ${spec}`)
  return { name, file, ratio, zoom: Number(zoom) / 100, fx: Number(x) / 100, fy: Number(y) / 100, ev: Number(ev) }
}

/**
 * src/data/events.ts の本文から、実績ごとのヒーロー画像（heroImage・heroImageMobile）のパスを取り出す（photos:audit）。
 * 画像は public/events/ 以外（共有の /workshops/ など）にある場合もあるため、実績のデータから対象を決める。
 * events.test.ts ではなく photoTone.test.ts で、実際の events データと一致することを確かめている。
 * @returns {{ slug: string, srcs: string[] }[]}
 */
export function heroImagesFromEventsSource(text) {
  const start = text.indexOf('export const events')
  const end = text.indexOf('export const', start + 1)
  const body = text.slice(start, end < 0 ? undefined : end)
  const slugs = [...body.matchAll(/\bslug:\s*'([^']+)'/g)]
  return slugs.map((m, i) => {
    const chunk = body.slice(m.index, slugs[i + 1]?.index)
    return { slug: m[1], srcs: [...chunk.matchAll(/heroImage(?:Mobile)?:\s*\{\s*src:\s*'([^']+)'/g)].map((x) => x[1]) }
  })
}
