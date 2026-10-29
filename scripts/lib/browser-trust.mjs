/**
 * 本番 URL をブラウザで確認するための補助（browser.mjs・visual-check.mjs が使う）。
 * playwright を読み込まないので、テスト（src/tooling/browserTrust.test.ts）から直接使える。
 */
import { existsSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createHash, X509Certificate } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/** PEM の証明書を順に取り出す */
export function parsePemChain(text) {
  return [...String(text).matchAll(/-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g)].map((m) => `${m[0]}\n`)
}

/** 証明書の公開鍵（SubjectPublicKeyInfo）の SHA-256 を base64 で（Chromium の SPKI 指定と同じ形式） */
export function spkiHash(pem) {
  const der = new X509Certificate(pem).publicKey.export({ type: 'spki', format: 'der' })
  return createHash('sha256').update(der).digest('base64')
}

/**
 * ホストごとに、提示された証明書チェーンを環境の CA バンドルで検証し、通ったチェーンの CA（葉を除く）の SPKI を返す。
 * CA バンドルの指定がない環境（通常の PC など）では何もしない（Chromium の標準の信頼で開く）。
 * @returns {{ pins: string[], hosts: { host: string, verified: boolean, detail: string }[] }}
 */
export function environmentCaPins(hosts) {
  const bundle = [process.env.SSL_CERT_FILE, process.env.NODE_EXTRA_CA_CERTS, process.env.CURL_CA_BUNDLE].find((f) => f && existsSync(f))
  if (!bundle) return { pins: [], hosts: hosts.map((host) => ({ host, verified: false, detail: 'CA バンドルの指定なし（Chromium の標準の信頼を使う）' })) }
  const pins = new Set()
  const results = []
  const dir = mkdtempSync(join(tmpdir(), 'chain-'))
  try {
    for (const host of [...new Set(hosts)]) {
      try {
        const shown = execFileSync('openssl', ['s_client', '-connect', `${host}:443`, '-servername', host, '-showcerts'], {
          input: '',
          encoding: 'utf8',
          timeout: 20000,
          stdio: ['pipe', 'pipe', 'ignore'],
        })
        const chain = parsePemChain(shown)
        if (chain.length < 2) throw new Error('証明書チェーンを取得できない')
        const leaf = join(dir, `${host}-leaf.pem`)
        const rest = join(dir, `${host}-chain.pem`)
        writeFileSync(leaf, chain[0])
        writeFileSync(rest, chain.slice(1).join(''))
        // CA バンドルだけに対してチェーンとホスト名を検証する（通らなければ例外）。
        // -no-CApath・-no-CAstore で、openssl の既定の証明書ディレクトリ（システムのストア）は使わない
        execFileSync('openssl', ['verify', '-no-CApath', '-no-CAstore', '-CAfile', bundle, '-untrusted', rest, '-verify_hostname', host, leaf], {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
        })
        for (const ca of chain.slice(1)) pins.add(spkiHash(ca))
        results.push({ host, verified: true, detail: new X509Certificate(chain[0]).issuer.replace(/\n/g, ', ') })
      } catch (e) {
        results.push({ host, verified: false, detail: String(e.stderr ?? e.message).trim().slice(0, 160) })
      }
    }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
  return { pins: [...pins], hosts: results }
}

/** 表示に関わる読み込みの種別（Playwright の resourceType） */
export const RENDER_TYPES = ['document', 'stylesheet', 'script', 'image', 'font']

/**
 * 本番ページで読み込んだリソースを集計する（純粋関数）。
 * @param {{ type: string, url: string, ok: boolean, status?: number|null, error?: string, outOfScope?: boolean }[]} records
 * @returns {{ byType: Record<string, { loaded: number, failed: number }>, failed: typeof records, outOfScope: string[], verdict: 'VERIFIED'|'PARTIAL' }}
 */
export function summarizeResources(records) {
  const byType = Object.fromEntries(RENDER_TYPES.map((t) => [t, { loaded: 0, failed: 0 }]))
  const failed = []
  const outOfScope = new Set()
  for (const r of records) {
    if (r.outOfScope) {
      outOfScope.add(new URL(r.url).origin)
      continue
    }
    const t = byType[r.type] ?? (byType[r.type] = { loaded: 0, failed: 0 })
    if (r.ok) t.loaded++
    else {
      t.failed++
      failed.push(r)
    }
  }
  return { byType, failed, outOfScope: [...outOfScope].sort(), verdict: failed.length ? 'PARTIAL' : 'VERIFIED' }
}
