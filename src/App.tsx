import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { HomePage } from '@/pages/HomePage'
import { lazyWithRetry } from '@/lib/lazyWithRetry'

// Home is eager (landing page → best LCP). Secondary pages are code-split so
// the initial bundle stays small; each route loads on demand. lazyWithRetry
// self-heals stale-chunk errors that can occur right after a redeploy.
const WorkshopPage = lazyWithRetry(() =>
  import('@/pages/WorkshopPage').then((m) => ({ default: m.WorkshopPage })),
)
const ResearchPage = lazyWithRetry(() =>
  import('@/pages/ResearchPage').then((m) => ({ default: m.ResearchPage })),
)
const CollaborationPage = lazyWithRetry(() =>
  import('@/pages/CollaborationPage').then((m) => ({ default: m.CollaborationPage })),
)
const CreatorsPage = lazyWithRetry(() =>
  import('@/pages/CreatorsPage').then((m) => ({ default: m.CreatorsPage })),
)
const NewsPage = lazyWithRetry(() =>
  import('@/pages/NewsPage').then((m) => ({ default: m.NewsPage })),
)
const NewsDetailPage = lazyWithRetry(() =>
  import('@/pages/NewsDetailPage').then((m) => ({ default: m.NewsDetailPage })),
)
const FaqPage = lazyWithRetry(() =>
  import('@/pages/FaqPage').then((m) => ({ default: m.FaqPage })),
)
const ContactPage = lazyWithRetry(() =>
  import('@/pages/ContactPage').then((m) => ({ default: m.ContactPage })),
)
const NotFoundPage = lazyWithRetry(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

/**
 * Minimal, layout-stable fallback shown while a route chunk loads.
 * min-h-screen (not a smaller fraction) keeps the Footer below the fold
 * during the loading state itself, so pages with more content than a
 * shorter placeholder don't yank the Footer into view and back out —
 * measured as a large CLS spike on Workshop once its content grew.
 */
function RouteFallback() {
  return <div className="min-h-screen" aria-hidden="true" />
}

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route
          path="workshop"
          element={
            <Suspense fallback={<RouteFallback />}>
              <WorkshopPage />
            </Suspense>
          }
        />
        <Route
          path="research"
          element={
            <Suspense fallback={<RouteFallback />}>
              <ResearchPage />
            </Suspense>
          }
        />
        <Route
          path="collaboration"
          element={
            <Suspense fallback={<RouteFallback />}>
              <CollaborationPage />
            </Suspense>
          }
        />
        <Route
          path="creators"
          element={
            <Suspense fallback={<RouteFallback />}>
              <CreatorsPage />
            </Suspense>
          }
        />
        <Route
          path="news"
          element={
            <Suspense fallback={<RouteFallback />}>
              <NewsPage />
            </Suspense>
          }
        />
        <Route
          path="news/:slug"
          element={
            <Suspense fallback={<RouteFallback />}>
              <NewsDetailPage />
            </Suspense>
          }
        />
        <Route
          path="faq"
          element={
            <Suspense fallback={<RouteFallback />}>
              <FaqPage />
            </Suspense>
          }
        />
        <Route
          path="contact"
          element={
            <Suspense fallback={<RouteFallback />}>
              <ContactPage />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<RouteFallback />}>
              <NotFoundPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  )
}
