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
 * デザインは docs/BRAND.md のトークン（paper / ink / sage / clay）に従い、
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
  console.error(
    'playwright が見つかりません。次を実行してください:\n' +
      '  npm i -D playwright && npx playwright install chromium',
  )
  process.exit(1)
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

/** 1200×630 OGP。public/ogp.svg と同じ構図をサイト実書体で組む。 */
const ogpHtml = `<!doctype html><html><head><meta charset="utf-8"><style>
  ${fontCss}
  * { margin: 0; padding: 0; }
  body { width: 1200px; height: 630px; overflow: hidden; position: relative;
         background: linear-gradient(180deg, #F2F5F3 0%, #F7F8F6 100%);
         font-family: 'Shippori Mincho', serif; }
  .circle { position: absolute; border-radius: 9999px; }
  .c1 { left: -90px; top: -120px; width: 480px; height: 480px; background: #E2E9E5; opacity: .5; }
  .c2 { left: 860px; top: 340px; width: 400px; height: 400px; background: #F5F1E6; opacity: .6; }
  .content { position: absolute; left: 96px; top: 96px; }
  .logo { display: flex; align-items: center; gap: 18px; }
  .mark { width: 52px; height: 52px; border-radius: 12px; background: #1F2622;
          display: flex; align-items: center; justify-content: center;
          color: #F7F8F6; font-size: 30px; font-weight: 600; }
  .name { font-size: 28px; font-weight: 600; color: #1F2622; letter-spacing: .02em; }
  h1 { margin-top: 96px; font-size: 76px; font-weight: 600; letter-spacing: .09em; color: #1F2622; }
  h1 .accent { color: #8F7433; }
  .tagline { margin-top: 44px; font-size: 30px; font-weight: 600; letter-spacing: .14em; color: #57615B; }
  .place { margin-top: 40px; font-family: 'Zen Kaku Gothic New', sans-serif;
           font-size: 21px; font-weight: 500; letter-spacing: .3em; color: #66706A; }
</style></head><body>
  <div class="circle c1"></div>
  <div class="circle c2"></div>
  <div class="content">
    <div class="logo">
      <div class="mark">K</div>
      <div class="name">KitaKita Lab</div>
    </div>
    <h1>少し進めてみ<span class="accent">る</span></h1>
    <p class="tagline">少し前へ。少し良く。少し豊かに。</p>
    <p class="place">北海道から</p>
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
