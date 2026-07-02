import { Seo } from '@/components/Seo'
import { PageHeader } from '@/components/layout/PageHeader'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { creatorRoles, creatorValues } from '@/data/creators'

export function CreatorsPage() {
  return (
    <>
      <Seo
        title="Creators"
        path="/creators"
        description="KitaKita Labは「挑戦は、待つものではなく、育てるもの。」という考え方に共感してくれる仲間を探しています。ワークショップ講師、イベント出店、企業案件への挑戦、将来講師を目指す方まで。実績より「やってみたい」を大切にします。"
      />

      <PageHeader
        eyebrow="Creators"
        title={<>「挑戦してみたい」を、<br className="hidden sm:block" />ここから。</>}
        description="KitaKita Labが探しているのは、スキルの高い人ではなく、「やってみたい」という芽を持っている人です。作家はもちろん、この考え方に共感してくれる人なら、いまの肩書きは問いません。挑戦は、ここで一緒に育てられます。"
      >
        <Button to="/contact" size="lg">
          仲間になる・話を聞く
          <Icon name="arrow" size={18} />
        </Button>
      </PageHeader>

      {/* 共感してほしい価値観 */}
      <Section tone="paper" spacing="lg">
        <SectionHeading
          eyebrow="Our values"
          title="私たちが、大切にしていること"
          description="スキルや実績よりも、この考え方に「いいな」と思えるかどうか。それが、いちばん大切な出発点です。"
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {creatorValues.map((v, i) => (
            <Reveal key={v.title} delay={i * 90}>
              <div className="flex h-full flex-col rounded-xl2 border border-line bg-paper-50 p-7">
                <span className="font-serif text-3xl text-clay-300" aria-hidden="true">
                  “
                </span>
                <h3 className="mt-2 text-xl text-ink">{v.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 募集対象 */}
      <Section tone="tint" spacing="lg">
        <SectionHeading
          eyebrow="Who we look for"
          title="こんな方を募集しています"
          description="今のステージはさまざまでかまいません。挑戦したい気持ちがあれば、それがいちばんの資格です。"
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {creatorRoles.map((role, i) => (
            <Reveal key={role.title} delay={(i % 2) * 80}>
              <Card className="flex h-full items-start gap-4">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-clay-100 text-clay-600">
                  <Icon name="check" size={18} />
                </span>
                <div>
                  <h3 className="text-lg text-ink">{role.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
                    {role.description}
                  </p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* メッセージ */}
      <Section tone="paper" spacing="lg">
        <Reveal className="mx-auto max-w-prose text-center">
          <p className="font-serif text-2xl leading-relaxed text-ink sm:text-[1.75rem] sm:leading-relaxed">
            挑戦は、待つものではなく、育てるもの。
            <br />
            そして、ひとりで育てなくていいもの。
          </p>
          <p className="mt-6 text-base leading-relaxed text-ink-muted">
            まずは話してみることから。あなたにやってきた「きた」を、聞かせてください。
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button to="/contact" size="lg">
              応募・お問い合わせ
              <Icon name="arrow" size={18} />
            </Button>
            <Button to="/faq" size="lg" variant="secondary">
              よくある質問を見る
            </Button>
          </div>
        </Reveal>
      </Section>
    </>
  )
}
