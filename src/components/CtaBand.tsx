import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

type CtaBandProps = {
  title?: string
  description?: string
  primary?: { label: string; to: string }
  secondary?: { label: string; to: string }
}

/** Reusable closing call-to-action band (dark). */
export function CtaBand({
  title = 'まだ見ぬ場所を、一緒につくる。',
  description = 'KitaKita Labのビジョンに共感してくださる、作家・企業・自治体・商業施設・メディアの皆さまからのご連絡をお待ちしています。',
  primary = { label: 'お問い合わせ', to: '/contact' },
  secondary = { label: '作家として参加する', to: '/creators' },
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
          <Button to={primary.to} size="lg" variant="primary" className="bg-paper text-ink hover:bg-clay-200">
            {primary.label}
            <Icon name="arrow" size={18} />
          </Button>
          {secondary && (
            <Button
              to={secondary.to}
              size="lg"
              variant="secondary"
              className="border-paper/30 text-paper hover:border-paper/60 hover:bg-paper/5"
            >
              {secondary.label}
            </Button>
          )}
        </div>
      </Reveal>
    </Section>
  )
}
