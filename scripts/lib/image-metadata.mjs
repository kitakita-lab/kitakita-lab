/**
 * 公開する画像に、撮影情報・位置情報などのメタデータが残っていないかを検査する（純粋関数）。
 *
 * 文字列（"Exif"）の検索ではなく、形式ごとにファイル構造をたどり、
 * **画像の表示に必要な部分だけを許可**する（許可リスト方式）。
 *   - "Exif" の検索だけでは、XMP（位置情報・作者名を含められる）、IPTC、PNG のテキスト、
 *     WebP の EXIF/XMP チャンクを見逃す。先頭だけを見る検査は、前に大きなセグメントがあると見逃す。
 *   - 構造をたどれない（壊れている・未対応の形式）画像は合格にしない。
 *
 * 結果: { format, ok, findings: string[], error?: string }
 *   ok は「構造を最後までたどれて、許可していない部分が 1 つもない」ときだけ true。
 */

const ascii = (buf, start, len) => String.fromCharCode(...buf.subarray(start, start + len))

/* ── JPEG ───────────────────────────────────────────── */

// SOS までに現れてよいセグメント（画像の復号に必要なもの・色の情報）
const JPEG_ALLOWED = new Map([
  [0xdb, 'DQT'],
  [0xc4, 'DHT'],
  [0xdd, 'DRI'],
  [0xcc, 'DAC'],
])
const isSOF = (m) => m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc

function inspectJpeg(buf) {
  const findings = []
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return { ok: false, findings, error: 'JPEG の SOI がない' }
  let p = 2
  let sawSOS = false
  while (p < buf.length) {
    if (buf[p] !== 0xff) return { ok: false, findings, error: `位置 ${p} でマーカーを読めない` }
    // マーカー前の 0xFF の詰め物は飛ばす
    while (buf[p] === 0xff && p < buf.length) p++
    const marker = buf[p++]
    if (marker === undefined) return { ok: false, findings, error: 'マーカーの途中で終わっている' }
    if (marker === 0xd9) {
      // EOI。後ろに残るデータ（追記された別画像・情報）は許可しない
      if (p < buf.length) findings.push(`EOI の後ろに ${buf.length - p} バイトのデータ`)
      return { ok: findings.length === 0, findings, eoi: true }
    }
    if (marker >= 0xd0 && marker <= 0xd7) continue // RST（長さなし）
    if (p + 2 > buf.length) return { ok: false, findings, error: 'セグメント長を読めない' }
    const len = (buf[p] << 8) | buf[p + 1]
    if (len < 2 || p + len > buf.length) return { ok: false, findings, error: `セグメント長が不正（位置 ${p - 2}）` }
    const body = buf.subarray(p + 2, p + len)
    if (marker === 0xe0) {
      // APP0: JFIF / JFXX（解像度の情報）。サムネイルを含むものは許可しない
      const id = ascii(body, 0, 5)
      if (id === 'JFIF\0' && body.length >= 14 && body[12] === 0 && body[13] === 0) {
        // サムネイルなしの JFIF
      } else findings.push(`APP0（${id.replace(/\0/g, '')}）`)
    } else if (marker === 0xe1) {
      const id = ascii(body, 0, 6)
      if (id === 'Exif\0\0') findings.push('EXIF（撮影日時・機種・位置情報など）')
      else if (ascii(body, 0, 28) === 'http://ns.adobe.com/xap/1.0/') findings.push('XMP（位置情報・作者名などを含められる）')
      else findings.push('APP1（不明な情報）')
    } else if (marker === 0xe2) {
      if (ascii(body, 0, 12) !== 'ICC_PROFILE\0') findings.push(`APP2（${ascii(body, 0, 4).replace(/\0/g, '')}）`)
    } else if (marker === 0xee) {
      if (ascii(body, 0, 5) !== 'Adobe') findings.push('APP14（不明な情報）')
    } else if (marker === 0xed) findings.push('APP13（IPTC・Photoshop の情報）')
    else if (marker >= 0xe3 && marker <= 0xef) findings.push(`APP${marker - 0xe0}（アプリケーション固有の情報）`)
    else if (marker === 0xfe) findings.push('COM（コメント）')
    else if (marker === 0xda) {
      sawSOS = true
      // スキャンデータを、次のマーカー（0xFF の後が 0x00・RST 以外）まで飛ばす
      p += len
      while (p < buf.length) {
        if (buf[p] === 0xff && buf[p + 1] !== 0x00 && !(buf[p + 1] >= 0xd0 && buf[p + 1] <= 0xd7) && buf[p + 1] !== 0xff) break
        p++
      }
      continue
    } else if (!JPEG_ALLOWED.has(marker) && !isSOF(marker)) findings.push(`不明なセグメント 0xFF${marker.toString(16).toUpperCase()}`)
    p += len
  }
  return { ok: false, findings, error: sawSOS ? 'EOI がない（途中で切れている）' : '画像データ（SOS）がない' }
}

