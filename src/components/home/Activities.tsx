import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { Icon } from '@/components/ui/Icon'
import { NavLink } from '@/components/layout/NavLink'
import { activities } from '@/data/activities'

/**
 * Activities — カードではなく、罫線の「目録」。
 * ばらばらに見える活動が、同じ思想から生まれていることを
 * ひとつの静かなリストで示す（docs/BRAND.md: 世界観）。
 */
export function Activities() {
  return (
    <Section id="activities" tone="tint" spacing="lg">
      <SectionHeading
        eyebrow="Activities"
        title="いま、育てているもの"
        description="ばらばらに見えるかもしれません。ぜんぶ、「少し進めてみる」から生まれています。"
      />

      <ul className="mt-14 border-t border-line">
        {activities.map((activity, i) => {
          const sprouting = activity.status === 'sprouting'
          const number = sprouting ? '──' : String(i + 1).padStart(2, '0')

          const inner = (
            <div className="grid gap-2 py-8 sm:grid-cols-[5rem_1fr_auto] sm:items-baseline sm:gap-8">
              <span
                className={`font-serif text-sm tracking-[0.2em] ${
                  sprouting ? 'text-ink-soft' : 'text-clay-400'
                }`}
                aria-hidden="true"
              >
                {number}
              </span>
              <div>
                <h3
                  className={`font-serif text-xl tracking-[0.06em] sm:text-2xl ${
                    sprouting ? 'text-ink-soft' : 'text-ink'
                  }`}
                >
                  {activity.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {activity.summary}
                </p>
              </div>
              <span
                className={`hidden items-center gap-1.5 text-xs tracking-wider2 sm:inline-flex ${
                  sprouting
                    ? 'text-ink-soft'
                    : 'text-sage-700 transition-colors group-hover:text-sage-500'
                }`}
              >
                {activity.href ? (
                  <>
                    見る
                    <Icon name="arrow" size={14} />
                  </>
                ) : sprouting ? (
                  '準備中'
                ) : (
                  '育成中'
                )}
              </span>
            </div>
          )

          return (
            <Reveal key={activity.id} as="li" delay={Math.min(i, 4) * 60} className="border-b border-line">
              {activity.href ? (
                <NavLink href={activity.href} className="group block">
                  {inner}
                </NavLink>
              ) : (
                inner
              )}
            </Reveal>
          )
        })}
      </ul>
    </Section>
  )
}
