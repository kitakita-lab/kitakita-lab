import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

/**
 * 仲間への導線。募集ではなく、隣の席をあけておく感じで
 * （docs/BRAND.md: 押し付けない）。
 */
export function CreatorsCallout() {
  return (
    <Section id="creators" tone="paper" spacing="lg">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-line bg-paper-200 px-6 py-14 sm:px-12 sm:py-20">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-sage-100/70 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-2xl text-center">
            <span className="eyebrow">Creators</span>
            {/* ブランドの核となる「一緒に」を残す。スマホではカード内の見出し幅が
                狭い（px-6で約222px）ため、「一緒に「ちょっと」／進めてみませんか。」の
                意味のまとまりで2行に固定。2行目が幅を数px超えるので、スマホのみ
                フォントを1段階（text-2xl）＋極小トラッキングで収める。sm以上は
                通常サイズ・通常字間で1〜2行に自然に組む。 */}
            <h2 className="mt-4 text-2xl leading-tight sm:text-4xl lg:text-[2.5rem]">
              <span className="tracking-[-0.02em] sm:tracking-normal">
                {/* 各まとまりを nowrap で固定し、h2 の text-wrap:balance が
                    CJK 途中で3行目に割るのを防ぐ。sm 以上は br が消え、
                    2つのまとまりの境目でのみ自然に折り返す。 */}
                <span className="whitespace-nowrap">一緒に「ちょっと」</span>
                <br className="sm:hidden" />
                <span className="whitespace-nowrap">進めてみませんか。</span>
              </span>
            </h2>
            <p className="mt-6 text-pretty text-base leading-loose text-ink-muted sm:text-lg">
              大きな一歩じゃなくていい。進めてみたいことがあれば、それで十分です。
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button to="/creators" size="lg">
                一緒に進めてみる
                <Icon name="arrow" size={18} />
              </Button>
              <Button to="/contact" size="lg" variant="secondary">
                まずは話してみる
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
