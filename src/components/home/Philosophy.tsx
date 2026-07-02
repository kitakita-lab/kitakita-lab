import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'

/**
 * ブランドフィロソフィー — 一文だけを、深い余白の中に置く。
 * 説明も装飾も足さない。言葉に空間を与える（docs/BRAND.md）。
 */
export function Philosophy() {
  return (
    <Section tone="ink" spacing="lg">
      <Reveal className="mx-auto max-w-4xl py-14 text-center sm:py-24">
        <p className="font-serif text-3xl leading-[1.7] tracking-wide text-paper sm:text-4xl lg:text-[3.25rem] lg:leading-[1.65]">
          挑戦は、
          <br className="sm:hidden" />
          待つものではなく、
          <br />
          <span className="text-clay-300">育てるもの。</span>
        </p>
      </Reveal>
    </Section>
  )
}
