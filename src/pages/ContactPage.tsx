import { Seo } from '@/components/Seo'
import { typeset } from '@/lib/typo'
import { PageHeader } from '@/components/layout/PageHeader'
import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { site } from '@/data/site'
import { useRef, useState } from 'react'

const points = [
  '企業・商業施設・自治体・教育機関との連携のご相談',
  '作家として参加したい方からのご応募',
  '取材・メディア掲載のお問い合わせ',
]

/** メール起動ボタンで初期入力する件名（企業以外の方も使える共通の件名）。 */
const mailSubject = 'KitaKita Labへのお問い合わせ'

/** site.email 宛に、件名を初期入力した mailto: URL を組み立てる。 */
function buildMailtoHref(): string {
  return `mailto:${site.email}?subject=${encodeURIComponent(mailSubject)}`
}

type CopyState = 'idle' | 'copied' | 'failed'

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
        description="うまく言葉にならなくても、大丈夫です。まずは、聞かせてください。"
      />

      <Section tone="paper" spacing="lg">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal>
            <div className="lg:sticky lg:top-24">
              <h2 className="text-2xl text-ink">
                こんなご連絡を
                <br className="sm:hidden" />
                お待ちしています
              </h2>
              <ul className="mt-6 space-y-3">
                {points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-[15px] text-ink-muted">
                    <span className="mt-1 text-clay-500">
                      <Icon name="check" size={18} />
                    </span>
                    {typeset(p)}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="rounded-[1.75rem] border border-line bg-paper p-6 sm:p-8">
              <MailContact />
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  )
}

/**
 * メールでのお問い合わせ。サーバーや外部フォームサービスは持たず、
 * site.email 宛のメールに一本化する。メールアプリが開かない環境でも
 * 送れるよう、アドレスを表示し、コピーもできるようにしている。
 */
function MailContact() {
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const addressRef = useRef<HTMLParagraphElement>(null)

  /** コピーできない環境では、アドレスを選択状態にして手動コピーを促す。 */
  const selectAddress = () => {
    const node = addressRef.current
    const selection = window.getSelection()
    if (!node || !selection) return
    const range = document.createRange()
    range.selectNodeContents(node)
    selection.removeAllRanges()
    selection.addRange(range)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(site.email)
      setCopyState('copied')
    } catch {
      selectAddress()
      setCopyState('failed')
    }
  }

  return (
    <div>
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-clay-50 text-clay-600">
        <Icon name="mail" size={20} />
      </span>
      <h2 className="mt-4 text-sm font-normal text-ink-muted">メールでのお問い合わせ</h2>
      <p
        ref={addressRef}
        className="mt-2 select-all break-all text-2xl text-ink sm:text-3xl"
      >
        {site.email}
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button href={buildMailtoHref()} size="lg">
          <Icon name="mail" size={18} />
          メールで問い合わせる
        </Button>
        <Button type="button" variant="secondary" size="lg" onClick={handleCopy}>
          アドレスをコピー
        </Button>
      </div>

      <p className="mt-3 min-h-[1.5rem] text-sm text-clay-600" role="status" aria-live="polite">
        {copyState === 'copied' && 'メールアドレスをコピーしました。'}
        {copyState === 'failed' &&
          'コピーできませんでした。選択されたアドレスを、手動でコピーしてください。'}
      </p>

      <p className="mt-4 text-sm leading-relaxed text-ink-soft">
        {typeset(
          'メールアプリが開かない場合は、上のアドレスをコピーして、お使いのメールから送信してください。',
        )}
      </p>
    </div>
  )
}
