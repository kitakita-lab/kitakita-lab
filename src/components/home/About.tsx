import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'

/**
 * 「KitaKita Labとは」— ブランドストーリー。
 * 名前の意味を箇条書きで説明せず、ひとつの物語として読ませ、
 * 最後に「だから存在する」へ着地する（docs/BRAND.md）。
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

        <Reveal delay={80} className="max-w-prose space-y-8 text-lg leading-loose text-ink/85">
          <p>
            北の空の下で、私たちは何度もその声を聞いてきました。
            「出店の話が、きた」「新しい仕事が、きた」
            「いいアイデアが、きた」——そして、
            届いた箱を開けた誰かの、「きた！」。
          </p>
          <p>
            挑戦は、いつも小さな「きた」から始まります。
            けれど、せっかくやってきたその合図を、
            ひとりで育てるのは、少し心細い。
          </p>
          <p>
            だから、KitaKita Lab。
          </p>
          <p>
            ここは、北海道の小さな実験室。
            人も、地域も、アイデアも。
            やってきた挑戦を試し、育て、
            かたちにして、送り出す。
          </p>
          <p className="font-serif text-xl text-ink sm:text-2xl">
            次の「きた。」は、
            <br className="sm:hidden" />
            あなたの番かもしれません。
          </p>
        </Reveal>
      </div>
    </Section>
  )
}
