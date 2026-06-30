import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

/**
 * 作家募集への導線。重要コンテンツのため、トップでも独立した
 * 「共感を呼ぶ」セクションとして配置する。
 */
export function CreatorsCallout() {
  return (
    <Section id="creators" tone="paper" spacing="lg">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-line bg-paper-200 px-7 py-14 sm:px-12 sm:py-20">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-clay-100/70 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-2xl text-center">
            <span className="eyebrow">Creators</span>
            <h2 className="mt-4 text-3xl leading-tight sm:text-4xl lg:text-[2.5rem]">
              この景色を、
              <br className="sm:hidden" />
              一緒につくる仲間へ。
            </h2>
            <p className="mt-6 text-base leading-relaxed text-ink-muted sm:text-lg">
              KitaKita Labは、「一緒に活動する作家」ではなく、
              この考え方に共感してくれる仲間を探しています。
              いまの実績よりも、「挑戦してみたい」という気持ちを大切にしています。
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button to="/creators" size="lg">
                募集の想いを見る
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
