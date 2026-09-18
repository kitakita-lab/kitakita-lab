import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'

/**
 * 人格がいちばん濃く出る場所。Hero の「ちょっと進めてみる」を言い換えず、
 * KitaKita Lab がどう関わるか（考えるところから一緒に、必要なら現場まで）を
 * 短い言い切りと転換の2行で置く。
 * 背景は淡いセージ。Hero に空と草原の写真が入ってから、明るい About の直後に
 * 深い森の色（ink）が来ると落差が大きく見えたため、明るさを保ったまま
 * 一段だけ色を変える面にした（濃い面は最終 CTA とフッターに残す）。
 */
export function Philosophy() {
  return (
    <Section tone="sage" spacing="lg">
      <Reveal className="mx-auto max-w-4xl py-14 text-center sm:py-24">
        <p className="font-serif text-2xl leading-[2] tracking-[0.12em] text-ink sm:text-3xl lg:text-[2.75rem] lg:leading-[1.9]">
          考えるところから、
          <br className="sm:hidden" />
          一緒に。
          <br />
          <span className="text-clay-600">必要なら、現場まで。</span>
        </p>
      </Reveal>
    </Section>
  )
}
