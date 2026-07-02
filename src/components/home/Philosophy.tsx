import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'

/**
 * 人格がいちばん濃く出る場所。誠実さ（できない約束はしない）と
 * 温度（少しなら、できます）を、深い森の色の中に置く。
 */
export function Philosophy() {
  return (
    <Section tone="ink" spacing="lg">
      <Reveal className="mx-auto max-w-4xl py-14 text-center sm:py-24">
        <p className="font-serif text-2xl leading-[2] tracking-[0.12em] text-paper sm:text-3xl lg:text-[2.75rem] lg:leading-[1.9]">
          大きな約束は、しません。
          <br />
          <span className="text-clay-200">少しなら、できます。</span>
        </p>
      </Reveal>
    </Section>
  )
}
