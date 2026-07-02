import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'

/** Mission — 果たす役割をひとつの大きな声で。 */
export function Mission() {
  return (
    <Section id="mission" tone="tint" spacing="lg">
      <div className="mx-auto max-w-4xl text-center">
        <Reveal>
          <span className="eyebrow">Mission</span>
        </Reveal>
        <Reveal delay={80}>
          <p className="mt-6 font-serif text-2xl leading-relaxed text-ink sm:text-3xl lg:text-[2.5rem] lg:leading-[1.5]">
            すべての「きた」に、
            <br />
            <span className="text-clay-600">育つ場所を。</span>
          </p>
        </Reveal>
        <Reveal delay={160}>
          <p className="mx-auto mt-8 max-w-xl text-base leading-loose text-ink-muted sm:text-lg">
            合図がきた、その瞬間に育てられる場所があるかどうかで、未来は変わる。
            <br />
            私たちは、その場所になる。
          </p>
        </Reveal>
      </div>
    </Section>
  )
}
