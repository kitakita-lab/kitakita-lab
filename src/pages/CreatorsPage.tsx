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
        description="KitaKita Labは、一緒に「少し進めてみる」仲間を探しています。ワークショップ講師、イベント出店、はじめての企業案件まで。実績より、進めてみたい気持ちを大切にします。"
      />

      <PageHeader
        eyebrow="Creators"
        title={<>その「少し」を<br />ここから。</>}
        description={
          <>
            探しているのは、スキルの高い人<span className="whitespace-nowrap">ではありません</span>。
            <br className="sm:hidden" />
            一歩踏み出してみたい人<span className="whitespace-nowrap">です</span>。
            <br className="sm:hidden" />
            <br className="sm:hidden" />
            作家はもちろん、
            <br className="sm:hidden" />
            この考え方が好きな人<span className="whitespace-nowrap">なら</span>、
            <br className="sm:hidden" />
            <span className="whitespace-nowrap">いま</span>の<span className="whitespace-nowrap">肩書き</span>は問いません。
          </>
        }
      >
        <Button to="/contact" size="lg">
          お問い合わせ
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
          description="いまのステージは、さまざまでかまいません。進めてみたい気持ちがあれば、それで十分です。"
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
            うまくいくかは、わかりません。
            <br />
            でも、ひとりで進めるより、きっといい。
          </p>
          <p className="mt-6 text-base leading-relaxed text-ink-muted">
            まずは話してみることから。進めてみたいことを、聞かせてください。
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
