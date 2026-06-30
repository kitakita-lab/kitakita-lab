import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { Icon } from '@/components/ui/Icon'
import { NavLink } from '@/components/layout/NavLink'
import { Badge } from '@/components/ui/Badge'
import { sortedNews } from '@/data/news'
import { formatDate } from '@/lib/date'

/** Latest news preview on the home page (links to the full News page). */
export function NewsTeaser() {
  const latest = sortedNews.slice(0, 3)

  return (
    <Section id="news" tone="tint" spacing="lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <Reveal>
          <span className="eyebrow">News</span>
          <h2 className="mt-3 text-3xl leading-tight sm:text-4xl">お知らせ</h2>
        </Reveal>
        <Reveal delay={60}>
          <NavLink
            href="/news"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-clay-600 hover:text-clay-700"
          >
            すべてのお知らせ
            <Icon name="arrow" size={16} />
          </NavLink>
        </Reveal>
      </div>

      <ul className="mt-10 divide-y divide-line border-t border-line">
        {latest.map((item, i) => (
          <li key={item.slug}>
            <Reveal delay={i * 60}>
              <NavLink
                href={`/news/${item.slug}`}
                className="group flex flex-col gap-2 py-6 sm:flex-row sm:items-center sm:gap-6"
              >
                <time className="w-28 shrink-0 text-sm tabular-nums text-ink-soft">
                  {formatDate(item.date)}
                </time>
                <Badge tone="clay" className="w-fit">
                  {item.category}
                </Badge>
                <span className="text-[15px] text-ink transition-colors group-hover:text-clay-600 sm:text-base">
                  {item.title}
                </span>
              </NavLink>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}
