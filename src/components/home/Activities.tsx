import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { NavLink } from '@/components/layout/NavLink'
import { activities } from '@/data/activities'

/**
 * Activities — 事業紹介ではなく「いま育てている挑戦」。
 * 挑戦は増えていく前提（データに追加するだけで並ぶ）。
 */
export function Activities() {
  return (
    <Section id="activities" tone="tint" spacing="lg">
      <SectionHeading
        eyebrow="Activities"
        title="いま、この実験室で育てている挑戦"
        description="どれも、育ちざかり。この棚は、これからも増えていきます。"
      />

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {activities.map((activity, i) => {
          const sprouting = activity.status === 'sprouting'
          const inner = (
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-clay-50 text-clay-600">
                  <Icon name={activity.icon} size={24} />
                </span>
                <Badge tone={sprouting ? 'neutral' : 'sage'}>
                  {sprouting ? '芽を出す前' : '育成中'}
                </Badge>
              </div>
              <h3 className="mt-5 text-lg text-ink">{activity.title}</h3>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed text-ink-muted">
                {activity.summary}
              </p>
              {activity.href && (
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-clay-600">
                  この挑戦を見る
                  <Icon name="arrow" size={16} />
                </span>
              )}
            </div>
          )

          return (
            <Reveal key={activity.id} delay={(i % 3) * 80}>
              {activity.href ? (
                <NavLink
                  href={activity.href}
                  className="group block h-full rounded-xl2 border border-line bg-paper-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-clay-200 hover:shadow-lift sm:p-7"
                >
                  {inner}
                </NavLink>
              ) : (
                <div className="h-full rounded-xl2 border border-dashed border-line bg-paper-50/60 p-6 sm:p-7">
                  {inner}
                </div>
              )}
            </Reveal>
          )
        })}
      </div>
    </Section>
  )
}
