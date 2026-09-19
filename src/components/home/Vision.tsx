import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { Segments } from '@/components/ui/Segments'
import { typeset } from '@/lib/typo'

const futures = [
  {
    step: '01',
    titleSegments: ['「ちょっと」に、', '勇気が', 'いらなくなる'],
    body: '進めてみるのに、覚悟も宣言もいらない。散歩くらいの気軽さで。',
  },
  {
    step: '02',
    titleSegments: ['北海道の日常に、', '進む楽しさを'],
    body: '特別な日じゃなくていい。この土地の毎日の中に、小さな前進を。',
  },
  {
    step: '03',
    titleSegments: ['受け取ったものが、', 'めぐっていく'],
    body: '応援は、使っても減らない。手から手へ、ずっと先まで。',
  },
]

/** Vision — 目指す景色。大きな未来ではなく、確かな景色を。 */
export function Vision() {
  return (
    // 章1の最後の節。見出しは節の大きさ（md）。
    // 01〜03 の大きな薄い番号は「景色」の目印で、Activities の手順番号とは役割が違う。
    <Section id="vision" tone="paper" spacing="node">
      <SectionHeading
        eyebrow="Vision"
        size="md"
        title={<>目指している景色</>}
        description="劇的な変化ではなく、こんな景色を思い描いています。"
      />

      <div className="mt-10 grid gap-6 sm:mt-12 sm:gap-8 lg:grid-cols-3">
        {futures.map((item, i) => (
          <Reveal key={item.step} delay={i * 90}>
            <div className="flex h-full flex-col">
              <span className="font-serif text-5xl text-clay-200">{item.step}</span>
              {/* 見出しは意味の単位でだけ折る（「勇／気」のような語中折れを防ぐ） */}
              <h3 className="mt-5 text-xl text-ink">
                <Segments segments={item.titleSegments} />
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
                {typeset(item.body)}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
