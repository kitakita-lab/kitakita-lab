import { Seo } from '@/components/Seo'
import { PageHeader } from '@/components/layout/PageHeader'
import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { CtaBand } from '@/components/CtaBand'
import { workshops } from '@/data/workshops'

export function WorkshopPage() {
  return (
    <>
      <Seo
        title="Workshop"
        path="/workshop"
        description="KitaKita Lab および作家 ikyu のワークショップ・活動実績。つくる楽しさを届ける体験の場を企画しています。"
      />

      <PageHeader
        eyebrow="Workshop"
        title={<>つくる楽しさを、<br className="hidden sm:block" />体験として届ける。</>}
        description="少人数レッスンから企業コラボ、商業施設イベントまで。作家とともに企画するワークショップは、参加者には「つくる喜び」を、作家には「挑戦の舞台」を生み出します。"
      />

      <Section tone="paper" spacing="lg">
        <div className="flex items-end justify-between gap-4">
          <Reveal>
            <span className="eyebrow">Past works</span>
            <h2 className="mt-3 text-2xl sm:text-3xl">これまでの活動実績</h2>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {workshops.map((w, i) => (
            <Reveal key={w.id} delay={(i % 3) * 80}>
              <article className="group flex h-full flex-col overflow-hidden rounded-xl2 border border-line bg-paper-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                {/* Image or placeholder — replace by adding `image` to the data. */}
                <div className="relative aspect-[4/3] overflow-hidden bg-paper-200">
                  {w.image ? (
                    <img
                      src={w.image}
                      alt={`${w.title}の様子`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center bg-gradient-to-br from-clay-50 to-sage-100"
                      aria-hidden="true"
                    >
                      <Icon name="workshop" size={40} className="text-clay-300" />
                    </div>
                  )}
                  <div className="absolute left-3 top-3">
                    <Badge tone="clay">{w.category}</Badge>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-2 text-xs text-ink-soft">
                    <span>{w.date}</span>
                    <span aria-hidden="true">・</span>
                    <span>{w.host}</span>
                  </div>
                  <h3 className="mt-2 text-lg leading-snug text-ink">{w.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">
                    {w.summary}
                  </p>
                  <p className="mt-4 text-xs text-ink-soft">会場：{w.venue}</p>
                  {w.highlights && w.highlights.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {w.highlights.map((h) => (
                        <li key={h}>
                          <Badge tone="neutral">{h}</Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <p className="mt-12 rounded-xl2 border border-dashed border-line bg-paper-50 px-6 py-5 text-sm leading-relaxed text-ink-muted">
            ※ 活動実績は順次追加していきます。写真や実績カードは
            <code className="mx-1 rounded bg-paper-200 px-1.5 py-0.5 text-[13px] text-ink">
              src/data/workshops.ts
            </code>
            に項目を追加するだけで掲載できる設計です。
          </p>
        </Reveal>
      </Section>

      <CtaBand
        title="ワークショップの企画、ご相談ください。"
        description="企業コラボ・商業施設イベント・自治体企画など、目的に合わせたワークショップを設計します。"
        primary={{ label: 'お問い合わせ', to: '/contact' }}
        secondary={{ label: '連携について見る', to: '/collaboration' }}
      />
    </>
  )
}
