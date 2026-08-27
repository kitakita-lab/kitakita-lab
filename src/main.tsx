import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Analytics } from '@vercel/analytics/react'
import { App } from './App'
import './index.css'

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('Root element #root not found')
}

createRoot(rootEl).render(
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
  </StrictMode>,
)
