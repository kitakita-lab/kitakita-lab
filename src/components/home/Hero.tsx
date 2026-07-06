import { NavLink } from '@/components/layout/NavLink'

/**
 * Hero — ブランドの人格が最初に話す場所。
 * 名前の説明をしない。約束もしない。哲学を、静かに置くだけ。
 * 意味の解釈は読む人に委ねる（docs/BRAND.md）。
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-paper">
      {/* 雪原の空気 — わずかな朝の光 */}
      <div
        className="pointer-events-none absolute -left-40 top-0 h-[30rem] w-[30rem] rounded-full bg-sage-100/50 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-clay-50/60 blur-3xl"
        aria-hidden="true"
      />

      {/* NOTE: 縦書きの装飾ラベルは、フォント未対応環境でグリフが崩れるため
          実機検証が済むまで見送り（docs/BRAND.md 世界観の将来課題）。 */}
      <div className="container-content relative flex min-h-[84vh] flex-col justify-center pb-24 pt-16 sm:min-h-[88vh] sm:pb-32">
        <div className="mx-auto w-full max-w-3xl text-center">
          <p className="animate-fade-up text-[11px] font-medium uppercase tracking-[0.4em] text-ink-soft">
            KitaKita Lab
          </p>

          {/* tracking を狭幅のみ詰める: text-4xl+tracking-0.08em は 320px 幅で
              コンテナ(272px)を数px超え、不格好な改行を起こすための調整
              （フォントサイズは変更しない）。 */}
          <h1
            className="mt-12 animate-fade-up font-serif text-4xl font-medium leading-snug tracking-normal text-ink sm:mt-14 sm:text-5xl sm:tracking-[0.08em] lg:text-[3.4rem]"
            style={{ animationDelay: '150ms' }}
          >
            {/* 9文字の一行は約400px未満で収まらない（375pxでは「ちょっと進／
                めてみる」と語中で割れ、390pxでは余白ゼロまで詰まる）ため、
                400px未満は意味のまとまりで2行に折る（フォントは不変）。 */}
            ちょっと
            <br className="min-[400px]:hidden" />
            進めてみる
          </h1>

          <p
            className="mt-12 animate-fade-up font-serif text-base leading-loose tracking-[0.03em] text-ink-muted sm:mt-14 sm:text-lg sm:tracking-[0.14em]"
            style={{ animationDelay: '400ms' }}
          >
            {/* 22文字の一行は約420px未満で収まらないため、その幅までは
                意味のまとまりで2行にする。 */}
            ちょっと前へ。ちょっと良く。
            <br className="min-[420px]:hidden" />
            ちょっと豊かに。
          </p>

          <p
            className="mt-10 animate-fade-up text-xs tracking-[0.28em] text-ink-soft"
            style={{ animationDelay: '620ms' }}
          >
            北海道から
          </p>
        </div>

        {/* 地平線へおりる、細い線 */}
        <div
          className="absolute inset-x-0 bottom-10 flex animate-fade-in justify-center"
          style={{ animationDelay: '950ms' }}
        >
          <NavLink
            href="/#about"
            className="group flex flex-col items-center gap-3 text-[11px] tracking-wider2 text-ink-soft transition-colors hover:text-sage-700"
          >
            私たちのこと
            <span
              className="block h-10 w-px bg-ink-soft/40 transition-colors group-hover:bg-sage-500"
              aria-hidden="true"
            />
          </NavLink>
        </div>
      </div>
    </section>
  )
}
