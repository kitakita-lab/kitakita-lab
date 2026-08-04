import { Link } from 'react-router-dom'
import { Seo } from '@/components/Seo'
import { PageHeader } from '@/components/layout/PageHeader'
import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { CtaBand } from '@/components/CtaBand'
import { sortedEvents } from '@/data/events'

export function EventsPage() {
  return (
    <>
      <Seo
        title="Events"
        path="/events"
        description="KitaKita Labのイベント実績。商業施設・企業・自治体と連携したワークショップイベントの開催レポートをご紹介します。"
      />

      <PageHeader
        eyebrow="Events"
        title={<>イベント実績</>}
        description="商業施設・企業・自治体の皆さまと連携して開催した、ワークショップイベントの実績をご紹介します。企画から会場づくり、当日の運営まで、KitaKita Labが一貫して担当しています。"
      />

      <Section tone="paper" spacing="lg">
        <div className="grid gap-8 sm:grid-cols-2">
          {sortedEvents.map((event, i) => (
            <Reveal key={event.slug} delay={(i % 2) * 80}>
              <Link
                to={`/events/${event.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl2 border border-line bg-paper-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-paper-200">
                  {event.heroImage ? (
                    <img
                      src={event.heroImage.src}
                      alt={event.heroImage.alt}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center bg-gradient-to-br from-clay-50 to-sage-100"
                      aria-hidden="true"
                    >
                      <Icon name="event" size={40} className="text-clay-300" />
                    </div>
                  )}
                  <div className="absolute left-3 top-3">
                    <Badge tone="clay">{event.category}</Badge>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-soft">
                    <span>{event.dateLabel}</span>
                    <span aria-hidden="true">・</span>
                    <span>{event.venue}</span>
                  </div>
                  <h2 className="mt-3 text-xl leading-snug text-ink transition-colors group-hover:text-clay-600">
                    {event.title}
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">
                    {event.excerpt}
                  </p>
                  {event.stats && event.stats.length > 0 && (
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {event.stats.slice(0, 3).map((s) => (
                        <li key={s.label}>
                          <Badge tone="neutral">
                            {s.label} {s.value}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-clay-600">
                    レポートを見る
                    <Icon
                      name="arrow"
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

      </Section>

      <CtaBand
        title="次のイベント、一緒につくりませんか。"
        description="商業施設の賑わい創出、企業の顧客体験づくり、自治体の地域企画など、目的に合わせたワークショップイベントを企画・運営します。"
        primary={{ label: 'お問い合わせ', to: '/contact' }}
        secondary={{ label: '連携について見る', to: '/collaboration' }}
      />
    </>
  )
}
