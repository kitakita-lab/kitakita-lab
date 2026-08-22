/**
 * sitemap.xml 生成スクリプト（npm run build 前に prebuild で自動実行）。
 *
 * 固定ページ一覧と、src/data/news.ts・src/data/events.ts の slug から
 * /news/:slug・/events/:slug を組み立てて public/sitemap.xml を書き出す。
 * News やイベント実績を追加・削除すると次のビルドで sitemap も自動で
 * 追従するため、手動更新は不要。
 */
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const ORIGIN = 'https://kitakita-lab.com'

const staticPages = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/workshop', changefreq: 'monthly', priority: '0.8' },
  { path: '/events', changefreq: 'weekly', priority: '0.8' },
  { path: '/research', changefreq: 'monthly', priority: '0.8' },
  { path: '/collaboration', changefreq: 'monthly', priority: '0.8' },
  { path: '/creators', changefreq: 'monthly', priority: '0.9' },
  { path: '/news', changefreq: 'weekly', priority: '0.7' },
  { path: '/faq', changefreq: 'monthly', priority: '0.6' },
  { path: '/contact', changefreq: 'yearly', priority: '0.7' },
]

// news.ts / events.ts はデータ定義のみの TS なので、slug をパターン抽出する。
// 形式が変わって抽出できなくなった場合はビルドを止めて気付けるようにする。
const extractSlugs = async (relPath) => {
  const source = await readFile(join(root, relPath), 'utf8')
  // 同じ slug が別データ（例: events.ts の brandJourney からの参照）にも
  // 現れることがあるため、重複は除いて抽出する。
  const slugs = [
    ...new Set([...source.matchAll(/^\s*slug:\s*'([^']+)'/gm)].map((m) => m[1])),
  ]
  if (slugs.length === 0) {
    console.error(`generate-sitemap: ${relPath} から slug を抽出できませんでした。`)
    process.exit(1)
  }
  return slugs
}
const slugs = await extractSlugs('src/data/news.ts')
const eventSlugs = await extractSlugs('src/data/events.ts')

const urls = [
  ...staticPages.map(
    (p) =>
      `  <url><loc>${ORIGIN}${p.path}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`,
  ),
  ...eventSlugs.map(
    (s) =>
      `  <url><loc>${ORIGIN}/events/${s}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
  ),
  ...slugs.map(
    (s) =>
      `  <url><loc>${ORIGIN}/news/${s}</loc><changefreq>yearly</changefreq><priority>0.5</priority></url>`,
  ),
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`

await writeFile(join(root, 'public/sitemap.xml'), xml)
console.log(
  `generated public/sitemap.xml (${staticPages.length} pages + ${eventSlugs.length} events + ${slugs.length} news)`,
)
