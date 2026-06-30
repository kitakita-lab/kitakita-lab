import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { HomePage } from '@/pages/HomePage'
import { WorkshopPage } from '@/pages/WorkshopPage'
import { ResearchPage } from '@/pages/ResearchPage'
import { CollaborationPage } from '@/pages/CollaborationPage'
import { CreatorsPage } from '@/pages/CreatorsPage'
import { NewsPage } from '@/pages/NewsPage'
import { NewsDetailPage } from '@/pages/NewsDetailPage'
import { FaqPage } from '@/pages/FaqPage'
import { ContactPage } from '@/pages/ContactPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="workshop" element={<WorkshopPage />} />
        <Route path="research" element={<ResearchPage />} />
        <Route path="collaboration" element={<CollaborationPage />} />
        <Route path="creators" element={<CreatorsPage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="news/:slug" element={<NewsDetailPage />} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
