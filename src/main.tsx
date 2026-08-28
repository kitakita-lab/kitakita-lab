import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Analytics } from '@vercel/analytics/react'
import { App } from './App'
import './index.css'

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('Root element #root not found')
}

const app = (
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
        {/* Vercel Web Analytics: Cookieレスのページビュー計測。
            本番（Vercel上）でのみ送信され、開発環境では何も送らない。
            SPAのルート遷移も自動で計測される。 */}
        <Analytics />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
)

// 本番はビルド時プリレンダリング（scripts/prerender.mjs）済みのHTMLを
// hydrate する。開発サーバー（root が空）ではこれまで通り CSR で描画。
// lazy なルートは Suspense 境界ごとに、チャンク読み込み完了まで
// サーバーHTMLがそのまま表示され続ける（React 18 の選択的hydration）。
if (rootEl.hasChildNodes()) {
  hydrateRoot(rootEl, app)
} else {
  createRoot(rootEl).render(app)
}
