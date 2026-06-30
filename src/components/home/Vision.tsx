import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'

const futures = [
  {
    step: '01',
    title: '挑戦が、あたりまえになる',
    body: '「やってみたい」と思ったとき、いつでも一歩を踏み出せる。挑戦することが特別ではなく、あたりまえになる世界へ。',
  },
  {
    step: '02',
    title: '作家が、地域や社会とつながる',
    body: '企業・自治体・商業施設・教育機関と作家がつながり、ものづくりの力が社会のあちこちで活きていく。',
  },
  {
    step: '03',
    title: 'ハンドメイド市場が、大きくなる',
    body: 'つくり手が増え、活躍の場が広がり、次の世代の作家が育つ。あたたかい循環が、市場そのものを育てていく。',
  },
]

/** Vision — the future we're aiming for, shown as a small numbered journey. */
export function Vision() {
  return (
    <Section id="vision" tone="paper" spacing="lg">
      <SectionHeading
        eyebrow="Vision"
        title={<>私たちが目指す、これからの景色</>}
        description="KitaKita Labが描くのは、作家ひとりの成功ではなく、ものづくりに関わる人すべてが前に進める未来です。"
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