/* ── PNG ────────────────────────────────────────────── */

const PNG_SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
// 表示に必要なチャンクと、色・透過・解像度の情報だけを許可する
const PNG_ALLOWED = new Set(['IHDR', 'PLTE', 'IDAT', 'IEND', 'tRNS', 'cHRM', 'gAMA', 'iCCP', 'sBIT', 'sRGB', 'cICP', 'bKGD', 'pHYs', 'hIST', 'sPLT', 'acTL', 'fcTL', 'fdAT'])
const PNG_LABEL = { eXIf: 'EXIF', tEXt: 'テキスト', zTXt: 'テキスト（圧縮）', iTXt: 'テキスト（XMP を含められる）', tIME: '更新日時' }

function inspectPng(buf) {
  const findings = []
  let p = 8
  let sawIHDR = false
  while (p + 8 <= buf.length) {
    const len = buf.readUInt32BE(p)
    const type = ascii(buf, p + 4, 4)
    if (!/^[A-Za-z]{4}$/.test(type) || p + 12 + len > buf.length) return { ok: false, findings, error: `位置 ${p} のチャンクを読めない` }
    if (type === 'IHDR') sawIHDR = true
    if (!PNG_ALLOWED.has(type)) findings.push(`${type}（${PNG_LABEL[type] ?? '不明な情報'}）`)
    p += 12 + len
    if (type === 'IEND') {
      if (p < buf.length) findings.push(`IEND の後ろに ${buf.length - p} バイトのデータ`)
      return sawIHDR ? { ok: findings.length === 0, findings } : { ok: false, findings, error: 'IHDR がない' }
    }
  }
  return { ok: false, findings, error: 'IEND がない（途中で切れている）' }
}

/* ── WebP ───────────────────────────────────────────── */

const WEBP_ALLOWED = new Set(['VP8 ', 'VP8L', 'VP8X', 'ALPH', 'ANIM', 'ANMF', 'ICCP'])

function inspectWebp(buf) {
  const findings = []
  const riffSize = buf.readUInt32LE(4)
  if (riffSize + 8 > buf.length) return { ok: false, findings, error: 'RIFF のサイズがファイルより大きい（途中で切れている）' }
  if (riffSize + 8 < buf.length) findings.push(`RIFF の後ろに ${buf.length - riffSize - 8} バイトのデータ`)
  let p = 12
  let sawImage = false
  while (p < riffSize + 8) {
    if (p + 8 > riffSize + 8) return { ok: false, findings, error: `位置 ${p} のチャンクを読めない` }
    const type = ascii(buf, p, 4)
    const len = buf.readUInt32LE(p + 4)
    if (p + 8 + len > riffSize + 8) return { ok: false, findings, error: `${type} チャンクの長さが不正` }
    if (type === 'VP8 ' || type === 'VP8L' || type === 'ANMF') sawImage = true
    if (type === 'EXIF') findings.push('EXIF（撮影日時・機種・位置情報など）')
    else if (type === 'XMP ') findings.push('XMP（位置情報・作者名などを含められる）')
    else if (!WEBP_ALLOWED.has(type)) findings.push(`${type.trim()}（不明な情報）`)
    p += 8 + len + (len % 2) // チャンクは偶数長に揃える
  }
  return sawImage ? { ok: findings.length === 0, findings } : { ok: false, findings, error: '画像データのチャンクがない' }
}

/* ── 入口 ───────────────────────────────────────────── */

/** @param {Uint8Array} input 画像ファイルの中身 */
export function inspectImageMetadata(input) {
  const buf = Buffer.from(input.buffer, input.byteOffset, input.byteLength)
  try {
    if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) return { format: 'jpeg', ...inspectJpeg(buf) }
    if (buf.length >= 8 && PNG_SIG.every((b, i) => buf[i] === b)) return { format: 'png', ...inspectPng(buf) }
    if (buf.length >= 12 && ascii(buf, 0, 4) === 'RIFF' && ascii(buf, 8, 4) === 'WEBP') return { format: 'webp', ...inspectWebp(buf) }
    return { format: 'unknown', ok: false, findings: [], error: '対応していない形式（JPEG・PNG・WebP のみ）' }
  } catch (e) {
    return { format: 'unknown', ok: false, findings: [], error: `解析に失敗: ${e.message}` }
  }
}
