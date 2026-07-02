import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'

/** 「きたきた」に重なる4つの意味。ブランドの核（docs/BRAND.md）。 */
const kitaMeanings = [
  {
    kana: '北',
    title: '北海道の「きた」',
    body: '私たちの出発点であり、帰る場所。この土地から始めます。',
  },
  {
    kana: '来た',
    title: 'やってきた の「きた」',
    body: 'ここまで歩いてきた道のり。積み重ねてきた時間。',
  },
  {
    kana: 'きた！',
    title: '届いた日の「きた！」',
    body: '箱を開ける瞬間の、あの弾む気持ち。つくり手と受け手の喜び。',
  },
  {
    kana: '機会',
    title: 'チャンスがきた の「きた」',
    body: '出店の話がきた。仲間がきた。アイデアがきた。未来がきた。',
  },
]

/**
 * 「KitaKita Labとは」— ブランドの物語。
 * 何をしている会社かではなく、どんな価値観で挑戦を育てるかを語る。
 */
export function About() {
  return (
    <Section id="about" tone="paper" spacing="lg">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal>
          <span className="eyebrow">About</span>
          <h2 className="mt-3 text-3xl leading-tight sm:text-4xl">
            KitaKita Labとは
          </h2>
        </Reveal>

        <Reveal delay={80} className="max-w-prose space-y-6 text-lg leading-loose text-ink/85">
          <p>
            KitaKita Labは、<span className="font-medium text-ink">北海道から、新しい挑戦を育てるブランド</span>です。
          </p>
          <p>
            ハンドメイド作家の活動から始まった私たちは、知っています。
            挑戦は、計画どおりには来ないこと。ある日ふいに「きた」ること。
            そして、やってきた挑戦をひとりで育てるのは、少し心細いということも。
          </p>
          <p>
            ここでいう挑戦に、大きさは関係ありません。
            人の一歩も、地域の企画も、企業の新しい試みも、
            生まれたてのアイデアも——すべてが育てる対象です。
          </p>
          <p className="text-ink-muted">
            Labは、研究所ではありません。完成したものを飾る場所でもありません。
            挑戦を試し、育て、かたちにする——そんな実験室です。
          </p>
        </Reveal>
      </div>

      {/* 4つの「きた」 */}
      <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
        {kitaMeanings.map((m, i) => (
          <Reveal key={m.title} delay={i * 80}>
            <div className="flex h-full flex-col rounded-xl2 border border-line bg-paper-50 p-6">
              <span className="font-serif text-3xl text-clay-400">{m.kana}</span>
              <h3 className="mt-4 text-base text-ink">{m.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{m.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
