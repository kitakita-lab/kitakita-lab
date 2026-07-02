import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'

/**
 * 「私たちのこと」— 会社紹介ではなく、人格の自己紹介。
 * 原点（助けられてきた）→ 姿勢（歩くのは、あなた）→
 * この場所の意味（少し進めてみる。解釈は委ねる）の順で語る。
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
            私たちは、たくさんの人に助けられてきました。
            話を聞いてくれた人。応援してくれた人。
            つないでくれた人。そっと背中を押してくれた人。
            今の私たちは、その人たちでできています。
          </p>
          <p>
            だから今度は、返していく番です。
          </p>
          <p>
            といっても、大きなことはできません。
            人生を変えるとか、成功させるとか、
            そういう約束はしないことにしています。
            歩くのは、あなただからです。
          </p>
          <p>
            私たちにできるのは、道が少し豊かになるような
            時間と、体験と、出会いを用意しておくこと。
            ここは、そのための場所です。
          </p>
          <p className="font-serif text-xl leading-relaxed text-ink sm:text-2xl">
            何を進めるかは、あなたが決めてください。
            <br />
            作品でも、仕事でも、人生でも。
          </p>
        </Reveal>
      </div>
    </Section>
  )
}
