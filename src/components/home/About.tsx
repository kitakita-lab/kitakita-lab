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
            {/* ここだけ意図的に「少し」。締めの「ちょっとだけ〜」と役割を分け、
                連続による単調さを避ける（思想・行動=少し／姿勢=ちょっと）。
                「ちょっと」統一の一括置換で戻さないこと（docs/BRAND.md 参照）。 */}
            何かを少し進めてみること。
            <br />
            {/* 320px幅では行が収まらず「…つくるこ／と。」と割れるため、
                文節 nowrap で「…一緒に／つくること。」の切れ目に固定。 */}
            そのきっかけを一緒に<span className="whitespace-nowrap">つくること。</span>
          </p>
          <p className="font-serif text-xl leading-relaxed text-ink sm:text-2xl">
            そんなことなら、
            <br className="sm:hidden" />
            {/* 狭幅で「かもしれ／ません」と割れないよう文節で固定
                （320/375pxでは「力になれる／かもしれません。」で折れる）。 */}
            ちょっとだけ力になれる
            <span className="whitespace-nowrap">かもしれません。</span>
          </p>
        </Reveal>
      </div>
    </Section>
  )
}
