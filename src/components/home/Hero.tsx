/**
 * Hero — ブランドの人格が最初に話す場所。
 * 名前の説明をしない。約束もしない。哲学を、静かに置くだけ。
 * 意味の解釈は読む人に委ねる（docs/BRAND.md）。
 * 写真と中心の言葉だけで成立させ、そのまま About へ続く。
 * 三連コピー（ちょっと前へ。ちょっと良く。ちょっと豊かに。）は 2026-09 に外した。
 * 見出しの直下で同じ語を繰り返し、中心の言葉を薄めていたため。移設先は未定。
 * スクロール案内やボタンは置かない（About へのリンクはヘッダーのナビが担う）。
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-paper">
      {/* 背景 — 晴れた空と草原のイメージ（生成画像。実在の撮影地ではない）。
          装飾として扱い、alt は空にする。読み込み前は bg-paper のまま、
          absolute 配置なのでレイアウトは動かない。
          スマホは道の入らない左寄りの正方形トリミングを使い、空・草原・山を優先する。 */}
      <picture>
        <source
          media="(max-width: 639px)"
          type="image/webp"
          srcSet="/hero/hokkaido-field-sp-880.webp"
        />
        <source
          type="image/webp"
          srcSet="/hero/hokkaido-field-1024.webp 1024w, /hero/hokkaido-field-1536.webp 1536w"
          sizes="100vw"
        />
        <img
          src="/hero/hokkaido-field-1536.jpg"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[50%_42%]"
        />
      </picture>
      {/* 半透明レイヤー — 写真ではなく中心の言葉を主役に保つ。
          薄くしすぎると曇天に見え、濃くしすぎると晴天の明るさが消えるので 60%。
          色はページの地色（paper）ではなく、写真の色味を決めたときの白
          （#F7F8F6）に固定する。ページ側の配色を変えても Hero の見え方が動かないため。
          文字の読みやすさは、レイヤーを重ねるのではなく文字色（ink）で確保する。 */}
      <div className="pointer-events-none absolute inset-0 bg-[#F7F8F6]/60" aria-hidden="true" />
      {/* 下端をページ背景（About と同じ bg-paper）へなじませる */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-paper/0 to-paper sm:h-40"
        aria-hidden="true"
      />

      {/* NOTE: 縦書きの装飾ラベルは、フォント未対応環境でグリフが崩れるため
          実機検証が済むまで見送り（docs/BRAND.md 世界観の将来課題）。 */}
      {/* 高さは 70vh を下限にし、コピー群を上下中央に置く。一般的な端末では
          About の見出しが初期表示の下端に少し見え、それが次へ進む合図になる。 */}
      <div className="container-content relative flex min-h-[70vh] flex-col justify-center py-16">
        {/* 下の空き（pb）は、見出しを空の中の同じ位置に保つためのもの。
            中身が見出しだけになっても中央寄せで稜線まで下がらないよう、
            以前そこにあった副コピー1行ぶんの高さを残している。 */}
        <div className="mx-auto w-full max-w-3xl pb-28 text-center sm:pb-24">
          {/* ラベルは ink-soft ではなく ink-muted。ink-soft は無地の bg-paper 上で
              ぎりぎり AA（4.67:1）の値で、背景に空が透けると 4.5 を割るため一段濃くする。 */}
          <p className="animate-fade-up text-[11px] font-medium uppercase tracking-[0.4em] text-ink-muted">
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

          {/* 拠点（北海道）は Hero に添えず、About の1文目で伝える。 */}
        </div>
      </div>
    </section>
  )
}
