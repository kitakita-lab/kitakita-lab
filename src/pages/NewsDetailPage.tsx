import { useParams, Navigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Seo } from '@/components/Seo'
import { site } from '@/data/site'
import { Section } from '@/components/ui/Section'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { newsItems } from '@/data/news'
import { formatDate } from '@/lib/date'
import { Segments } from '@/components/ui/Segments'
import { typeset } from '@/lib/typo'

export function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const item = newsItems.find((n) => n.slug === slug)

  if (!item) {
    return <Navigate to="/news" replace />
  }

  // NewsArticle 構造化データ。公開日が確定している記事（dateLabel なし）のみ
  // datePublished を含める — 未確定の日付を検索エンジンに事実として渡さない。
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: item.title,
    description: item.excerpt,
    mainEntityOfPage: `${site.url}/news/${item.slug}`,
    image: `${site.url}${site.ogImage}`,
    ...(item.dateLabel ? {} : { datePublished: item.datePublished ?? item.date }),
    author: { '@type': 'Organization', name: site.name, url: site.url },
    publisher: {
      '@type': 'Organization',
      name: site.name,
      logo: { '@type': 'ImageObject', url: `${site.url}/icon-512.png` },
    },
  }

  return (
    <>
      <Seo
        title={item.title}
        path={`/news/${item.slug}`}
        description={item.excerpt}
        type="article"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <article>
        <header className="border-b border-line bg-paper-200">
          <div className="container-content py-14 sm:py-20">
            <div className="mx-auto max-w-prose">
              <Link
                to="/news"
                className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-clay-600"
              >
                <Icon name="arrow" size={16} className="rotate-180" />
                お知らせ一覧へ
              </Link>
              <div className="mt-6 flex items-center gap-3">
                <time className="text-sm tabular-nums text-ink-soft">
                  {item.dateLabel ?? formatDate(item.date)}
                </time>
                <Badge tone="clay">{item.category}</Badge>
              </div>
              <h1 className="mt-4 text-3xl leading-tight sm:text-4xl">
                {item.titleSegments ? <Segments segments={item.titleSegments} /> : item.title}
              </h1>
            </div>
          </div>
        </header>

        <Section tone="paper" spacing="lg">
          <div className="mx-auto max-w-prose space-y-6 text-[17px] leading-loose text-ink/85">
            {item.body.map((para, i) => (
              <p key={i}>{typeset(para)}</p>
            ))}
          </div>

          {item.links && item.links.length > 0 && (
            <ul className="mx-auto mt-10 max-w-prose space-y-3">
              {item.links.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="inline-flex items-center gap-1.5 text-[15px] font-medium text-clay-600 underline decoration-clay-300 underline-offset-4 transition-colors hover:text-clay-700"
                  >
                    {link.label}
                    <Icon name="arrow" size={16} />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mx-auto mt-14 max-w-prose border-t border-line pt-8">
            <Button to="/news" variant="secondary">
              <Icon name="arrow" size={16} className="rotate-180" />
              お知らせ一覧へ戻る
            </Button>
          </div>
        </Section>
      </article>
    </>
  )
}
