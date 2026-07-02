import { NavLink } from '@/components/layout/NavLink'

/**
 * Hero — ブランドの第一声。説明しない。感じさせる。
 *
 * 「きた。」だけを主役に置き、意味の解釈は読み手に委ねる
 * （4つの「きた」は About の物語で回収する）。
 * CTAボタンは意図的に置かない。世界観に浸ってもらい、
 * 行動導線はスクロール先（Creators / CTA band）が受け持つ。
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

      <div className="container-content relative flex min-h-[82vh] flex-col justify-center pb-24 pt-16 sm:min-h-[86vh] sm:pb-32">
        <div className="mx-auto w-full max-w-3xl text-center">
          <p
            className="animate-fade-up text-xs font-medium uppercase tracking-[0.35em] text-ink-soft"
          >
            KitaKita
          </p>

          {/* 全角括弧込みで実質5文字幅。vw連動+nowrapで常に1行に収める */}
          <h1
            className="mt-8 animate-fade-up whitespace-nowrap font-serif text-[min(16vw,9rem)] leading-none tracking-tight text-ink sm:mt-10"
            style={{ animationDelay: '120ms' }}
          >
            「<span className="text-clay-600">きた</span>。」
          </h1>

          <p
            className="mt-10 animate-fade-up font-serif text-xl leading-relaxed text-ink sm:mt-14 sm:text-2xl"
            style={{ animationDelay: '360ms' }}
          >
            それは、
            <br className="sm:hidden" />
            何かが始まる合図。
          </p>

          <p
            className="mt-8 animate-fade-up text-sm leading-loose text-ink-muted sm:text-base"
            style={{ animationDelay: '560ms' }}
          >
            北海道から、
            <br className="sm:hidden" />
            人・地域・アイデアの挑戦を育てる。
          </p>
        </div>

        {/* Quiet scroll cue — the only interactive element in the hero */}
        <div
          className="absolute inset-x-0 bottom-10 flex animate-fade-in justify-center"
          style={{ animationDelay: '900ms' }}
        >
          <NavLink
            href="/#about"
            className="group flex flex-col items-center gap-3 text-xs tracking-wider2 text-ink-soft transition-colors hover:text-clay-600"
          >
            この合図の、物語へ
            <span
              className="block h-10 w-px bg-ink-soft/40 transition-colors group-hover:bg-clay-400"
              aria-hidden="true"
            />
          </NavLink>
        </div>
      </div>
    </section>
  )
}
