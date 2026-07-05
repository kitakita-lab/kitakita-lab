import { Seo } from '@/components/Seo'
import { PageHeader } from '@/components/layout/PageHeader'
import { NavLink } from '@/components/layout/NavLink'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { Icon } from '@/components/ui/Icon'
import { AccordionItem } from '@/components/ui/Accordion'
import { CtaBand } from '@/components/CtaBand'
import { cn } from '@/lib/cn'
import { workshopPhotos } from '@/data/workshops'

const takeaways = [
  {
    icon: 'creators',
    title: 'はじめての一歩',
    body: '経験がなくても大丈夫。道具の持ち方から、ゆっくりお伝えします。',
  },
  {
    icon: 'workshop',
    title: '自分の手でつくる喜び',
    body: '誰かと比べなくていい。自分のペースで進める、静かな手ごたえ。',
  },
  {
    icon: 'collab',
    title: '小さな会話が生まれる',
    body: '作家や、隣に座った人と。手を動かしながらの、気負わない時間。',
  },
  {
    icon: 'check',
    title: '持ち帰れるもの',
    body: '完成した作品と、「少し進めてみた」という実感を持ち帰れます。',
  },
] as const

const scenes = [
  {
    icon: 'collab',
    title: '企業',
    body: 'ブランドメッセージを、説明ではなく体験として届ける社内イベントやノベルティ企画に。',
  },
  {
    icon: 'event',
    title: '商業施設',
    body: '買い物のついでに、少しつくってみる。賑わいと、思いがけない出会いが生まれる場に。',
  },
  {
    icon: 'market',
    title: '自治体',
    body: '地域の魅力を、つくる体験を通じて伝える。住民向けの企画やシティプロモーションに。',
  },
  {
    icon: 'workshop',
    title: '教育機関',
    body: '子どもから学生まで。つくる楽しさから、表現する力を育てる時間に。',
  },
] as const

const flow = [
  {
    step: '01',
    title: '気になったら、まずご相談',
    body: '開催したい場所や人数、目的をお聞かせください。まだ漠然とした段階でも大丈夫です。',
  },
  {
    step: '02',
    title: '内容を一緒に組み立てる',
    body: '対象や会場、目的に合わせて、体験の中身と進め方を設計します。',
  },
  {
    step: '03',
    title: '当日、手を動かす時間',
    body: '説明よりも、実際に手を動かす時間を大切に。その場の温度を見ながら進めます。',
  },
  {
    step: '04',
    title: 'その後も、少しずつ',
    body: '実施後の声を踏まえて、次の機会や新しい企画につなげていきます。',
  },
]

const miniFaq = [
  {
    question: '経験がなくても参加できますか？',
    answer: 'はい、大丈夫です。初めての方に向けて、道具の使い方からゆっくりお伝えしています。',
  },
  {
    question: '少人数や貸切での開催はできますか？',
    answer: '内容や人数に応じてご相談可能です。企業・自治体・教育機関からのご依頼もお気軽にどうぞ。',
  },
]

