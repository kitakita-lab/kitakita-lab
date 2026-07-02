import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { NavLink } from '@/components/layout/NavLink'

/**
 * Hero — ブランドの第一声。
 * 4つの「きた」（北海道 / やってきた / きた！ / チャンスがきた）を
 * 説明ではなく体験として届ける。詳細は docs/BRAND.md。
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-paper">
      {/* Soft ambient shapes */}
      <div
        className="pointer-events-none absolute -left-32 top-10 h-[26rem] w-[26rem] rounded-full bg-clay-100/50 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-sage-100/60 blur-3xl"
        aria-hidden="true"
      />

      <div className="container-content relative pb-20 pt-20 sm:pb-28 sm:pt-28 lg:pb-36 lg:pt-32">
        <div className="max-w-3xl animate-fade-up">
          <span className="eyebrow">Growing challenges from Hokkaido</span>

          <h1 className="mt-6 font-serif text-[2.6rem] leading-[1.18] tracking-tight text-ink sm:text-6xl lg:text-[4.25rem] lg:leading-[1.12]">
            <span className="text-clay-600">「きた」</span>を、
            <br />
            育てる。
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
            出店の話がきた。仲間がきた。アイデアがきた。
            <br className="hidden sm:block" />
            ——挑戦は、ある日突然やってくる。
            <br className="hidden sm:block" />
            KitaKita Labは、そのひとつひとつを試し、育て、
            <wbr />
            かたちにして届ける、北海道の実験室です。
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href="/#about" size="lg">
              ブランドの物語を読む
              <Icon name="arrow" size={18} />
            </Button>
            <Button to="/creators" size="lg" variant="secondary">
              一緒に挑戦を育てる
            </Button>
          </div>
        </div>

        {/* Quiet anchor cue */}
        <div className="mt-20 hidden items-center gap-3 text-sm text-ink-soft sm:flex">
          <NavLink href="/#about" className="link-underline">
            <span className="inline-block h-px w-10 bg-ink-soft/50" />
            「きたきた」に込めた、4つの意味
          </NavLink>
        </div>
      </div>
    </section>
  )
}
