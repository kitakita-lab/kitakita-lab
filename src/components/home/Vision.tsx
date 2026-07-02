import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'

const futures = [
  {
    step: '01',
    title: '「少し」に、勇気がいらなくなる',
    body: '進めてみるのに、覚悟も宣言もいらない。散歩くらいの気軽さで。',
  },
  {
    step: '02',
    title: '北海道の日常に、進む楽しさを',
    body: '特別な日じゃなくていい。この土地の毎日の中に、小さな前進を。',
  },
  {
    step: '03',
    title: '受け取ったものが、めぐっていく',
    body: '応援は、使っても減らない。手から手へ、ずっと先まで。',
  },
]

/** Vision — 目指す景色。大きな未来ではなく、確かな景色を。 */
export function Vision() {
  return (
    <Section id="vision" tone="paper" spacing="lg">
      <SectionHeading
        eyebrow="Vision"
        title={<>目指している景色</>}
        description="劇的な変化ではなく、こんな景色を思い描いています。"
      />

      <div className="mt-14 grid gap-6 sm:gap-8 lg:grid-cols-3">
        {futures.map((item, i) => (
          <Reveal key={item.step} delay={i * 90}>
            <div className="flex h-full flex-col">
              <span className="font-serif text-5xl text-clay-200">{item.step}</span>
              <h3 className="mt-5 text-xl text-ink">{item.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
                {item.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
