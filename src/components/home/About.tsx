import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'

/**
 * 「KitaKita Labとは」— the story of why this exists.
 * Editorial, prose-led, generous line height.
 */
export function About() {
  return (
    <Section id="about" tone="paper" spacing="lg">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal>
          <span className="eyebrow">About</span>
          <h2 className="mt-3 text-3xl leading-tight sm:text-4xl">
            KitaKita Labとは
          </h2>
        </Reveal>

        <Reveal delay={80} className="max-w-prose space-y-6 text-lg leading-loose text-ink/85">
          <p>
            ハンドメイド作家として活動するなかで、いつも感じていたことがあります。
            「もっと挑戦したいのに、その場所が足りない」ということ。
          </p>
          <p>
            すばらしい作品をつくる人はたくさんいる。けれど、その力を発揮できる舞台は、
            まだまだ限られています。だったら——
            <span className="font-medium text-ink">場所そのものを、自分たちでつくればいい。</span>
          </p>
          <p>
            KitaKita Labは、その想いから生まれたプロジェクトです。
            企業や自治体、商業施設、教育機関とともに、作家が挑戦できる機会を企画し、
            ワークショップや調査活動を通じて、ハンドメイドの可能性を広げていきます。
          </p>
          <p className="text-ink-muted">
            これは、ひとりの作家の挑戦から始まった、みんなのためのプロジェクトです。
          </p>
        </Reveal>
      </div>
    </Section>
  )
}
