import { Link } from 'react-router-dom'
import { Seo } from '@/components/Seo'
import { PageHeader } from '@/components/layout/PageHeader'
import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { CtaBand } from '@/components/CtaBand'
import { sortedEvents } from '@/data/events'

/**
 * イベント実績一覧（/events）。主人公は KitaKita Lab。
 * 「KitaKita Lab が実際にどんな場・企画・体験に関わってきたか」を見る場所なので、
 * 構成は PageHeader → 実績カード → CTA だけにする。
 *
 * 以前ここにあった「ひとつのブランドの、歩み」（ikyu の活動の広がりを追う
 * タイムライン。データは data/events.ts の brandJourney）は、ページの途中から
 * 主人公が ikyu に切り替わって見えたため外した。空いた分を埋める新しい
 * セクション（学び・数字・ケース分析など）は足さない。
 */
/**
 * titleLines の1行を描画する。半角スペースで区切られた語（例: 'アリオ札幌 ハーベストコート'）は
 * 語ごとに nowrap にし、折り返しはスペースの位置だけに限る。
 * h2 にはグローバルの text-wrap: balance が効いており、既定の禁則では「ー」が行頭に
 * 立てるため、320px 幅で「ハ／ーベストコート」と語中で均等割りされていた。
 * スペースを含まない行はそのまま返す（長い語を nowrap にして横スクロールを起こさない）。
 */
function renderTitleLine(line: string) {
  if (!line.includes(' ')) return line
  // スペースは nowrap の span の「外」に置く。span の内側に入れると nowrap が
  // スペースでの折り返しも禁じてしまい、行全体が折れずに横スクロールを起こす。
  return line.split(' ').flatMap((word, i) => [
    i > 0 ? ' ' : null,
    <span key={`${word}-${i}`} className="whitespace-nowrap">
      {word}
    </span>,
  ])
}

export function EventsPage() {
  return (
    <>
      <Seo
        title="イベント実績"
        path="/events"
        description="KitaKita Labのイベント実績。商業施設・企業・自治体と連携したワークショップイベントの開催レポートをご紹介します。"
      />

      <PageHeader
        eyebrow="Events"
        title={<>イベント実績</>}
        description="商業施設や公共空間、企業・自治体との連携など、さまざまな場で開催したワークショップイベントの実績をご紹介します。企画から会場づくり、当日の運営まで、KitaKita Labが一貫して担当しています。"
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
                      style={
                        event.cardImagePosition
                          ? { objectPosition: event.cardImagePosition }
                          : undefined
                      }
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
                  {/* hover 色はホバー可能な環境に限定する。タッチ端末ではタップした
                      カードに :hover が残り、最新カードだけ色が違って見えたため。
                      タイトルは titleLines があれば意味の単位で2行に分けて表示。 */}
                  <h2 className="mt-3 text-xl leading-snug text-ink transition-colors [@media(hover:hover)]:group-hover:text-clay-600">
                    {event.titleLines
                      ? event.titleLines.map((line) => (
                          <span key={line} className="block">
                            {renderTitleLine(line)}
                          </span>
                        ))
                      : event.title}
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
        title={
          // 320px 幅では h2 の text-wrap: balance により「次のイベン／ト、一緒につく／りませんか。」と
          // 語中で折れるため、文節ごとに nowrap で固定し、折り返しを文節の境目に限る
          // （Workshop の CTA と同じ手法。CtaBand 本体は変更しない）。
          <>
            <span className="whitespace-nowrap">次のイベント、</span>
            <span className="whitespace-nowrap">一緒に</span>
            <span className="whitespace-nowrap">つくりませんか。</span>
          </>
        }
        description="商業施設の賑わい創出、企業の顧客体験づくり、自治体の地域企画など、目的に合わせたワークショップイベントを企画・運営します。"
        primary={{ label: 'お問い合わせ', to: '/contact' }}
        secondary={{ label: '連携について見る', to: '/collaboration' }}
      />
    </>
  )
}
