/**
 * ビルド時プリレンダリング（SSG） + sitemap.xml 生成。
 *
 * `npm run build` の最後に実行される（package.json の build スクリプト参照）。
 *
 * 1. `vite build --ssr` で生成した dist-ssr/entry-server.js から
 *    `prerenderPages`（全公開URL）と `render()` を読み込む
 * 2. 各URLを renderToString し、dist/index.html をテンプレートとして
 *    - <!-- ssg:head:start --> 〜 <!-- ssg:head:end --> をページ固有の
 *      title / meta / canonical / OG / JSON-LD（react-helmet-async の出力）に置換
 *    - <div id="root"></div> にレンダリング済み本文を注入
 *    し、dist/<path>/index.html として書き出す（'/404' は dist/404.html）
 * 3. 同じ prerenderPages から sitemap.xml を生成（dist と public の両方へ）。
 *    sitemap とプリレンダリング対象が別リストになって乖離することはない。
 *
 * lastmod は出力しない（各ページの実際の更新日を管理していないため。
 * ビルド日時での偽装はしない）。
 *
 * 検証もここで行い、失敗したらビルドごと失敗させる:
 * - 各ページの title が期待文字列（expectTitle）を含むこと
 * - title / description / canonical が各1つであること（meta重複の再発防止）
 * - 本文が空でないこと
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const ORIGIN = 'https://www.kitakita-lab.com'

const { render, prerenderPages } = await import(
  join(root, 'dist-ssr/entry-server.js')
)

const template = await readFile(join(root, 'dist/index.html'), 'utf8')

const HEAD_START = '<!-- ssg:head:start'
const HEAD_END = '<!-- ssg:head:end -->'
const startIdx = template.indexOf(HEAD_START)
const endIdx = template.indexOf(HEAD_END)
if (startIdx === -1 || endIdx === -1) {
  throw new Error('prerender: index.html に ssg:head マーカーが見つかりません')
}

const ROOT_DIV = '<div id="root"></div>'
if (!template.includes(ROOT_DIV)) {
  throw new Error('prerender: index.html に <div id="root"></div> が見つかりません')
}

const count = (haystack, needle) => haystack.split(needle).length - 1

const titles = new Set()
let written = 0

for (const page of prerenderPages) {
  const { html, helmet } = await render(page.path)

  const head = [
    helmet.title.toString(),
    helmet.meta.toString(),
    helmet.link.toString(),
    helmet.script.toString(),
  ]
    .filter(Boolean)
    .join('\n    ')

  const out =
    template.slice(0, startIdx) +
    head +
    '\n    ' +
    template.slice(endIdx + HEAD_END.length) // マーカーごと静的metaを除去

  const finalHtml = out.replace(ROOT_DIV, `<div id="root">${html}</div>`)

  // ── 検証（失敗したらビルドを止める）──────────────
  const titleMatch = finalHtml.match(/<title[^>]*>([^<]*)<\/title>/)
  const title = titleMatch ? titleMatch[1] : ''
  if (!title.includes(page.expectTitle)) {
    throw new Error(
      `prerender: ${page.path} の title「${title}」に「${page.expectTitle}」が含まれません。` +
        ' App.tsx と entry-server.tsx のルートが乖離していないか確認してください。',
    )
  }
  if (count(finalHtml, '<title') !== 1)
    throw new Error(`prerender: ${page.path} の title が1つではありません`)
  if (count(finalHtml, 'name="description"') !== 1)
    throw new Error(`prerender: ${page.path} の description が1つではありません`)
  if (count(finalHtml, 'rel="canonical"') !== 1)
    throw new Error(`prerender: ${page.path} の canonical が1つではありません`)
  if (html.length < 1000)
    throw new Error(`prerender: ${page.path} の本文が短すぎます（${html.length}文字）`)
  if (page.path !== '/' && page.sitemap !== false) {
    if (titles.has(title)) throw new Error(`prerender: title が重複: ${title}`)
    titles.add(title)
  }

  // ── 書き出し ──────────────────────────────
  const outPath =
    page.path === '/'
      ? join(root, 'dist/index.html')
      : page.path === '/404'
        ? join(root, 'dist/404.html')
        : join(root, 'dist', page.path.slice(1), 'index.html')
  await mkdir(dirname(outPath), { recursive: true })
  await writeFile(outPath, finalHtml)
  written++
}

// ── sitemap.xml（プリレンダリング対象と同一ソース）──────
const urls = prerenderPages
  .filter((p) => p.sitemap !== false)
  .map(
    (p) =>
      `  <url><loc>${ORIGIN}${p.path === '/' ? '/' : p.path}</loc>` +
      `<changefreq>${p.sitemap.changefreq}</changefreq>` +
      `<priority>${p.sitemap.priority}</priority></url>`,
  )

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`
await writeFile(join(root, 'dist/sitemap.xml'), xml)
await writeFile(join(root, 'public/sitemap.xml'), xml)

console.log(
  `prerender: ${written} pages written (${urls.length} in sitemap + 404), host = ${ORIGIN}`,
)
