import { Seo } from '@/components/Seo'
import { Segments } from '@/components/ui/Segments'
import { typeset } from '@/lib/typo'
import { PageHeader } from '@/components/layout/PageHeader'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { CtaBand } from '@/components/CtaBand'

const partners = [
  {
    icon: 'collab',
    title: '企業',
    body: 'ブランドメッセージや商品を、ハンドメイドの体験として届けるコラボワークショップ。社内イベントやノベルティ企画にも対応します。',
  },
  {
    icon: 'event',
    title: '商業施設',
    body: '集客・賑わいづくりと作家の活躍の場を同時に。出店・体験・展示など、施設の特性に合わせた企画を設計します。',
  },
  {
    icon: 'market',
    title: '自治体',
    // 自治体・教育機関はまだ実績がない。実績や進行中の連携に読める言い方
    // （届けます／組み立てます）ではなく、相談できる相手として書く。
    body: '地域の魅力発信、シティプロモーション、住民向けイベントなど。ものづくりを通じてまちと人をつなぐ企画も、ご相談いただけます。',
  },
  {
    icon: 'workshop',
    title: '教育機関',
    body: '子どもから学生まで、つくる体験を学びに。創造性や表現力を育むプログラムについても、教育現場の方とご相談のうえで組み立てていけます。',
  },
] as const

const flow = [
  { step: '01', title: 'お問い合わせ', body: '目的やイメージをお聞かせください。まだ漠然とした段階でも歓迎です。' },
  { step: '02', title: '企画のご提案', body: '目的・対象・会場に合わせて、最適なワークショップや企画を設計します。' },
  // 03 は「作家をアサインする（配置する）」ではなく、作家と一緒に企画を組み立てる関係。
  // 04 は一括請負にも助言だけにも見せず、関係者と同じ現場で進めることと、
  // 任せたい範囲が広い案件にも応じられることの両方を短く言う。
  { step: '03', title: '作家との企画', body: '企画に合う作家と、内容を一緒に組み立てます。表現と世界観が、体験の質をつくります。' },
  { step: '04', title: '当日の運営', body: '会場の準備から当日の運営まで、関係するみなさんと同じ現場で進めます。任せたい範囲が広い場合も、ご相談ください。' },
]

export function CollaborationPage() {
  return (
    <>
      <Seo
        title="Collaboration"
        path="/collaboration"
        description="札幌を拠点に、商業施設や企業イベントでのワークショップ・体験企画を、企業・施設、作家やつくり手と一緒に企画・運営しています。自治体や教育機関との企画のご相談もお受けしています。"
      />

      <PageHeader
        eyebrow="Collaboration"
        title={
          <>
            {/* 意味の単位: 「ものづくりの力で／一緒に何かを／生み出す。」。幅を問わず「力で」で折り、
                スマホでは残りも単位の境目でだけ折れる（3 行）。PC は従来どおり2行。 */}
            <Segments segments={['ものづくりの力で']} />
            <br />
            <Segments segments={['一緒に何かを', '生み出す。']} relaxBelow360={false} />
          </>
        }
        description="商業施設や企業イベントで、作家やつくり手の表現を活かしたワークショップ・体験企画を一緒につくっています。賑わいづくりやブランド体験のほか、自治体や教育機関との企画もご相談いただけます。"
      />

      <Section tone="paper" spacing="lg">
        <SectionHeading
          eyebrow="Partners"
          title="こんな連携ができます"
          description="目的に合わせて、ワークショップ・イベント・体験企画などを柔軟に設計します。"
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {partners.map((p, i) => (
            <Reveal key={p.title} delay={(i % 2) * 80}>
              <Card className="h-full">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-clay-50 text-clay-600">
                  <Icon name={p.icon} size={24} />
                </span>
                <h3 className="mt-5 text-xl text-ink">{p.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{typeset(p.body)}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="tint" spacing="lg">
        <SectionHeading
          eyebrow="Flow"
          title="連携の進め方"
          description="お問い合わせから当日まで、一貫してサポートします。"
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
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{typeset(f.body)}</p>
            </Reveal>
          ))}
        </ol>
      </Section>

      <CtaBand
        title={
          // 320pxで「お待ちしています。」が幅を約3px超えて「す。」が孤立するため、
          // 極小トラッキングで2行に収める（sm以上は通常字間）。
          <span className="tracking-[-0.02em] sm:tracking-normal">
            連携のご相談を、
            <br className="sm:hidden" />
            お待ちしています。
          </span>
        }
        description="「こんなことできる？」という段階でも大丈夫です。まずはお気軽にお問い合わせください。"
        primary={{ label: 'お問い合わせ', to: '/contact' }}
        // 実績（会場名・組数・レポート）は /events にある。/workshop は体験紹介ページなので
        // 「実績」ラベルで送らない。
        secondary={{ label: 'イベント実績を見る', to: '/events' }}
      />
    </>
  )
}
