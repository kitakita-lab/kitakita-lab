import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'

/** 約束 — 受け取ったものを、次の誰かへ（恩送り）。 */
export function Mission() {
  return (
    <Section id="mission" tone="tint" spacing="lg">
      <div className="mx-auto max-w-4xl text-center">
        <Reveal>
          <span className="eyebrow">Promise</span>
        </Reveal>
        <Reveal delay={80}>
          <p className="mt-6 font-serif text-2xl leading-relaxed text-ink sm:text-3xl lg:text-[2.5rem] lg:leading-[1.6]">
            受け取ったものを、
            <br />
            <span className="text-sage-700">次の誰かへ。</span>
          </p>
        </Reveal>
        <Reveal delay={160}>
          <p className="mx-auto mt-8 max-w-xl text-base leading-loose text-ink-muted sm:text-lg">
            応援も、つながりも、経験も。
            私たちは、もらってばかりでここまで来ました。
            これからは、渡していく側です。
          </p>
        </Reveal>
      </div>
    </Section>
  )
}
