import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { site } from '@/data/site'

/**
 * ブランドフィロソフィー — サイト全体の土台となる一文を、
 * 説明を添えずに静かに置く（余白が語る）。docs/BRAND.md 参照。
 */
export function Philosophy() {
  return (
    <Section tone="ink" spacing="md">
      <Reveal className="mx-auto max-w-3xl py-6 text-center sm:py-10">
        <p className="font-serif text-2xl leading-relaxed text-paper sm:text-3xl lg:text-[2.4rem] lg:leading-[1.6]">
          挑戦は、待つものではなく、
          <br className="sm:hidden" />
          <span className="text-clay-300">育てるもの。</span>
        </p>
        <p className="mt-6 text-xs uppercase tracking-wider2 text-paper/40">
          {site.name} Philosophy
        </p>
      </Reveal>
    </Section>
  )
}
