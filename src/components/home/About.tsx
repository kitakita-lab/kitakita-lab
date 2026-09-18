import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'

/**
 * 「私たちのこと」— 会社紹介ではなく、人格の自己紹介。
 * 等身大で、背伸びをしない。ただし自分の仕事を小さく言わない。
 * 企業・施設と組む現場と、持っているものを新しい場所へ広げる人との
 * 関わりの両方が、業務範囲の説明にならない長さで見える状態を保つ。
 */
export function About() {
  return (
    // 章1「私たちのこと」の頭（About → Philosophy → Promise → Vision）
    <Section id="about" tone="paper" spacing="chapter">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal>
          <span className="eyebrow">About</span>
          <h2 className="mt-3 text-3xl leading-tight sm:text-4xl">
            私たちのこと
          </h2>
        </Reveal>

        <Reveal delay={80} className="max-w-prose space-y-8 text-lg leading-loose text-ink/85">
          <p>
            {/* 390px 前後で「一緒につ／くっています。」と語中で割れないよう文節で固定。 */}
            私たちは、北海道で体験の場を一緒に<span className="whitespace-nowrap">つくっています。</span>
          </p>
          <p>
            {/* JSX の行またぎは半角スペースになるため、一文は1行に書く。 */}
            商業施設や企業のイベントで、ワークショップや体験の企画をかたちにし、当日の現場にも<span className="whitespace-nowrap">立つこと。</span>
            <br />
            作品や技術、得意なことを持っている人が、それを新しい場所へ広げていくことに、
            <span className="whitespace-nowrap">力を貸すこと。</span>
          </p>
          {/* About の締めの一文。独立した思想コピー（次の Philosophy）ではなく本文の結びなので、
              本文と同じ左揃え・同じ段組みのまま、明朝と一段だけ大きい文字（18/20px）で
              締めくくる。本文との間は段落間（32px）より少しだけ広い 40px。
              以前は 20/24px で、狭幅で「どちらも、／話すところから、」と2行に折っていたが、
              次の Philosophy（24/30px・中央揃え）と同格に見えていたため、1文として続ける。 */}
          <p className="!mt-10 font-serif text-lg leading-relaxed text-ink sm:text-xl">
            {/* 狭幅で「ひとつ／ずつ。」と割れないよう文節で固定。 */}
            どちらも、話すところから、<span className="whitespace-nowrap">ひとつずつ。</span>
          </p>
        </Reveal>
      </div>
    </Section>
  )
}
