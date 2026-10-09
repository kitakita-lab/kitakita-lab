import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { Icon } from '@/components/ui/Icon'
import { NavLink } from '@/components/layout/NavLink'
import { typeset } from '@/lib/typo'

const aboutLinks = [
  { label: '開催実績を見る', href: '/events' },
  { label: '開催のご相談について', href: '/workshop#consultation' },
] as const

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
          {/* About の締めの一文。独立した思想コピー（次の Philosophy）ではなく本文の結論なので、
              本文と同じゴシック・同じ 18px / 行送り 36px・同じ左揃えのまま、
              ウェイト 500 と ink（本文は ink/85）でごくわずかに強めるだけにする。
              本文との間は段落間（32px）より少しだけ広い 40px。
              明朝にすると「小さな思想コピー → 大きな思想コピー（Philosophy）」の二段に見えるため、
              書体は変えない。 */}
          {/* スマホでは中央に置き、About 全体を受ける着地点にする。PC は本文が右カラムに
              あるため、カラム内で中央に浮かないよう左揃えのまま。 */}
          <p className="!mt-10 text-center font-medium text-ink lg:text-left">
            {/* 狭幅で「ひとつ／ずつ。」と割れないよう文節で固定。 */}
            どちらも、話すところから、<span className="whitespace-nowrap">ひとつずつ。</span>
          </p>
          {/* 現在の活動の補足（企業・施設の担当者向け）。About の自己紹介を受けたあとに、
              いま実際に開いている体験と実績、相談先へ進めるようにする。
              本文より一段小さく控えめにし、リンクは Activities と同じ下線付きの文字リンク。
              会場名は出さない（取引先・提携先と誤認させないため）。
              活動が増えたら「現在の活動のひとつが、」の文を差し替える。 */}
          <div className="!mt-10 border-t border-line pt-8">
            <p className="text-[15px] leading-relaxed text-ink-muted">
              {typeset(
                '現在の活動のひとつが、ハンドメイドアクセサリーブランド ikyu と取り組むフラワーボトルづくり体験です。2026年6月から9月にかけて、札幌市・北広島市の商業施設や公共空間で6会期を開催。制作されたフラワーボトルは、計1,127本になりました。',
              )}
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {aboutLinks.map((link) => (
                <li key={link.href}>
                  <NavLink
                    href={link.href}
                    className="inline-flex items-center gap-1 text-ink underline decoration-clay-300 underline-offset-4 transition-colors hover:text-clay-600"
                  >
                    {link.label}
                    <Icon name="arrow" size={13} />
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
