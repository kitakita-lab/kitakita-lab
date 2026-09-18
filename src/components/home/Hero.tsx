/**
 * Hero — ブランドの人格が最初に話す場所。
 * 名前の説明をしない。約束もしない。哲学を、静かに置くだけ。
 * 意味の解釈は読む人に委ねる（docs/BRAND.md）。
 * 中心の言葉と三連コピーで締め、そのまま About へ続く。
 * スクロール案内やボタンは置かない（About へのリンクはヘッダーのナビが担う）。
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
      {/* 高さは 70vh を下限にし、コピー群を上下中央に置く。一般的な端末では
          About の見出しが初期表示の下端に少し見え、それが次へ進む合図になる。 */}
      <div className="container-content relative flex min-h-[70vh] flex-col justify-center py-16">
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
          {/* 拠点（北海道）は Hero に添えず、About の1文目で伝える。 */}
        </div>
      </div>
    </section>
  )
}
