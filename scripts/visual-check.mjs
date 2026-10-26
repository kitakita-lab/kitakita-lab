/**
 * ビルド済みサイト（dist/）の表示確認（実績更新ハーネス。docs/EVENT-UPDATE.md）。
 *
 *   npm run build && node scripts/visual-check.mjs [--shots /events/<slug>,/events] [--only /events/<slug>,/] [--out <dir>]
 *
 * - dist/ を内蔵の静的サーバーで配信する（Cloudflare Pages と同じく /path → path.html）
 * - sitemap の全ページ（--only 指定時はそのページ）× 6 幅（320〜1440px）で次を検出する
 *     横スクロール（ページ幅のはみ出し）／読み込めない画像／JavaScript のエラー
 * - --shots のページは 390px・1440px のフルページ画像を --out（既定 visual-check/）に保存する
 *   （フェードイン演出を止め、固定ヘッダーを通常配置にして撮る）
 * - 外部への通信（Google Fonts など）は遮断する。書体は代替フォントで描画される点に注意
 *
 * 問題がなければ終了コード 0、検出したら 1。
 */
import http from 'node:http'
import { readFile, mkdir, stat } from 'node:fs/promises'
import { dirname, join, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { launchChromium } from './lib/browser.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const WIDTHS = [320, 375, 390, 430, 768, 1440]
const arg = (name) => {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : undefined
}
const list = (v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : [])
const shots = list(arg('--shots'))
const outDir = resolve(root, arg('--out') ?? 'visual-check')

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain', '.woff2': 'font/woff2', '.json': 'application/json' }
const isFile = async (p) => (await stat(p).catch(() => null))?.isFile() ?? false
const server = http.createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  const candidates = path.endsWith('/') ? [join(dist, path, 'index.html')] : [join(dist, path), join(dist, `${path}.html`), join(dist, path, 'index.html')]
  for (const file of candidates) {
    if (file.startsWith(dist) && (await isFile(file))) {
      res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' })
      return res.end(await readFile(file))
    }
  }
  res.writeHead(404, { 'content-type': TYPES['.html'] })
  res.end(await readFile(join(dist, '404.html')).catch(() => 'not found'))
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const base = `http://127.0.0.1:${server.address().port}`

const sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8').catch(() => {
  console.error('dist/sitemap.xml がありません。先に npm run build を実行してください。')
  process.exit(1)
})
const allPaths = [...sitemap.matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => m[1] || '/')
const paths = list(arg('--only')).length ? list(arg('--only')) : allPaths

const browser = await launchChromium()
const issues = []
for (const width of WIDTHS) {
  const context = await browser.newContext({ viewport: { width, height: 900 } })
  await context.route('**/*', (route) => (route.request().url().startsWith(base) ? route.continue() : route.abort()))
  const page = await context.newPage()
  let current = ''
  page.on('pageerror', (e) => issues.push({ path: current, width, kind: 'JavaScript エラー', detail: e.message }))
  for (const path of paths) {
    current = path
    const res = await page.goto(base + path, { waitUntil: 'networkidle' })
    if (!res || res.status() !== 200) {
      issues.push({ path, width, kind: 'HTTP', detail: String(res?.status()) })
      continue
    }
    // 遅延読み込みの画像も読み込ませてから判定する
    await page.evaluate(async () => {
      document.querySelectorAll('img[loading="lazy"]').forEach((img) => (img.loading = 'eager'))
      await Promise.all([...document.images].map((img) => (img.complete ? null : new Promise((r) => { img.onload = img.onerror = r }))))
    })
    const r = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      broken: [...document.images].filter((img) => img.currentSrc && img.naturalWidth === 0).map((img) => img.currentSrc.replace(location.origin, '')),
    }))
    if (r.overflow > 1) issues.push({ path, width, kind: '横スクロール', detail: `${r.overflow}px はみ出し` })
    for (const src of r.broken) issues.push({ path, width, kind: '画像を読み込めない', detail: src })
    if (shots.includes(path) && (width === 390 || width === 1440)) {
      await page.addStyleTag({ content: '.reveal{opacity:1!important;transform:none!important;transition:none!important} header{position:static!important}' })
      await mkdir(outDir, { recursive: true })
      const file = join(outDir, `${path.replace(/^\/$/, 'home').replace(/^\//, '').replace(/\//g, '_')}-${width}.png`)
      await page.screenshot({ path: file, fullPage: true })
      console.log(`screenshot: ${file.replace(root + '/', '')}`)
    }
  }
  await context.close()
}
await browser.close()
server.close()

console.log(`checked: ${paths.length} pages × ${WIDTHS.length} widths`)
if (issues.length) {
  console.table(issues)
  process.exit(1)
}
console.log('issues: 0')
