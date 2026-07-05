import type { ReactNode } from 'react'
import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

type CtaBandProps = {
  title?: ReactNode
  description?: string
  primary?: { label: string; to: string }
  secondary?: { label: string; to: string }
}

/** Reusable closing call-to-action band (dark). */
export function CtaBand({
  title = (
    <>
      話すことから
      <br className="sm:hidden" />
      始めませんか。
    </>
  ),
  description = '相談でも、雑談でも。進めてみたいことがあれば、聞かせてください。',
  primary = { label: 'お問い合わせ', to: '/contact' },
  // NOTE: Creators への導線は、CreatorsCallout / FaqPage も含めて
  // 「一緒に進めてみる」に統一している。同じ役割のCTAが違う文言で
  // 複数存在すると迷わせるため（docs/BRAND.md）。
  secondary = { label: '一緒に進めてみる', to: '/creators' },
}: CtaBandProps) {
  return (
    <Section tone="ink" spacing="lg">
      <Reveal className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl leading-tight text-paper sm:text-4xl lg:text-[2.75rem]">
          {title}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-paper/70 sm:text-lg">
          {description}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button to={primary.to} size="lg" variant="invert">
            {primary.label}
            <Icon name="arrow" size={18} />
          </Button>
          {secondary && (
            <Button to={secondary.to} size="lg" variant="invertOutline">
              {secondary.label}
            </Button>
          )}
        </div>
      </Reveal>
    </Section>
  )
}
