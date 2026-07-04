import { Seo } from '@/components/Seo'
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
    body: '地域の魅力発信、シティプロモーション、住民向けイベント。ものづくりを通じて、まちと人をつなぐ企画を届けます。',
  },
  {
    icon: 'workshop',
    title: '教育機関',
    body: '子どもから学生まで、つくる体験を学びに。創造性や表現力を育むプログラムを、教育現場と一緒に組み立てます。',
  },
] as const

const flow = [
  { step: '01', title: 'お問い合わせ', body: '目的やイメージをお聞かせください。まだ漠然とした段階でも歓迎です。' },
  { step: '02', title: '企画のご提案', body: '目的・対象・会場に合わせて、最適なワークショップや企画を設計します。' },
  { step: '03', title: '作家のアサイン', body: '企画に合った作家をご提案。表現力と世界観で、体験の質を高めます。' },
  { step: '04', title: '当日の運営', body: '準備から当日の運営までサポート。安心して開催いただけます。' },
]

export function CollaborationPage() {
  return (
    <>
      <Seo
        title="Collaboration"
        path="/collaboration"
        description="企業・商業施設・自治体・教育機関との連携。ハンドメイドの力で、賑わいづくりやブランド体験、地域・教育の企画を実現します。"
      />

      <PageHeader
        eyebrow="Collaboration"
        title={
          <>
            ものづくりの力で
            <br className="hidden sm:block" />
            <span className="whitespace-nowrap">一緒に</span>
            <span className="whitespace-nowrap">何か</span>を生み出す。
          </>
        }
        description="企業・商業施設・自治体・教育機関の皆さまと連携し、作家の表現力を活かした企画を実現します。賑わいづくりから、ブランド体験、地域・教育の取り組みまで。"
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
                <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{p.body}</p>
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
            <Reveal key={f.step} delay={i * 80}>
              <li className="flex h-full flex-col rounded-xl2 border border-line bg-paper-50 p-6">
                <span className="font-serif text-4xl text-clay-200">{f.step}</span>
                <h3 className="mt-4 text-base text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{f.body}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </Section>

      <CtaBand
        title="連携のご相談を、お待ちしています。"
        description="「こんなことできる？」という段階でも大丈夫です。まずはお気軽にお問い合わせください。"
        primary={{ label: 'お問い合わせ', to: '/contact' }}
        secondary={{ label: 'ワークショップ実績', to: '/workshop' }}
      />
    </>
  )
}
