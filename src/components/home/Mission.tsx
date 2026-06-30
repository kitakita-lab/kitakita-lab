import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'

/** Mission — a single, quiet, large statement. */
export function Mission() {
  return (
    <Section id="mission" tone="tint" spacing="lg">
      <div className="mx-auto max-w-4xl text-center">
        <Reveal>
          <span className="eyebrow">Mission</span>
        </Reveal>
        <Reveal delay={80}>
          <p className="mt-6 font-serif text-2xl leading-relaxed text-ink sm:text-3xl lg:text-[2.5rem] lg:leading-[1.5]">
            作家が活躍できる場所を、
            <br />
            <span className="text-clay-600">増やしていく。</span>
          </p>
        </Reveal>
        <Reveal delay={160}>
          <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
            販売するだけでは、挑戦は広がらない。
            ワークショップ、企業コラボ、地域や教育機関との連携——
            あらゆるかたちで、作家が一歩を踏み出せる舞台をつくることが、
            私たちの使命です。
          </p>
        </Reveal>
      </div>
    </Section>
  )
}
