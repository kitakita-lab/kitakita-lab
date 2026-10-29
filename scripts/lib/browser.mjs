/**
 * ハーネス用スクリプト（visual-check / prepare-event-photos）が使う Chromium の読み込み。
 *
 * generate-og.mjs と同じく、playwright は devDependencies に含めない。使うときだけ
 *   npm i --no-save playwright-core     （package.json・lock を変えずに入れる）
 * で入れ、Chromium は CHROME_PATH（未指定なら /opt/pw-browsers/chromium があればそれ）を使う。
 * playwright 本体（npx playwright install chromium 済み）が入っていればそちらを優先する。
 *
 * 本番 URL を開く場合（trustHosts を指定）:
 *   Claude Code のクラウド環境では、外部への HTTPS が環境の出口ゲートウェイで中継され、ゲートウェイの CA が発行した
 *   証明書が返る。この CA は環境の CA バンドル（SSL_CERT_FILE など。curl・Node が使う）には入っているが、Chromium は
 *   CA バンドルを読まない（独自のルートストアと NSS を使う）ため ERR_CERT_AUTHORITY_INVALID になる。
 *   そこで、開くホストごとに openssl で証明書チェーンを CA バンドルに対して検証し（ホスト名の照合を含む）、
 *   検証できたチェーンの CA の公開鍵だけを Chromium に信頼させる（--ignore-certificate-errors-spki-list）。
 *   検証できないホストは信頼させない。証明書の検証を無効にする（--ignore-certificate-errors など）ことはしない。
 *   （検証の処理は browser-trust.mjs）
 */
import { existsSync } from 'node:fs'
import { environmentCaPins } from './browser-trust.mjs'

/** @param {{ trustHosts?: string[] }} [options] */
export async function launchChromium({ trustHosts = [] } = {}) {
  let chromium
  try {
    ;({ chromium } = await import('playwright'))
  } catch {
    try {
      ;({ chromium } = await import('playwright-core'))
    } catch {
      console.error('playwright が見つかりません。次を実行してください:\n  npm i --no-save playwright-core\n（Chromium の場所は CHROME_PATH で指定）')
      process.exit(1)
    }
  }
  const fallback = '/opt/pw-browsers/chromium'
  const executablePath = process.env.CHROME_PATH || (existsSync(fallback) ? fallback : undefined)
  const args = ['--no-sandbox', '--no-proxy-server']
  const trust = trustHosts.length ? environmentCaPins(trustHosts) : { pins: [], hosts: [] }
  if (trust.pins.length) args.push(`--ignore-certificate-errors-spki-list=${trust.pins.join(',')}`)
  const browser = await chromium.launch({ executablePath, args })
  return Object.assign(browser, { trust })
}
