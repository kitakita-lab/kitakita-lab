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
                    {formatDate(item.date)}
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

        <Reveal delay={120}>
          <p className="mt-12 rounded-xl2 border border-dashed border-line bg-paper-50 px-6 py-5 text-sm leading-relaxed text-ink-muted">
            ※ お知らせは将来的なCMS化を想定したデータ構造で管理しています。
            現在は
            <code className="mx-1 rounded bg-paper-200 px-1.5 py-0.5 text-[13px] text-ink">
              src/data/news.ts
            </code>
            を編集することで追加・更新できます。
          </p>
        </Reveal>
      </Section>
    </>
  )
}
