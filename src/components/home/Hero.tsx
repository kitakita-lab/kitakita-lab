import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { NavLink } from '@/components/layout/NavLink'

/**
 * Hero — the opening of the story. Generous whitespace, a single strong
 * statement, and a quiet supporting line. No heavy effects.
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
          <span className="eyebrow">A project for handmade creators</span>

          <h1 className="mt-6 font-serif text-[2.6rem] leading-[1.18] tracking-tight text-ink sm:text-6xl lg:text-[4.25rem] lg:leading-[1.12]">
            ハンドメイド作家が、
            <br className="hidden sm:block" />
            もっと挑戦できる
            <br />
            <span className="text-clay-600">世界をつくる。</span>
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
            KitaKita Labは、作品を売るための場所ではありません。
            <br className="hidden sm:block" />
            作家が挑戦し、活躍できる「場所」そのものを増やしていく、
            <wbr />
            ものづくりのためのプロジェクトです。
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href="/#about" size="lg">
              KitaKita Labの想いを読む
              <Icon name="arrow" size={18} />
            </Button>
            <Button to="/creators" size="lg" variant="secondary">
              作家として参加する
            </Button>
          </div>
        </div>

        {/* Quiet anchor cue */}
        <div className="mt-20 hidden items-center gap-3 text-sm text-ink-soft sm:flex">
          <NavLink href="/#about" className="link-underline">
            <span className="inline-block h-px w-10 bg-ink-soft/50" />
            なぜ、始めたのか
          </NavLink>
        </div>
      </div>
    </section>
  )
}
