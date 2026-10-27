import { Seo } from '@/components/Seo'
import { typeset } from '@/lib/typo'
import { Segments } from '@/components/ui/Segments'
import { PageHeader } from '@/components/layout/PageHeader'
import { NavLink } from '@/components/layout/NavLink'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import {
  applicationFields,
  applicationNotes,
  applicationSteps,
  creatorApplication,
  creatorRoles,
  creatorValues,
  isApplicationOpen,
} from '@/data/creators'

const linkClass =
  'inline-flex items-center gap-1 text-ink underline decoration-clay-300 underline-offset-4 transition-colors hover:text-clay-600'

export function CreatorsPage() {
  const open = isApplicationOpen()

  return (
    <>
      <Seo
        title="作家・つくり手・事業者の募集"
        path="/creators"
        description="KitaKita Labは、札幌を拠点に、商業施設や企業のイベントでワークショップや体験企画を企画・運営しています。今後の企画でご一緒できる作家・つくり手・事業者の方を募集しています。"
      />

      <PageHeader
        eyebrow="Creators"
        title={
          // 「その「ちょっと」を」(約275px)は320px幅(272px)を数px超え、
          // 「ちょ／っと」と語中で割れるため、極小トラッキングで1行に収める
          // （フォントサイズ不変・sm以上は通常字間）。
          <span className="tracking-[-0.02em] sm:tracking-normal">
            その<span className="whitespace-nowrap">「ちょっと」</span>を
            <br />
            ここから。
          </span>
        }
        description={
          <>
            探しているのは、スキルの高い人<span className="whitespace-nowrap">ではありません</span>。
            <br className="sm:hidden" />
            一歩踏み出してみたい人<span className="whitespace-nowrap">です</span>。
            <br className="sm:hidden" />
            <br className="sm:hidden" />
            作家はもちろん、
            <br className="sm:hidden" />
            この考え方が好きな人<span className="whitespace-nowrap">なら</span>、
            <br className="sm:hidden" />
            <span className="whitespace-nowrap">いま</span>の<span className="whitespace-nowrap">肩書き</span>は問いません。
          </>
        }
      >
        <Button to="/creators#apply" size="lg">
          応募について
          <Icon name="arrow" size={18} />
        </Button>
      </PageHeader>

      {/* 募集について（目的・活動・実績） */}
      <Section tone="paper" spacing="lg">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <Reveal className="max-w-prose">
            <span className="eyebrow">About this call</span>
            <h2 className="mt-3 text-2xl leading-relaxed text-ink sm:text-3xl">
              <Segments segments={['これからの体験を、', '一緒に考えられる人へ']} />
            </h2>
            <div className="mt-6 space-y-5 text-base leading-loose text-ink-muted">
              <p>
                {typeset(
                  'KitaKita Labは、札幌を拠点に、商業施設や企業のイベントで、ワークショップや体験の企画・運営をしています。施設や企業、作家やつくり手と一緒に、当日の現場まで関わるのが私たちの仕事です。',
                )}
              </p>
              <p>
                {typeset(
                  '今回の募集は、今後のワークショップや体験イベントで、ご一緒できるかを考えていける作家・つくり手・事業者の方との出会いをつくるためのものです。',
                )}
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <Card>
              <span className="eyebrow">Record</span>
              <p className="mt-3 text-[15px] leading-relaxed text-ink">
                {typeset('ハンドメイドアクセサリーブランド ikyu と取り組む、フラワーボトルづくり体験')}
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-ink-soft">開催</dt>
                  <dd className="mt-1 font-serif text-3xl text-ink">6会期</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-soft">制作本数</dt>
                  <dd className="mt-1 font-serif text-3xl text-ink">計1,127本</dd>
                </div>
              </dl>
              <p className="mt-5 text-sm leading-relaxed text-ink-muted">
                {typeset('2026年6月から9月にかけて、札幌市・北広島市の商業施設や公共空間で開催しました。')}
              </p>
              <div className="mt-4 text-sm">
                <NavLink href="/events" className={linkClass}>
                  開催実績を見る
                  <Icon name="arrow" size={13} />
                </NavLink>
              </div>
            </Card>
          </Reveal>
        </div>
      </Section>

      {/* 共感してほしい価値観 */}
      <Section tone="tint" spacing="lg">
        <SectionHeading
          eyebrow="Our values"
          title={
            // 「私たちが」/「大切にしていること」の意味のまとまりで2行に固定。
            // 320px幅では2行目が約3px溢れて「と」だけ孤立するため、極小の
            // トラッキング詰め（フォントサイズは不変）で2行に収める。sm以上は
            // 余裕があるので通常字間に戻す（Hero.tsx と同じ狭幅対応の考え方）。
            <span className="tracking-[-0.02em] sm:tracking-normal">
              私たちが
              <br />
              大切にしていること
            </span>
          }
          description="スキルや実績よりも、この考え方に「いいな」と思えるかどうか。それが、いちばん大切な出発点です。"
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {creatorValues.map((v, i) => (
            <Reveal key={v.title} delay={i * 90}>
              <div className="flex h-full flex-col rounded-xl2 border border-line bg-paper-50 p-7">
                <span className="font-serif text-3xl text-clay-300" aria-hidden="true">
                  “
                </span>
                <h3 className="mt-2 text-xl text-ink">{v.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{typeset(v.body)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 募集する方の方向性 */}
      <Section tone="paper" spacing="lg">
        <SectionHeading
          eyebrow="Who we look for"
          // 意味の単位で折る（390px で「募／集」と割れないように）
          title={<Segments segments={['こんな方を', '募集しています']} />}
          description="いまのステージは、さまざまでかまいません。進めてみたい気持ちがあれば、それで十分です。"
        />
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {creatorRoles.map((role, i) => (
            <Reveal key={role.title} delay={(i % 2) * 80}>
              <Card className="flex h-full items-start gap-4">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-clay-100 text-clay-600">
                  <Icon name="check" size={18} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg text-ink">
                    <Segments segments={role.titleSegments} />
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
                    {typeset(role.description)}
                  </p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 応募後の流れ（/workshop の Flow と同じ見せ方） */}
      <Section tone="tint" spacing="lg">
        <SectionHeading eyebrow="Flow" title="応募後の流れ" />
        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {applicationSteps.map((step, i) => (
            <Reveal
              key={step.title}
              as="li"
              delay={i * 80}
              className="flex h-full flex-col rounded-xl2 border border-line bg-paper-50 p-6"
            >
              <span className="font-serif text-4xl text-clay-200">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-4 text-base text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{typeset(step.body)}</p>
            </Reveal>
          ))}
        </ol>
      </Section>

      {/* メッセージ */}
      <Section tone="paper" spacing="lg">
        <Reveal className="mx-auto max-w-prose text-center">
          <p className="font-serif text-2xl leading-relaxed text-ink sm:text-[1.75rem] sm:leading-relaxed">
            {/* 文ごとに改行し、文の中は意味の単位でだけ折る（「わかりませ／ん。」
                「きっ／といい。」のように割れないように）。単位が入る幅では同じ行に並ぶ。 */}
            <Segments segments={['うまくいくかは、', 'わかりません。']} />
            <br />
            <Segments segments={['でも、ひとりで進めるより、', 'きっといい。']} />
          </p>
          <p className="mt-6 text-base leading-relaxed text-ink-muted">
            まずは話してみることから。進めてみたいことを、聞かせてください。
          </p>
        </Reveal>
      </Section>

      {/* 応募について。ヘッダーのボタン（/creators#apply）の移動先 */}
      <Section id="apply" tone="tint" spacing="lg">
        <Reveal>
          <Card className="mx-auto max-w-3xl p-6 sm:p-10">
            <span className="eyebrow">Apply</span>
            <h2 className="mt-3 text-2xl text-ink sm:text-3xl">応募について</h2>

            <h3 className="mt-8 text-lg leading-snug text-ink">ご確認ください</h3>
            <ul className="mt-4 space-y-2.5">
              {applicationNotes.map((note) => (
                <li
                  key={note}
                  className="relative pl-4 text-[15px] leading-relaxed text-ink-muted before:absolute before:left-0 before:top-[0.7em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-clay-300"
                >
                  {typeset(note)}
                </li>
              ))}
            </ul>

            <h3 className="mt-8 text-lg leading-snug text-ink">応募フォームでお伺いすること</h3>
            <ol className="mt-4 space-y-2.5">
              {applicationFields.map((field, i) => (
                <li key={field.label} className="flex gap-3 text-[15px] leading-relaxed text-ink-muted">
                  <span className="w-4 shrink-0 text-right tabular-nums text-clay-600">{i + 1}.</span>
                  <span>
                    {field.label}
                    {field.optional && <span className="ml-1 text-sm text-ink-soft">（任意）</span>}
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-10 border-t border-line pt-8">
              {open ? (
                <>
                  <Button href={creatorApplication.formUrl!} size="lg">
                    応募フォームへ
                    <Icon name="arrow" size={18} />
                  </Button>
                  <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                    Google フォームが別のタブで開きます。いただいた個人情報は、
                    <NavLink href={creatorApplication.privacyPolicyPath!} className={linkClass}>
                      プライバシーポリシー
                    </NavLink>
                    に沿って取り扱います。
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[15px] leading-relaxed text-ink">
                    {typeset('応募フォームは、現在準備中です。公開までのお問い合わせは、お問い合わせページからお送りください。')}
                  </p>
                  <div className="mt-6">
                    <Button to="/contact" size="lg" variant="secondary">
                      お問い合わせ
                    </Button>
                  </div>
                </>
              )}
              <div className="mt-6 text-sm">
                <NavLink href="/faq" className={linkClass}>
                  よくある質問を見る
                  <Icon name="arrow" size={13} />
                </NavLink>
              </div>
            </div>
          </Card>
        </Reveal>
      </Section>
    </>
  )
}
