import { describe, it, expect } from 'vitest'
import { parsePemChain, spkiHash, summarizeResources } from '../../scripts/lib/browser-trust.mjs'

/**
 * 本番ブラウザ確認の補助（scripts/lib/browser-trust.mjs）のテスト。
 * 証明書は、Chromium に信頼させる CA を「公開鍵（SPKI）の SHA-256」で指定するための計算を確かめる。
 * 期待値は `openssl x509 -pubkey | openssl pkey -pubin -outform DER | openssl dgst -sha256 -binary | base64` で求めた。
 */
const PEM = `-----BEGIN CERTIFICATE-----
MIIBiTCCAS+gAwIBAgIUSyY5Ni1Ruo9LGxDx687woWDV9DswCgYIKoZIzj0EAwIw
GjEYMBYGA1UEAwwPaGFybmVzcy10ZXN0LWNhMB4XDTI2MTAyOTIyMDk0NVoXDTM2
MTAyNjIyMDk0NVowGjEYMBYGA1UEAwwPaGFybmVzcy10ZXN0LWNhMFkwEwYHKoZI
zj0CAQYIKoZIzj0DAQcDQgAEGPIw+EFCZlGomzfoQHoZXgPBw5WyrBfubH7vWGjK
eES/VYSoX7+R4octhgVGMbmFmIv3Hp9PtjtwkuboowVshqNTMFEwHQYDVR0OBBYE
FC8Lv/dpWS3YaNXk5xCfbkJ5MjGrMB8GA1UdIwQYMBaAFC8Lv/dpWS3YaNXk5xCf
bkJ5MjGrMA8GA1UdEwEB/wQFMAMBAf8wCgYIKoZIzj0EAwIDSAAwRQIhAIOBiVD2
iCb5FUrhAJkAtjSPqN/V+WowtwuhPdcVdaoKAiBBGZoaaNQoV4knwPnkhI2go/gl
GaU2qlXvOtDSLmUpWQ==
-----END CERTIFICATE-----`

describe('証明書チェーン', () => {
  it('openssl s_client の出力から証明書を順に取り出す', () => {
    const out = `CONNECTED(00000003)\n 0 s:CN=leaf\n${PEM}\n 1 s:CN=ca\n${PEM}\n---\nVerify return code: 0 (ok)`
    expect(parsePemChain(out)).toHaveLength(2)
    expect(parsePemChain('証明書なし')).toEqual([])
  })

  it('SPKI の SHA-256（base64）が openssl の計算と一致する', () => {
    expect(spkiHash(PEM)).toBe('6b5xR2e6Xh69G+YMVZvxutE25FzFjh8dwZz16ubWNLc=')
  })
})

describe('summarizeResources', () => {
  const ok = (type: string, url = `https://www.kitakita-lab.com/${type}`) => ({ type, url, ok: true, status: 200 })

  it('表示に関わるリソースをすべて読み込めれば VERIFIED', () => {
    const r = summarizeResources([ok('document'), ok('stylesheet'), ok('script'), ok('image'), ok('font', 'https://fonts.gstatic.com/a.woff2')])
    expect(r.verdict).toBe('VERIFIED')
    expect(r.byType.font).toEqual({ loaded: 1, failed: 0 })
  })

  it('読み込めないリソースがあれば PARTIAL（本番で検証済みとしない）', () => {
    const r = summarizeResources([ok('document'), { type: 'font', url: 'https://fonts.gstatic.com/a.woff2', ok: false, error: 'net::ERR_CERT_AUTHORITY_INVALID' }])
    expect(r.verdict).toBe('PARTIAL')
    expect(r.failed).toHaveLength(1)
  })

  it('HTTP 4xx の応答も失敗として数える', () => {
    expect(summarizeResources([ok('document'), { type: 'image', url: 'https://www.kitakita-lab.com/x.jpg', ok: false, status: 404 }]).verdict).toBe('PARTIAL')
  })

  it('対象外として遮断した外部通信は、オリジンだけを一覧にする（失敗とは分ける）', () => {
    const r = summarizeResources([
      ok('document'),
      { type: 'script', url: 'https://static.cloudflareinsights.com/beacon.min.js/v1', ok: false, outOfScope: true },
      { type: 'script', url: 'https://static.cloudflareinsights.com/beacon.min.js/v2', ok: false, outOfScope: true },
    ])
    expect(r.verdict).toBe('VERIFIED')
    expect(r.outOfScope).toEqual(['https://static.cloudflareinsights.com'])
  })
})
