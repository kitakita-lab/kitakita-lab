/**
 * OGP画像・タッチアイコンの生成スクリプト。
 *
 *   node scripts/generate-og.mjs
 *
 * 生成物（public/ 直下）:
 *   - ogp.png              1200×630  … og:image / twitter:image
 *   - apple-touch-icon.png  180×180  … iOS「ホーム画面に追加」
 *   - icon-512.png          512×512  … Organization JSON-LD の logo など
 *
 * デザインはサイトの配色トークン（tailwind.config.js の paper / ink / clay）に従い、
 * サイト実書体（Shippori Mincho / Zen Kaku Gothic New）のサブセットを
 * scripts/og-assets/ に同梱しているため、ネットワーク不要で再現できます。
 * 文言を変えるときは、含まれないグリフが出たら Google Fonts の
 * css2?text= サブセットを取り直して og-assets/ を更新してください。
 *
 * 依存: playwright（devDependencies には含めていません。未インストールなら
 *   npm i -D playwright && npx playwright install chromium
 * を実行してから使ってください）。
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

let chromium
try {
  ;({ chromium } = await import('playwright'))
} catch {
  try {
    // playwright-core + CHROME_PATH（既存の Chromium を使う）でも動く
    ;({ chromium } = await import('playwright-core'))
  } catch {
    console.error(
      'playwright が見つかりません。次を実行してください:\n' +
        '  npm i -D playwright && npx playwright install chromium',
    )
    process.exit(1)
  }
}

const b64 = async (p) => (await readFile(p)).toString('base64')
const serif = await b64(join(here, 'og-assets/shippori-mincho-600-subset.woff2'))
const sans = await b64(join(here, 'og-assets/zen-kaku-500-subset.woff2'))

const fontCss = `
  @font-face {
    font-family: 'Shippori Mincho';
    font-weight: 600;
    src: url(data:font/woff2;base64,${serif}) format('woff2');
  }
  @font-face {
    font-family: 'Zen Kaku Gothic New';
    font-weight: 500;
    src: url(data:font/woff2;base64,${sans}) format('woff2');
  }
`

/**
 * 1200×630 OGP。中心は「KitaKita Lab」と「ちょっと進めてみる」だけ。
 * 配色はサイトの v2 トークン（paper #F7F8F8 / ink #22272B / slate #4B6479）に合わせ、
 * 地は空の明るさに寄せた淡いブルーグレーから紙色へのグラデーション。
 * 旧タグライン（三連コピー）と「北海道から」は 2026-09 に外した（Hero と同じ）。
 */
const ogpHtml = `<!doctype html><html><head><meta charset="utf-8"><style>
  ${fontCss}
  * { margin: 0; padding: 0; }
  body { width: 1200px; height: 630px; overflow: hidden; position: relative;
         background: linear-gradient(180deg, #E6EDF3 0%, #F7F8F8 72%);
         font-family: 'Shippori Mincho', serif; }
  .light { position: absolute; border-radius: 9999px; background: #FFFFFF; opacity: .55;
           filter: blur(60px); }
  .l1 { left: 720px; top: -220px; width: 620px; height: 620px; }
  .content { position: absolute; left: 96px; top: 96px; right: 96px; }
  .logo { display: flex; align-items: center; gap: 18px; }
  .mark { width: 52px; height: 52px; border-radius: 12px; background: #22272B;
          display: flex; align-items: center; justify-content: center;
          color: #F7F8F8; font-size: 30px; font-weight: 600; }
  .name { font-size: 28px; font-weight: 600; color: #22272B; letter-spacing: .02em; }
  h1 { margin-top: 150px; font-size: 76px; font-weight: 600; letter-spacing: .09em; color: #22272B; }
  h1 .accent { color: #4B6479; }
</style></head><body>
  <div class="light l1"></div>
  <div class="content">
    <div class="logo">
      <div class="mark">K</div>
      <div class="name">KitaKita Lab</div>
    </div>
    <h1>ちょっと進めてみ<span class="accent">る</span></h1>
  </div>
</body></html>`

/**
 * 正方形アイコン（apple-touch-icon / icon-512）。favicon.svg と同じ K マーク。
 * どちらも全面塗りの正方形で出力する（iOS は自動で角丸マスクを適用し、
 * Organization ロゴも正方形が標準のため、こちら側で角丸にはしない）。
 */
const iconHtml = (size) => `<!doctype html><html><head><meta charset="utf-8"><style>
  ${fontCss}
  * { margin: 0; padding: 0; }
  body { width: ${size}px; height: ${size}px; background: #1F2622;
         display: flex; align-items: center; justify-content: center; }
  span { font-family: 'Shippori Mincho', serif; font-weight: 600;
         font-size: ${Math.round(size * 0.62)}px; color: #F7F8F6;
         transform: translateY(-${Math.round(size * 0.02)}px); }
</style></head><body><span>K</span></body></html>`

// CHROME_PATH で任意の Chromium 実行ファイルを指定可能
// （playwright install 済みの環境では未指定でそのまま動く）。
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: ['--no-sandbox', '--no-proxy-server'],
})

async function shoot(html, width, height, out) {
  const page = await browser.newPage({ viewport: { width, height } })
  await page.setContent(html, { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: join(root, 'public', out) })
  await page.close()
  console.log('generated public/' + out)
}

await mkdir(join(root, 'public'), { recursive: true })
await shoot(ogpHtml, 1200, 630, 'ogp.png')
await shoot(iconHtml(180), 180, 180, 'apple-touch-icon.png')
await shoot(iconHtml(512), 512, 512, 'icon-512.png')

await browser.close()
console.log('done')
