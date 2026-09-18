import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'

/**
 * 人格がいちばん濃く出る場所。Hero の「ちょっと進めてみる」を言い換えず、
 * KitaKita Lab がどう関わるか（考えるところから一緒に、必要なら現場まで）を
 * 短い言い切りと転換の2行で置く。
 * 背景は本文と同じ地色。以前は深い森の色、次に淡いセージの面にしていたが、
 * 色面で区切らず、大きな明朝と上下の余白だけで独立して見えるようにする。
 */
export function Philosophy() {
  return (
    // 章1の中の節。About の直後に、一続きの話として読ませる
    <Section tone="paper" spacing="node">
      <Reveal className="mx-auto max-w-4xl py-6 text-center sm:py-10">
        <p className="font-serif text-2xl leading-[2] tracking-[0.12em] text-ink sm:text-3xl lg:text-4xl lg:leading-[1.9]">
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
