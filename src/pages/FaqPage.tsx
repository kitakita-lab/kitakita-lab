import { Seo } from '@/components/Seo'
import { PageHeader } from '@/components/layout/PageHeader'
import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { AccordionItem } from '@/components/ui/Accordion'
import { CtaBand } from '@/components/CtaBand'
import { faqItems } from '@/data/faq'

const audiences = ['全般', '作家の方', '企業・自治体の方'] as const

export function FaqPage() {
  return (
    <>
      <Seo
        title="FAQ"
        path="/faq"
        description="KitaKita Labへのよくある質問。作家としての参加、企業・自治体との連携などについてお答えします。"
      />

      <PageHeader
        eyebrow="FAQ"
        title="よくある質問"
        description="作家の方、企業・自治体の方からよくいただく質問をまとめました。"
      />

      <Section tone="paper" spacing="lg">
        <div className="mx-auto max-w-prose space-y-14">
          {audiences.map((audience) => {
            const items = faqItems.filter((f) => f.audience === audience)
            if (items.length === 0) return null
            return (
              <Reveal key={audience}>
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider2 text-clay-600">
                    {audience}
                  </h2>
                  <div className="mt-4 border-t border-line">
                    {items.map((item) => (
                      <AccordionItem
                        key={item.question}
                        question={item.question}
                        answer={item.answer}
                      />
                    ))}
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </Section>

      <CtaBand
        title="疑問は、解消できましたか？"
        description="ここに載っていないご質問も、お気軽にお問い合わせください。"
        primary={{ label: 'お問い合わせ', to: '/contact' }}
        secondary={{ label: '一緒に進めてみる', to: '/creators' }}
      />
    </>
  )
}
