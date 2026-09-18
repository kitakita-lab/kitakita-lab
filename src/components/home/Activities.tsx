import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { Icon } from '@/components/ui/Icon'
import { NavLink } from '@/components/layout/NavLink'
import { flowSteps } from '@/data/activities'

/**
 * Activities — 依頼できるサービス一覧ではなく、「KitaKita Lab が、いま実際に
 * 手を動かしていること」を流れで見せる。〜てみる、の連なりを罫線の目録で見せ、
 * 実例は data/activities.ts の基準（実物があること、AI は制作方法として書くこと、
 * 未来の計画は書かないこと）に従って置く（docs/BRAND.md）。
 */
export function Activities() {
  return (
    <Section id="activities" tone="tint" spacing="lg">
      <SectionHeading
        eyebrow="Activities"
        title={
          <>
            私たちが
            <span className="whitespace-nowrap">つくっている流れ</span>
          </>
        }
        description="いま、実際に手を動かしていることを、流れで並べています。"
      />

      <ol className="mt-14 border-t border-line">
        {flowSteps.map((step, i) => (
          <Reveal
            key={step.id}
            as="li"
            delay={Math.min(i, 4) * 60}
            className="border-b border-line"
          >
            <div className="grid gap-3 py-9 sm:grid-cols-[5rem_1fr] sm:gap-8">
              <span
                className="font-serif text-sm tracking-[0.2em] text-clay-400"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="font-serif text-2xl tracking-[0.08em] text-ink sm:text-[1.75rem]">
                  {step.verb}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
                  {step.summary}
                </p>
                <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                  {step.examples.map((ex) => (
                    <li key={ex.label} className="text-sm">
                      {ex.href ? (
                        <NavLink
                          href={ex.href}
                          className="inline-flex items-center gap-1 text-ink underline decoration-clay-300 underline-offset-4 transition-colors hover:text-clay-600"
                        >
                          {ex.label}
                          <Icon name="arrow" size={13} />
                        </NavLink>
                      ) : (
                        <span className="text-ink-soft">{ex.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
    </Section>
  )
}
