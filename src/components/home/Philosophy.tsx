import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'

/**
 * 人格がいちばん濃く出る場所。Hero の「ちょっと進めてみる」を言い換えず、
 * KitaKita Lab がどう関わるか（考えるところから一緒に、必要なら現場まで）を
 * 短い言い切りと転換の2行で、深い森の色の中に置く。
 */
export function Philosophy() {
  return (
    <Section tone="ink" spacing="lg">
      <Reveal className="mx-auto max-w-4xl py-14 text-center sm:py-24">
        <p className="font-serif text-2xl leading-[2] tracking-[0.12em] text-paper sm:text-3xl lg:text-[2.75rem] lg:leading-[1.9]">
          考えるところから、
          <br className="sm:hidden" />
          一緒に。
          <br />
          <span className="text-clay-200">必要なら、現場まで。</span>
        </p>
      </Reveal>
    </Section>
  )
}
