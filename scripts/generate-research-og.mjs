/**
 * 調査レポート専用の OGP 画像（1200×630）を生成する。
 *
 *   node scripts/generate-research-og.mjs
 *
 * 生成物: public/research/<slug>/og.png（src/data/research.ts の ogImage と同じパス）
 *
 * 基本の ogp.png（scripts/generate-og.mjs）と同じ地色・ロゴ・書体で、
 * 調査名と回答数だけを載せる。数字の強調やグラフは載せない（SNS の小さな
 * サムネイルで読めず、調査会社の広告のように見えるため）。
 *
 * 書体は scripts/og-assets/research-*.woff2（下の文言だけを含むサブセット）。
 * 文言を変えたら、Google Fonts の css2?text= でサブセットを取り直すこと
 * （含まれない文字はフォールバック書体で描かれ、見た目が崩れる）。
 *
 * 依存: playwright または playwright-core（generate-og.mjs と同じ）。
 */
import { readFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

/** 調査ごとの文言。research.ts に調査を足したら、ここにも 1 件足す。 */
const reports = [
  {
    slug: 'hokkaido-mall-workshop-demand-2026',
    titleLines: ['北海道の商業施設における', 'ワークショップ・体験イベントの需要調査'],
    meta: '北海道在住の20〜50代・1,023名｜2026年9月調査',
  },
]

let chromium
try {
  ;({ chromium } = await import('playwright'))
} catch {
  try {
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
const serif = await b64(join(here, 'og-assets/research-shippori-mincho-600-subset.woff2'))
const sans = await b64(join(here, 'og-assets/research-zen-kaku-500-subset.woff2'))

const fontCss = `
  @font-face { font-family: 'Shippori Mincho'; font-weight: 600;
    src: url(data:font/woff2;base64,${serif}) format('woff2'); }
  @font-face { font-family: 'Zen Kaku Gothic New'; font-weight: 500;
    src: url(data:font/woff2;base64,${sans}) format('woff2'); }
`

const html = (r) => `<!doctype html><html><head><meta charset="utf-8"><style>
  ${fontCss}
  * { margin: 0; padding: 0; }
  body { width: 1200px; height: 630px; overflow: hidden; position: relative;
         background: linear-gradient(180deg, #E6EDF3 0%, #F7F8F8 72%);
         font-family: 'Shippori Mincho', serif; color: #22272B; }
  .light { position: absolute; left: 720px; top: -220px; width: 620px; height: 620px;
           border-radius: 9999px; background: #FFFFFF; opacity: .55; filter: blur(60px); }
  .content { position: absolute; left: 96px; top: 88px; right: 96px; bottom: 88px;
             display: flex; flex-direction: column; }
  .logo { display: flex; align-items: center; gap: 18px; }
  .mark { width: 52px; height: 52px; border-radius: 12px; background: #22272B;
          display: flex; align-items: center; justify-content: center;
          color: #F7F8F8; font-size: 30px; font-weight: 600; }
  .name { font-size: 28px; font-weight: 600; letter-spacing: .02em; }
  .eyebrow { margin-top: auto; font-family: 'Zen Kaku Gothic New', sans-serif; font-weight: 500;
             font-size: 20px; letter-spacing: .3em; color: #4B6479; }
  h1 { margin-top: 18px; font-size: 48px; font-weight: 600; line-height: 1.4; letter-spacing: .02em; white-space: nowrap; }
  h1 span { display: block; }
  .meta { margin-top: 28px; font-family: 'Zen Kaku Gothic New', sans-serif; font-weight: 500;
          font-size: 24px; color: #545D65; letter-spacing: .04em; }
</style></head><body>
  <div class="light"></div>
  <div class="content">
    <div class="logo"><div class="mark">K</div><div class="name">KitaKita Lab</div></div>
    <div class="eyebrow">RESEARCH</div>
    <h1>${r.titleLines.map((l) => `<span>${l}</span>`).join('')}</h1>
    <div class="meta">${r.meta}</div>
  </div>
</body></html>`

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: ['--no-sandbox', '--no-proxy-server'],
})

for (const r of reports) {
  const out = join('research', r.slug, 'og.png')
  await mkdir(join(root, 'public', 'research', r.slug), { recursive: true })
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
  await page.setContent(html(r), { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: join(root, 'public', out) })
  await page.close()
  console.log('generated public/' + out)
}

await browser.close()
