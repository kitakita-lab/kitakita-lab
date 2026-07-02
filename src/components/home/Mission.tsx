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
          <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
            チャンスがきた、その瞬間に「育てられる場所」があるかどうかで、
            未来は変わります。人、地域、企業、作家、アイデア——
            やってきた挑戦を見過ごさず、試し、育て、
            かたちにして社会へ届ける。それが私たちの役割です。
          </p>
        </Reveal>
      </div>
    </Section>
  )
}
