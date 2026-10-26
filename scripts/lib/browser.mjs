/**
 * ハーネス用スクリプト（visual-check / prepare-event-photos）が使う Chromium の読み込み。
 *
 * generate-og.mjs と同じく、playwright は devDependencies に含めない。使うときだけ
 *   npm i --no-save playwright-core     （package.json・lock を変えずに入れる）
 * で入れ、Chromium は CHROME_PATH（未指定なら /opt/pw-browsers/chromium があればそれ）を使う。
 * playwright 本体（npx playwright install chromium 済み）が入っていればそちらを優先する。
 */
import { existsSync } from 'node:fs'

export async function launchChromium() {
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
  return chromium.launch({ executablePath, args: ['--no-sandbox', '--no-proxy-server'] })
}
