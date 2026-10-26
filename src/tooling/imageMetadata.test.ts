import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { inspectImageMetadata } from '../../scripts/lib/image-metadata.mjs'

/**
 * 公開画像のメタデータ検査（scripts/lib/image-metadata.mjs）のテスト。
 * 「Exif」の文字列検索だけでは見逃すもの（XMP・PNG のテキスト・WebP のチャンク、
 * 後方にある EXIF）と、壊れた画像を合格にしないことを確かめる。
 */
const REAL_JPEG = fs.readFileSync(path.resolve(process.cwd(), 'public/events/ario-sapporo-harvest-court-2026-09/table.jpg'))

const seg = (marker: number, body: Buffer) => {
  const len = body.length + 2
  return Buffer.concat([Buffer.from([0xff, marker, len >> 8, len & 0xff]), body])
}
/** 実在の JPEG の SOI の直後にセグメントを差し込む */
const injectAfterSOI = (...segments: Buffer[]) => Buffer.concat([REAL_JPEG.subarray(0, 2), ...segments, REAL_JPEG.subarray(2)])
const EXIF = seg(0xe1, Buffer.concat([Buffer.from('Exif\0\0', 'binary'), Buffer.alloc(32)]))

const pngChunk = (type: string, data: Buffer) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  return Buffer.concat([len, Buffer.from(type, 'ascii'), data, Buffer.alloc(4)]) // CRC は検査しない
}
const png = (...extra: Buffer[]) =>
  Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', Buffer.alloc(13)),
    ...extra,
    pngChunk('IDAT', Buffer.alloc(10)),
    pngChunk('IEND', Buffer.alloc(0)),
  ])

const riffChunk = (type: string, data: Buffer) => {
  const head = Buffer.alloc(8)
  head.write(type, 0, 'ascii')
  head.writeUInt32LE(data.length, 4)
  return Buffer.concat([head, data, Buffer.alloc(data.length % 2)])
}
const webp = (...chunks: Buffer[]) => {
  const body = Buffer.concat([Buffer.from('WEBP', 'ascii'), ...chunks])
  const head = Buffer.alloc(8)
  head.write('RIFF', 0, 'ascii')
  head.writeUInt32LE(body.length, 4)
  return Buffer.concat([head, body])
}

describe('inspectImageMetadata: JPEG', () => {
  it('サイトの既存写真（canvas 書き出し相当）は合格', () => {
    const r = inspectImageMetadata(REAL_JPEG)
    expect(r).toMatchObject({ format: 'jpeg', ok: true, findings: [] })
  })

  it('前に大きなセグメントがあり、EXIF が 64KB より後ろにあっても検出する（Codex の再現条件）', () => {
    const big = seg(0xe2, Buffer.concat([Buffer.from('MPF\0', 'binary'), Buffer.alloc(65_529)])) // 65,535 バイトの APP2
    const buf = injectAfterSOI(big, EXIF)
    expect(buf.indexOf(Buffer.from('Exif\0\0', 'binary'))).toBeGreaterThan(65_536)
    const r = inspectImageMetadata(buf)
    expect(r.ok).toBe(false)
    expect(r.findings.join()).toContain('EXIF')
  })

  it('XMP（「Exif」の文字列を含まない）を検出する', () => {
    const xmp = seg(0xe1, Buffer.from('http://ns.adobe.com/xap/1.0/\0<x:xmpmeta><exif:GPSLatitude>43,3.0N</exif:GPSLatitude></x:xmpmeta>', 'binary'))
    const r = inspectImageMetadata(injectAfterSOI(xmp))
    expect(r.ok).toBe(false)
    expect(r.findings.join()).toContain('XMP')
  })

  it('IPTC（APP13）・コメント・EOI の後ろの追記を検出する', () => {
    expect(inspectImageMetadata(injectAfterSOI(seg(0xed, Buffer.from('Photoshop 3.0\0', 'binary')))).ok).toBe(false)
    expect(inspectImageMetadata(injectAfterSOI(seg(0xfe, Buffer.from('撮影者: 山田')))).ok).toBe(false)
    expect(inspectImageMetadata(Buffer.concat([REAL_JPEG, Buffer.from('Exif\0\0trailing', 'binary')])).ok).toBe(false)
  })

  it('色の情報（ICC プロファイル）は許可する', () => {
    const icc = seg(0xe2, Buffer.concat([Buffer.from('ICC_PROFILE\0', 'binary'), Buffer.from([1, 1]), Buffer.alloc(100)]))
    expect(inspectImageMetadata(injectAfterSOI(icc)).ok).toBe(true)
  })

  it('途中で切れた・長さが壊れた JPEG は合格にしない', () => {
    expect(inspectImageMetadata(REAL_JPEG.subarray(0, REAL_JPEG.length - 500))).toMatchObject({ ok: false })
    const broken = Buffer.from(REAL_JPEG)
    broken[4] = 0xff
    broken[5] = 0xff // 最初のセグメント長をファイルより大きくする
    expect(inspectImageMetadata(broken).error).toBeTruthy()
  })
})

describe('inspectImageMetadata: PNG・WebP・その他', () => {
  it('表示に必要なチャンクだけの PNG は合格', () => {
    expect(inspectImageMetadata(png(pngChunk('pHYs', Buffer.alloc(9))))).toMatchObject({ format: 'png', ok: true })
  })

  it('PNG の eXIf・テキスト（tEXt / iTXt）・更新日時を検出する', () => {
    for (const type of ['eXIf', 'tEXt', 'iTXt', 'zTXt', 'tIME']) {
      const r = inspectImageMetadata(png(pngChunk(type, Buffer.from('Author\0Yamada'))))
      expect(r.ok, type).toBe(false)
      expect(r.findings[0], type).toContain(type)
    }
  })

  it('画像データだけの WebP は合格。EXIF・XMP チャンクは検出する', () => {
    expect(inspectImageMetadata(webp(riffChunk('VP8L', Buffer.alloc(11))))).toMatchObject({ format: 'webp', ok: true })
    expect(inspectImageMetadata(webp(riffChunk('VP8X', Buffer.alloc(10)), riffChunk('VP8L', Buffer.alloc(11)), riffChunk('EXIF', Buffer.alloc(20)))).findings.join()).toContain('EXIF')
    expect(inspectImageMetadata(webp(riffChunk('VP8L', Buffer.alloc(11)), riffChunk('XMP ', Buffer.from('<x:xmpmeta/>')))).findings.join()).toContain('XMP')
  })

  it('途中で切れた PNG・WebP、対応していない形式は合格にしない', () => {
    const p = png()
    expect(inspectImageMetadata(p.subarray(0, p.length - 12)).ok).toBe(false)
    const w = webp(riffChunk('VP8L', Buffer.alloc(11)))
    expect(inspectImageMetadata(w.subarray(0, w.length - 4)).ok).toBe(false)
    expect(inspectImageMetadata(Buffer.from('GIF89a......')).format).toBe('unknown')
    expect(inspectImageMetadata(Buffer.from('GIF89a......')).ok).toBe(false)
  })
})
