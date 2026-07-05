import { Seo } from '@/components/Seo'
import { PageHeader } from '@/components/layout/PageHeader'
import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { NavLink } from '@/components/layout/NavLink'
import { sortedNews } from '@/data/news'
import { formatDate } from '@/lib/date'

export function NewsPage() {
  return (
    <>
      <Seo
        title="News"
        path="/news"
        description="KitaKita Labからのお知らせ・プレスリリース・イベント情報。"
      />

      <PageHeader
        eyebrow="News"
        title="お知らせ"
        description="KitaKita Labの活動やプレスリリース、イベント情報をお届けします。"
      />

      <Section tone="paper" spacing="lg">
        <ul className="divide-y divide-line border-t border-line">
          {sortedNews.map((item, i) => (
            <li key={item.slug}>
              <Reveal delay={Math.min(i, 6) * 50}>
                <NavLink
                  href={`/news/${item.slug}`}
                  className="group grid gap-3 py-7 sm:grid-cols-[auto_auto_1fr] sm:items-baseline sm:gap-6"
                >
                  <time className="text-sm tabular-nums text-ink-soft">
                    {item.dateLabel ?? formatDate(item.date)}
                  </time>
                  <Badge tone="clay" className="w-fit">
                    {item.category}
                  </Badge>
                  <div>
                    <h2 className="text-base text-ink transition-colors group-hover:text-clay-600 sm:text-lg">
                      {item.title}
                    </h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                      {item.excerpt}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-clay-600">
                      続きを読む
                      <Icon name="arrow" size={15} />
                    </span>
                  </div>
                </NavLink>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>
    </>
  )
}
