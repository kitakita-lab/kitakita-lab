import { Seo } from '@/components/Seo'
import { PageHeader } from '@/components/layout/PageHeader'
import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { Icon } from '@/components/ui/Icon'
import { ContactForm } from '@/components/ContactForm'
import { site } from '@/data/site'

const points = [
  '作家として参加したい方からのご応募',
  '企業・商業施設・自治体・教育機関との連携のご相談',
  '取材・メディア掲載のお問い合わせ',
]

export function ContactPage() {
  return (
    <>
      <Seo
        title="Contact"
        path="/contact"
        description="KitaKita Labへのお問い合わせ・作家応募・連携のご相談はこちらから。"
      />

      <PageHeader
        eyebrow="Contact"
        title="お問い合わせ"
        description="作家としての参加、企業・自治体との連携、取材のご依頼など、どんなことでもお気軽にご連絡ください。"
      />

      <Section tone="paper" spacing="lg">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal>
            <div className="lg:sticky lg:top-24">
              <h2 className="text-2xl text-ink">こんなご連絡をお待ちしています</h2>
              <ul className="mt-6 space-y-3">
                {points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-[15px] text-ink-muted">
                    <span className="mt-1 text-clay-500">
                      <Icon name="check" size={18} />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>

              {/* TODO: 正式なメールアドレス取得後、site.email に設定すると表示される */}
              {site.email ? (
                <div className="mt-10 rounded-xl2 border border-line bg-paper-50 p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-clay-50 text-clay-600">
                    <Icon name="mail" size={20} />
                  </span>
                  <p className="mt-4 text-sm text-ink-muted">メールでのお問い合わせ</p>
                  <a
                    href={`mailto:${site.email}`}
                    className="mt-1 inline-block break-all text-lg text-ink underline decoration-line underline-offset-4 transition-colors hover:text-clay-600"
                  >
                    {site.email}
                  </a>
                </div>
              ) : (
                <p className="mt-10 text-sm leading-relaxed text-ink-soft">
                  いまは、下のフォームからご連絡いただけます。
                </p>
              )}
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="rounded-[1.75rem] border border-line bg-paper p-6 sm:p-8">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  )
}
