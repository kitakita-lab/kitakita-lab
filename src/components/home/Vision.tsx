import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'

const futures = [
  {
    step: '01',
    title: '挑戦が、日常になる',
    body: '始める理由に、大きさはいらない。「やってみたい」が、あたりまえに芽を出す毎日へ。',
  },
  {
    step: '02',
    title: '北海道が、挑戦の産地になる',
    body: '食や自然だけじゃない。「挑戦」も、この土地の名産にする。',
  },
  {
    step: '03',
    title: '「きた！」が、循環する',
    body: '誰かの実りが、次の誰かの合図になる。喜びは、めぐる。',
  },
]

/** Vision — 目指す景色を、3つの季節の移ろいのように。 */
export function Vision() {
  return (
    <Section id="vision" tone="paper" spacing="lg">
      <SectionHeading
        eyebrow="Vision"
        title={<>私たちが目指す、これからの景色</>}
        description="ひとりの成功ではなく、挑戦が芽吹き、実り、また種になる景色を。"
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
