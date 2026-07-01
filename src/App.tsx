import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { HomePage } from '@/pages/HomePage'

// Home is eager (landing page → best LCP). Secondary pages are code-split so
// the initial bundle stays small; each route loads on demand.
const WorkshopPage = lazy(() =>
  import('@/pages/WorkshopPage').then((m) => ({ default: m.WorkshopPage })),
)
const ResearchPage = lazy(() =>
  import('@/pages/ResearchPage').then((m) => ({ default: m.ResearchPage })),
)
const CollaborationPage = lazy(() =>
  import('@/pages/CollaborationPage').then((m) => ({ default: m.CollaborationPage })),
)
const CreatorsPage = lazy(() =>
  import('@/pages/CreatorsPage').then((m) => ({ default: m.CreatorsPage })),
)
const NewsPage = lazy(() =>
  import('@/pages/NewsPage').then((m) => ({ default: m.NewsPage })),
)
const NewsDetailPage = lazy(() =>
  import('@/pages/NewsDetailPage').then((m) => ({ default: m.NewsDetailPage })),
)
const FaqPage = lazy(() =>
  import('@/pages/FaqPage').then((m) => ({ default: m.FaqPage })),
)
const ContactPage = lazy(() =>
  import('@/pages/ContactPage').then((m) => ({ default: m.ContactPage })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

/** Minimal, layout-stable fallback (avoids CLS while a route chunk loads). */
function RouteFallback() {
  return <div className="min-h-[60vh]" aria-hidden="true" />
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
