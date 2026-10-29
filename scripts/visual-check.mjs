/**
 * 表示確認（実績更新ハーネス。docs/EVENT-UPDATE.md）。
 *
 *   ローカル（ビルド済み dist/）:
 *     npm run build && node scripts/visual-check.mjs [--shots /events/<slug>,/events] [--only /events/<slug>,/] [--out <dir>]
 *   本番（公開 URL）:
 *     node scripts/visual-check.mjs --base https://www.kitakita-lab.com [--only ...] [--shots ...] [--out <dir>]
 *
 * - ローカル: dist/ を内蔵の静的サーバーで配信する（Cloudflare Pages と同じく /path → path.html）。
 *   外部への通信（Google Fonts など）は遮断する。書体は代替フォントで描画される点に注意
 * - 本番: 公開 URL を Chromium で直接開く（lib/browser.mjs。証明書は検証したうえで開く）。
 *   公開サイトと Google Fonts（fonts.googleapis.com・fonts.gstatic.com）だけを読み込み、それ以外の外部通信
 *   （アクセス解析など）は遮断して「対象外」として一覧にする。読み込めなかったリソースは「未検証」として一覧にする
 * - sitemap の全ページ（--only 指定時はそのページ）× 6 幅（320〜1440px）で次を検出する
 *     横スクロール（ページ幅のはみ出し）／読み込めない画像／JavaScript のエラー／HTTP 200 以外
 * - --shots のページは 390px・1440px のフルページ画像を --out（既定 visual-check/）に保存する
 *   （フェードイン演出を止め、固定ヘッダーを通常配置にして撮る。本番は production_ を付けたファイル名）
 * - 結果は --out の report-local.json / report-production.json にも保存する（どちらの確認かを target に記録）
 *
 * 終了コード: 0 = 問題なし（本番は表示に関わるリソースをすべて読み込めた）、1 = 問題を検出、
 *             3 = 本番で問題はないが、読み込めないリソースがあり一部を検証できていない
 */
import http from 'node:http'
import { readFile, mkdir, stat, writeFile } from 'node:fs/promises'
import { dirname, join, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { launchChromium } from './lib/browser.mjs'
import { summarizeResources } from './lib/browser-trust.mjs'

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
const remote = arg('--base')
const target = remote ? 'production' : 'local'

let base
let server
let allowedOrigins
if (remote) {
  const u = new URL(remote)
  if (u.protocol !== 'https:') throw new Error('--base は https の URL で指定する')
  base = u.origin
  allowedOrigins = new Set([base, 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'])
} else {
  const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain', '.woff2': 'font/woff2', '.json': 'application/json' }
  const isFile = async (p) => (await stat(p).catch(() => null))?.isFile() ?? false
  server = http.createServer(async (req, res) => {
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
  base = `http://127.0.0.1:${server.address().port}`
  allowedOrigins = new Set([base])
}

const browser = await launchChromium(remote ? { trustHosts: [...allowedOrigins].map((o) => new URL(o).hostname) } : {})
if (remote) {
  for (const h of browser.trust.hosts) console.log(`証明書: ${h.host} … ${h.verified ? `検証済み（${h.detail}）` : `検証なし（${h.detail}）`}`)
}

let sitemap
if (remote) {
  const page = await browser.newPage()
  const res = await page.goto(`${base}/sitemap.xml`).catch((e) => {
    console.error(`本番の sitemap.xml を開けない: ${e.message.split('\n')[0]}`)
    process.exit(1)
  })
  sitemap = res.status() === 200 ? await res.text() : ''
  await page.close()
} else {
  sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8').catch(() => {
    console.error('dist/sitemap.xml がありません。先に npm run build を実行してください。')
    process.exit(1)
  })
}
const allPaths = [...sitemap.matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => m[1] || '/')
const paths = list(arg('--only')).length ? list(arg('--only')) : allPaths
if (paths.length === 0) {
  console.error('確認するページがない（sitemap を読めない。--only で指定する）')
  process.exit(1)
}

const issues = []
const resources = []
for (const width of WIDTHS) {
  const context = await browser.newContext({ viewport: { width, height: 900 } })
  await context.route('**/*', (route) => {
    const url = route.request().url()
    if (allowedOrigins.has(new URL(url).origin)) return route.continue()
    if (remote) resources.push({ type: route.request().resourceType(), url, ok: false, outOfScope: true })
    return route.abort()
  })
  const page = await context.newPage()
  let current = ''
  page.on('pageerror', (e) => issues.push({ path: current, width, kind: 'JavaScript エラー', detail: e.message }))
  if (remote) {
    page.on('requestfinished', async (req) => {
      const res = await req.response()
      const status = res?.status() ?? null
      resources.push({ type: req.resourceType(), url: req.url(), ok: status !== null && status < 400, status })
    })
    page.on('requestfailed', (req) => {
      if (!allowedOrigins.has(new URL(req.url()).origin)) return // 遮断した対象外の通信は route で記録済み
      resources.push({ type: req.resourceType(), url: req.url(), ok: false, error: req.failure()?.errorText })
    })
  }
  for (const path of paths) {
    current = path
    const res = await page.goto(base + path, { waitUntil: 'networkidle' }).catch((e) => {
      issues.push({ path, width, kind: '読み込み失敗', detail: e.message.split('\n')[0] })
      return null
    })
    if (!res) continue
    if (res.status() !== 200) {
      issues.push({ path, width, kind: 'HTTP', detail: String(res.status()) })
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
      await page.evaluate(() => document.fonts.ready)
      await mkdir(outDir, { recursive: true })
      const name = `${path.replace(/^\/$/, 'home').replace(/^\//, '').replace(/\//g, '_')}-${width}.png`
      const file = join(outDir, remote ? `production_${name}` : name)
      await page.screenshot({ path: file, fullPage: true })
      console.log(`screenshot: ${file.replace(root + '/', '')}`)
    }
  }
  await context.close()
}
await browser.close()
server?.close()

const summary = remote ? summarizeResources(resources) : null
const report = {
  target,
  base: remote ? base : 'dist/（ローカル）',
  checkedAt: new Date().toISOString(),
  pages: paths.length,
  widths: WIDTHS,
  issues,
  ...(remote
    ? {
        certificates: browser.trust.hosts,
        resources: summary.byType,
        unverified: summary.failed.map((f) => `${f.type} ${f.url} (${f.error ?? f.status})`),
        outOfScope: summary.outOfScope,
      }
    : { note: '外部への通信を遮断して描画（書体は代替フォント）。本番の確認ではない' }),
}
await mkdir(outDir, { recursive: true })
await writeFile(join(outDir, `report-${target}.json`), JSON.stringify(report, null, 2))

console.log(`[${target}] checked: ${paths.length} pages × ${WIDTHS.length} widths`)
if (remote) {
  console.log(`[${target}] 読み込み: ${Object.entries(summary.byType).map(([t, c]) => `${t} ${c.loaded}${c.failed ? `（失敗 ${c.failed}）` : ''}`).join(' / ')}`)
  if (summary.outOfScope.length) console.log(`[${target}] 対象外として遮断（本番で検証していない）: ${summary.outOfScope.join(', ')}`)
}
if (issues.length) {
  console.table(issues)
  process.exit(1)
}
if (remote && summary.verdict === 'PARTIAL') {
  console.log(`[${target}] 未検証（読み込めなかった）:`)
  for (const u of report.unverified.slice(0, 20)) console.log(`  ${u}`)
  process.exit(3)
}
console.log(`[${target}] issues: 0`)
