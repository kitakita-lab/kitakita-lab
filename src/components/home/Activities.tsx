import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { Icon } from '@/components/ui/Icon'
import { NavLink } from '@/components/layout/NavLink'
import { flowSteps } from '@/data/activities'
import { Segments } from '@/components/ui/Segments'
import { typeset } from '@/lib/typo'

/**
 * Activities — 依頼できるサービス一覧ではなく、「KitaKita Lab が、いま実際に
 * 手を動かしていること」を流れで見せる。〜てみる、の連なりを罫線の目録で見せ、
 * 実例は data/activities.ts の基準（実物があること、AI は制作方法として書くこと、
 * 未来の計画は書かないこと）に従って置く（docs/BRAND.md）。
 */
export function Activities() {
  return (
    // 章2「やっていること」の頭。一覧として「読む」面なので tint
    <Section id="activities" tone="tint" spacing="chapter">
      <SectionHeading
        eyebrow="Activities"
        title={<Segments segments={['私たちが', 'つくっている流れ']} />}
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
            {/* 手順番号は、スマホでは見出しと同じ行の小さな印にする（Vision の大きな
                番号のあとに「番号＋見出し」のブロックが続いて見えないように）。
                PC は左の細い列に置く。 */}
            <div className="grid gap-3 py-7 sm:grid-cols-[5rem_1fr] sm:gap-8 sm:py-9">
              <span
                className="hidden font-serif text-sm tracking-[0.2em] text-clay-400 sm:block"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                {/* 項目見出しは章の見出し（30px〜）より一段小さく（20px / PC 24px） */}
                <h3 className="font-serif text-xl tracking-[0.08em] text-ink sm:text-2xl">
                  <span
                    className="mr-3 align-middle text-xs tracking-[0.2em] text-clay-400 sm:hidden"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {step.verb}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
                  {typeset(step.summary)}
                </p>
                <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                  {step.examples.map((ex) => (
                    <li key={ex.label} className="text-sm">
                      {ex.href ? (
                        <NavLink
                          href={ex.href}
                          className="inline-flex items-center gap-1 text-ink underline decoration-clay-300 underline-offset-4 transition-colors hover:text-clay-600"
                        >
                          {typeset(ex.label)}
                          <Icon name="arrow" size={13} />
                        </NavLink>
                      ) : (
                        <span className="text-ink-soft">{typeset(ex.label)}</span>
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
