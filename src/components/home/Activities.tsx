import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { Icon } from '@/components/ui/Icon'
import { NavLink } from '@/components/layout/NavLink'
import { flowSteps } from '@/data/activities'

/**
 * Activities — 「何をやる会社か」ではなく「どんな流れをつくる会社か」。
 * 〜てみる、の連なりを罫線の目録で見せ、ワークショップ・AI・EC などは
 * 流れの中の実例として置く（docs/BRAND.md）。
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
        description="ワークショップも、AIも、ECも。ぜんぶ、この流れのどこかにあります。"
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
                          className="inline-flex items-center gap-1 text-sage-700 underline decoration-sage-300 underline-offset-4 transition-colors hover:text-sage-500"
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
