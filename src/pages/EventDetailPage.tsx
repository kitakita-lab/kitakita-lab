import { useParams, Navigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Seo } from '@/components/Seo'
import { site } from '@/data/site'
import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { CtaBand } from '@/components/CtaBand'
import { events } from '@/data/events'

/**
 * イベント実績の詳細テンプレート。
 * `src/data/events.ts` のデータだけで構成され、
 * 未入力のセクションは自動的に非表示になります。
 */
export function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const event = events.find((e) => e.slug === slug)

  if (!event) {
    return <Navigate to="/events" replace />
  }

  const pageUrl = `${site.url}/events/${event.slug}`

  // 開催済みイベントの「実施実績レポート」なので Article を使う
  // （開催告知ではないため Event schema は適用しない）。
  // 記事としての公開日は管理していないため datePublished は載せない
  // （存在しない日付を推測で生成しない方針）。
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: event.title,
    description: event.excerpt,
    mainEntityOfPage: pageUrl,
    ...(event.heroImage ? { image: `${site.url}${event.heroImage.src}` } : {}),
    author: { '@type': 'Organization', name: site.name, url: site.url },
    publisher: {
      '@type': 'Organization',
      name: site.name,
      logo: { '@type': 'ImageObject', url: `${site.url}/icon-512.png` },
    },
  }

  // 実際のサイト構造（ホーム → イベント実績 → 本ページ）と一致するパンくず。
  // 視覚的なパンくずは新設せず、構造化データのみ（既存の「一覧へ」リンクが
  // 同じ階層を担っている）。
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: `${site.url}/` },
      { '@type': 'ListItem', position: 2, name: 'イベント実績', item: `${site.url}/events` },
      { '@type': 'ListItem', position: 3, name: event.title, item: pageUrl },
    ],
  }

  return (
    <>
      <Seo
        title={event.title}
        path={`/events/${event.slug}`}
        description={event.excerpt}
        image={event.heroImage?.src}
        type="article"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <article>
        {/* ── ヘッダー ─────────────────────────── */}
        <header className="border-b border-line bg-paper-200">
          <div className="container-content py-14 sm:py-20">
            <Reveal className="max-w-3xl">
              <Link
                to="/events"
                className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-clay-600"
              >
                <Icon name="arrow" size={16} className="rotate-180" />
                イベント実績一覧へ
              </Link>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Badge tone="clay">{event.category}</Badge>
                <span className="text-sm text-ink-soft">{event.dateLabel}</span>
              </div>
              <h1 className="mt-4 text-3xl leading-[1.2] sm:text-4xl lg:text-[2.75rem]">
                {event.title}
              </h1>
              <p className="mt-4 flex items-center gap-2 text-sm text-ink-muted">
                <Icon name="event" size={16} className="shrink-0 text-clay-500" />
                {event.venue}
              </p>
            </Reveal>
          </div>
        </header>

        {/* ── ヒーロー写真 ─────────────────────── */}
        {event.heroImage && (
          <div className="border-b border-line bg-paper-200">
            <div className="container-content pb-14 sm:pb-16">
              <Reveal>
                <figure className="overflow-hidden rounded-xl2 shadow-soft">
                  <img
                    src={event.heroImage.src}
                    alt={event.heroImage.alt}
                    className="aspect-[16/9] w-full object-cover"
                  />
                </figure>
              </Reveal>
            </div>
          </div>
        )}

        {/* ── 本文セクション + 開催概要 ─────────── */}
        <Section tone="paper" spacing="lg">
          <div className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
            <div className="min-w-0 space-y-12">
              {event.sections?.map((section) => (
                <Reveal key={section.heading}>
                  <h2 className="text-2xl sm:text-3xl">{section.heading}</h2>
                  <div className="mt-5 space-y-5 text-[16px] leading-loose text-ink/85">
                    {section.body.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                  {section.points && section.points.length > 0 && (
                    <ul className="mt-6 space-y-3">
                      {section.points.map((point) => (
                        <li key={point} className="flex items-start gap-3 text-sm leading-relaxed text-ink-muted">
                          <Icon
                            name="check"
                            size={18}
                            className="mt-0.5 shrink-0 text-clay-500"
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}
                </Reveal>
              ))}
            </div>

            <Reveal delay={100} className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-xl2 border border-line bg-paper-50 p-6 sm:p-7">
                <span className="eyebrow">Overview</span>
                <h2 className="mt-2 text-xl">開催概要</h2>
                <dl className="mt-5 space-y-4">
                  {event.overview.map((row) => (
                    <div key={row.label}>
                      <dt className="text-xs font-medium text-ink-soft">{row.label}</dt>
                      <dd className="mt-1 text-sm leading-relaxed text-ink">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          </div>
        </Section>

        {/* ── 参加実績 ─────────────────────────── */}
        {event.stats && event.stats.length > 0 && (
          <Section tone="tint" spacing="md">
            <Reveal>
              <span className="eyebrow">Results</span>
              <h2 className="mt-3 text-2xl sm:text-3xl">参加実績</h2>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
              {event.stats.map((stat, i) => (
                <Reveal key={stat.label} delay={i * 80}>
                  <div className="rounded-xl2 border border-line bg-paper-50 px-6 py-8 text-center">
                    <div className="font-serif text-3xl text-clay-600 sm:text-4xl">
                      {stat.value}
                    </div>
                    <div className="mt-2 text-xs font-medium text-ink-muted sm:text-sm">
                      {stat.label}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Section>
        )}

        {/* ── 当日の様子 ───────────────────────── */}
        {((event.dayReports && event.dayReports.length > 0) ||
          (event.photos && event.photos.length > 0)) && (
          <Section tone="paper" spacing="lg">
            <Reveal>
              <span className="eyebrow">On site</span>
              <h2 className="mt-3 text-2xl sm:text-3xl">当日の様子</h2>
            </Reveal>

            {event.dayReports && event.dayReports.length > 0 && (
              <div className="mt-10 grid gap-6 lg:grid-cols-3">
                {event.dayReports.map((day, i) => (
                  <Reveal key={day.label} delay={i * 80}>
                    <div className="h-full rounded-xl2 border border-line bg-paper-50 p-6 sm:p-7">
                      <div className="flex items-center gap-3">
                        <span className="eyebrow">{day.label}</span>
                        <span className="text-sm text-ink-soft">{day.date}</span>
                      </div>
                      <p className="mt-4 text-sm leading-loose text-ink-muted">{day.body}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}

            {event.photos && event.photos.length > 0 && (
              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                {event.photos.map((photo, i) => (
                  <Reveal key={photo.src} delay={i * 80}>
                    <figure>
                      <div className="overflow-hidden rounded-xl2 shadow-soft">
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          loading="lazy"
                          className="aspect-[4/3] w-full object-cover"
                        />
                      </div>
                      {photo.caption && (
                        <figcaption className="mt-3 text-sm text-ink-soft">
                          {photo.caption}
                        </figcaption>
                      )}
                    </figure>
                  </Reveal>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* ── 参加者の反応 ─────────────────────── */}
        {event.voices && event.voices.length > 0 && (
          <Section tone="tint" spacing="lg">
            <Reveal>
              <span className="eyebrow">Voices</span>
              <h2 className="mt-3 text-2xl sm:text-3xl">参加者の反応</h2>
            </Reveal>
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {event.voices.map((voice, i) => (
                <Reveal key={voice.quote} delay={i * 80}>
                  <figure className="flex h-full flex-col rounded-xl2 border border-line bg-paper-50 p-6 sm:p-7">
                    <span
                      className="font-serif text-4xl leading-none text-clay-300"
                      aria-hidden="true"
                    >
                      “
                    </span>
                    <blockquote className="mt-2 flex-1 leading-relaxed text-ink">
                      {voice.quote}
                    </blockquote>
                    <figcaption className="mt-5 text-xs text-ink-soft">
                      {voice.context}
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </Section>
        )}

        {/* ── 大切にしていること ───────────────── */}
        {event.commitments && event.commitments.length > 0 && (
          <Section tone="paper" spacing="lg">
            <Reveal className="max-w-prose">
              <span className="eyebrow">Our commitment</span>
              <h2 className="mt-3 text-2xl sm:text-3xl">
                KitaKita Labとして大切にしていること
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {event.commitments.map((item, i) => (
                <Reveal key={item.title} delay={i * 80}>
                  <div className="h-full rounded-xl2 border border-line bg-paper-50 p-6 sm:p-7">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-clay-50 text-clay-600">
                      <Icon name="check" size={20} />
                    </div>
                    <h3 className="mt-4 text-lg leading-snug">{item.title}</h3>
                    <p className="mt-3 text-sm leading-loose text-ink-muted">{item.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Section>
        )}

        <CtaBand
          title="次のイベント、一緒につくりませんか。"
          description="商業施設の賑わい創出、企業の顧客体験づくり、自治体の地域企画など、目的に合わせたワークショップイベントを企画・運営します。"
          primary={{ label: 'お問い合わせ', to: '/contact' }}
          secondary={{ label: '他の実績を見る', to: '/events' }}
        />
      </article>
    </>
  )
}
