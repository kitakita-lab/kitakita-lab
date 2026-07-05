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
        <div className="relative overflow-hidden rounded-[2rem] border border-line bg-paper-200 px-7 py-14 sm:px-12 sm:py-20">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-sage-100/70 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-2xl text-center">
            <span className="eyebrow">Creators</span>
            {/* スマホでは意味のまとまり2行に固定。カード内の見出し幅が狭く
                （320pxで約214px）「一緒に進めませんか。」は3行になり「んか。」が
                孤立するため、重複する「一緒に」（下のボタンが担う）を外して
                「その「少し」、／進めませんか。」に。極小トラッキングで320pxでも
                2行に収める（sm以上は通常字間・本文の text-pretty は自動調整）。 */}
            <h2 className="mt-4 text-3xl leading-tight sm:text-4xl lg:text-[2.5rem]">
              <span className="tracking-[-0.02em] sm:tracking-normal">
                その「少し」、
                <br className="sm:hidden" />
                進めませんか。
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
