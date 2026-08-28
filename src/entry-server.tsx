/**
 * ビルド時プリレンダリング（SSG）用のサーバーエントリ。
 *
 * `scripts/prerender.mjs` が `vite build --ssr` でビルドされた本ファイルを
 * 読み込み、`prerenderPages` の各URLを `render()` で静的HTML化する。
 * sitemap.xml も同じ `prerenderPages` から生成されるため、
 * 「sitemapにあるのにプリレンダリングされないURL」は構造上発生しない。
 *
 * ── レンダリング方式 ──────────────────────────
 * クライアントと同じ App.tsx（lazy ルートを含む）をそのまま
 * renderToPipeableStream + onAllReady で描画する。
 * - lazy チャンクはサーバー側で解決されてから出力される
 * - Suspense 境界マーカーが HTML に含まれるため、hydration 時に
 *   React がサーバーHTMLを破棄せず、チャンク読み込みまで表示を維持する
 *   （renderToString ではこのマーカーが出ず hydration mismatch になる）
 * - App.tsx を直接使うため、ルート定義がここと乖離することはない
 *
 * ── 将来の拡張（Research 詳細など）───────────────
 * データ駆動ページを増やす場合は、events / news と同様にデータ配列から
 * prerenderPages へ追加するブロックを書くだけでよい。
 */
import { StrictMode } from 'react'
import { PassThrough } from 'node:stream'
import { renderToPipeableStream } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { HelmetProvider } from 'react-helmet-async'
import type { HelmetServerState } from 'react-helmet-async'
import { App } from '@/App'
import { events } from '@/data/events'
import { newsItems } from '@/data/news'

export type PrerenderPage = {
  /** ルートパス（例: '/events/xxx'）。'/404' は 404.html として出力される */
  path: string
  /** sitemap 用。false のページ（404）は sitemap に含めない */
  sitemap: false | { changefreq: string; priority: string }
  /** prerender.mjs が検証する、このページの title に含まれるべき文字列 */
  expectTitle: string
}

const staticPages: PrerenderPage[] = [
  { path: '/', sitemap: { changefreq: 'weekly', priority: '1.0' }, expectTitle: 'ちょっと進めてみる' },
  { path: '/workshop', sitemap: { changefreq: 'monthly', priority: '0.8' }, expectTitle: 'Workshop' },
  { path: '/events', sitemap: { changefreq: 'weekly', priority: '0.8' }, expectTitle: 'イベント実績' },
  { path: '/research', sitemap: { changefreq: 'monthly', priority: '0.8' }, expectTitle: 'Research' },
  { path: '/collaboration', sitemap: { changefreq: 'monthly', priority: '0.8' }, expectTitle: 'Collaboration' },
  { path: '/creators', sitemap: { changefreq: 'monthly', priority: '0.9' }, expectTitle: 'Creators' },
  { path: '/news', sitemap: { changefreq: 'weekly', priority: '0.7' }, expectTitle: 'News' },
  { path: '/faq', sitemap: { changefreq: 'monthly', priority: '0.6' }, expectTitle: 'FAQ' },
  { path: '/contact', sitemap: { changefreq: 'yearly', priority: '0.7' }, expectTitle: 'Contact' },
]

export const prerenderPages: PrerenderPage[] = [
  ...staticPages,
  ...events.map((e) => ({
    path: `/events/${e.slug}`,
    sitemap: { changefreq: 'monthly', priority: '0.7' } as const,
    expectTitle: e.title,
  })),
  ...newsItems.map((n) => ({
    path: `/news/${n.slug}`,
    sitemap: { changefreq: 'yearly', priority: '0.5' } as const,
    expectTitle: n.title,
  })),
  // 存在しないURL用（Vercel が 404.html として配信する）
  { path: '/404', sitemap: false, expectTitle: 'ページが見つかりません' },
]

export function render(
  url: string,
): Promise<{ html: string; helmet: HelmetServerState }> {
  return new Promise((resolve, reject) => {
    const helmetContext: { helmet?: HelmetServerState } = {}
    const stream = renderToPipeableStream(
      <StrictMode>
        <HelmetProvider context={helmetContext}>
          <StaticRouter location={url}>
            <App />
          </StaticRouter>
        </HelmetProvider>
      </StrictMode>,
      {
        // onShellReady ではなく onAllReady: lazy ルートの解決を待ってから
        // 完全なHTMLを取り出す（SSGなのでストリーミングの必要はない）
        onAllReady() {
          const sink = new PassThrough()
          let html = ''
          sink.on('data', (chunk) => {
            html += chunk
          })
          sink.on('end', () => {
            if (!helmetContext.helmet) {
              reject(new Error(`prerender: ${url} で helmet データを取得できませんでした`))
              return
            }
            resolve({ html, helmet: helmetContext.helmet })
          })
          stream.pipe(sink)
        },
        onError(error) {
          reject(error instanceof Error ? error : new Error(String(error)))
        },
      },
    )
  })
}
