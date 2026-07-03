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
            {/* text-balance / text-pretty: 手動の<br>だと幅によって「か。」だけの
                孤立行や「十分」が割れる改行が発生するため、行の折り返しをブラウザの
                自動バランス調整に委ねる（実機幅 320/375/390/430px で確認済み）。 */}
            <h2 className="mt-4 text-balance text-3xl leading-tight sm:text-4xl lg:text-[2.5rem]">
              その「少し」、一緒に進めませんか。
            </h2>
            <p className="mt-6 text-pretty text-base leading-loose text-ink-muted sm:text-lg">
              大きな一歩じゃなくていい。進めてみたいことがあれば、それで十分です。
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button to="/creators" size="lg">
                一緒に進める話
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