export function WorkshopPage() {
  return (
    <>
      <Seo
        title="Workshop"
        path="/workshop"
        description="作家 ikyu の「ワークショップをやってみたい」を、KitaKita Lab が企業とのご縁と企画でかたちにした取り組み。つくる楽しさを届ける体験の場です。"
      />

      <PageHeader
        eyebrow="Workshop"
        title={
          <>
            つくる<span className="whitespace-nowrap">楽しさ</span>を
            <br />
            体験として<span className="whitespace-nowrap">届ける。</span>
          </>
        }
        description="少人数レッスンから企業コラボ、商業施設イベントまで。手を動かすと、少し進む。参加者には「つくる喜び」を、作家には「はじめての舞台」を。"
      />

      <Section tone="paper" spacing="md">
        <Reveal className="mx-auto max-w-prose text-center">
          <span className="eyebrow">About</span>
          <h2 className="mt-3 text-2xl leading-relaxed text-ink sm:text-3xl">
            説明よりも、体験を。
          </h2>
          <p className="mt-6 text-base leading-loose text-ink-muted sm:text-lg">
            ワークショップは、何かを教わる時間である以上に、自分の手で少し進めてみる時間だと考えています。
            うまくできるかどうかより、手を動かしてみたかどうか。この場を開いたのは、作家 ikyu。
            KitaKita Lab は、企業とのご縁と企画で、その最初の一歩を<span className="whitespace-nowrap">いっしょに</span>形にしました。
          </p>
        </Reveal>
      </Section>

      <Section tone="tint" spacing="lg">
        <SectionHeading
          eyebrow="Experience"
          title={
            <>
              参加すると
              <br className="sm:hidden" />
              少し変わること
            </>
          }
          description="大げさな変化ではなく、こんな手ざわりを届けたいと思っています。"
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {takeaways.map((item, i) => (
            <Reveal key={item.title} delay={(i % 4) * 70}>
              <div className="flex h-full flex-col rounded-xl2 border border-line bg-paper-50 p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-100 text-sage-700">
                  <Icon name={item.icon} size={20} />
                </span>
                <h3 className="mt-5 text-base text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="paper" spacing="lg">
        <SectionHeading
          eyebrow="Gallery"
          title={
            <>
              現場の空気を
              <br className="sm:hidden" />
              少しだけ。
            </>
          }
          description={
            <>
              説明より、写真で伝わることが<span className="whitespace-nowrap">あります</span>。
            </>
          }
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {workshopPhotos.map((photo, i) => (
            <Reveal
              key={photo.id}
              delay={(i % 3) * 80}
              className={cn(i === 0 && 'sm:col-span-2')}
            >
              <figure className="group">
                <div
                  className={cn(
                    'overflow-hidden rounded-xl2 bg-paper-200',
                    i === 0 ? 'aspect-[16/9]' : 'aspect-[4/3]',
                  )}
                >
                  <img
                    src={photo.image}
                    alt={photo.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                {(photo.title || photo.summary) && (
                  <figcaption className="mt-4">
                    {photo.title && (
                      <p className="text-base text-ink">
                        {photo.title}
                        {photo.venue && (
                          <span className="ml-2 text-sm text-ink-soft">{photo.venue}</span>
                        )}
                      </p>
                    )}
                    {photo.summary && (
                      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                        {photo.summary}
                      </p>
                    )}
                  </figcaption>
                )}
              </figure>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="tint" spacing="lg">
        <SectionHeading
          eyebrow="Scenes"
          title={
            <>
              こんな場で
              <br className="sm:hidden" />
              生まれています
            </>
          }
          description="目的や場に合わせて、ワークショップのかたちを少しずつ変えています。"
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {scenes.map((s, i) => (
            <Reveal key={s.title} delay={(i % 2) * 80}>
              <div className="h-full rounded-xl2 border border-line bg-paper p-6 sm:p-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-clay-50 text-clay-600">
                  <Icon name={s.icon} size={24} />
                </span>
                <h3 className="mt-5 text-xl text-ink">{s.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="paper" spacing="lg">
        <SectionHeading
          eyebrow="Flow"
          title="開催までの流れ"
          description="ご相談から当日、その先まで。一つずつ、ていねいに進めます。"
        />
        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {flow.map((f, i) => (
            <Reveal
              key={f.step}
              as="li"
              delay={i * 80}
              className="flex h-full flex-col rounded-xl2 border border-line bg-paper-50 p-6"
            >
              <span className="font-serif text-4xl text-clay-200">{f.step}</span>
              <h3 className="mt-4 text-base text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{f.body}</p>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section tone="tint" spacing="md">
        <Reveal className="mx-auto max-w-prose">
          <span className="eyebrow">FAQ</span>
          <h2 className="mt-3 text-2xl text-ink sm:text-3xl">よくある質問</h2>
          <div className="mt-6 border-t border-line">
            {miniFaq.map((item) => (
              <AccordionItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
          <NavLink
            href="/faq"
            className="mt-6 inline-flex items-center gap-1 text-sm text-sage-700 underline decoration-sage-300 underline-offset-4 transition-colors hover:text-sage-500"
          >
            すべての質問を見る
            <Icon name="arrow" size={14} />
          </NavLink>
        </Reveal>
      </Section>

      <CtaBand
        title={
          <>
            その<span className="whitespace-nowrap">ワークショップ</span>、<span className="whitespace-nowrap">少し</span>形にしてみませんか。
          </>
        }
        description="内容が固まっていなくても大丈夫です。まずは、思っていることを聞かせてください。"
        primary={{ label: 'お問い合わせ', to: '/contact' }}
        secondary={{ label: '連携について見る', to: '/collaboration' }}
      />
    </>
  )
}
