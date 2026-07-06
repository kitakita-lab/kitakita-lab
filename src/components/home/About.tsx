import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'

/**
 * 「私たちのこと」— 会社紹介ではなく、人格の自己紹介。
 * 等身大で、背伸びをしない。できることを小さく言う（docs/BRAND.md）。
 */
export function About() {
  return (
    <Section id="about" tone="paper" spacing="lg">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal>
          <span className="eyebrow">About</span>
          <h2 className="mt-3 text-3xl leading-tight sm:text-4xl">
            私たちのこと
          </h2>
        </Reveal>

        <Reveal delay={80} className="max-w-prose space-y-8 text-lg leading-loose text-ink/85">
          <p>
            私たちは、特別なことができる会社ではありません。
          </p>
          <p>
            でも、人と人がつながること。
            <br />
            何かをちょっと進めてみること。
            <br />
            そのきっかけを一緒につくること。
          </p>
          <p className="font-serif text-xl leading-relaxed text-ink sm:text-2xl">
            そんなことなら、
            <br className="sm:hidden" />
            ちょっとだけ力になれるかもしれません。
          </p>
        </Reveal>
      </div>
    </Section>
  )
}
