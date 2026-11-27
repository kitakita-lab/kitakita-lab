import { Seo } from '@/components/Seo'
import { typeset } from '@/lib/typo'
import { Segments } from '@/components/ui/Segments'
import { PageHeader } from '@/components/layout/PageHeader'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { EmailOff } from '@/components/ui/EmailOff'
import { site } from '@/data/site'
import {
  creatorRoles,
  creatorValues,
  applicationFields,
  applicationNotes,
  applicationSteps,
  applicationPrivacy,
  buildApplicationMailto,
} from '@/data/creators'

export function CreatorsPage() {
  return (
    <>
      <Seo
        title="作家・つくり手の募集"
        path="/creators"
        description="KitaKita Labは、今後のワークショップや体験イベントでご一緒できる作家・つくり手・事業者の方を募集しています。応募はメールで受け付けています。"
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
        <Button href="#apply" size="lg">
          応募の方法
          <Icon name="arrow" size={18} />
        </Button>
      </PageHeader>

      {/* 共感してほしい価値観 */}
      <Section tone="paper" spacing="lg">
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

      {/* 募集対象 */}
      <Section tone="tint" spacing="lg">
        <SectionHeading
          eyebrow="Who we look for"
          // 意味の単位で折る（390px で「募／集」と割れないように）
          title={<Segments segments={['こんな方を', '募集しています']} />}
          description="いまのステージは、さまざまでかまいません。進めてみたい気持ちがあれば、それで十分です。"
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {creatorRoles.map((role, i) => (
            <Reveal key={role.title} delay={(i % 2) * 80}>
              <Card className="flex h-full items-start gap-4">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-clay-100 text-clay-600">
                  <Icon name="check" size={18} />
                </span>
                <div>
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

      {/* 募集について */}
      <Section tone="paper" spacing="lg">
        <SectionHeading
          eyebrow="About this call"
          title={<Segments segments={['募集に', 'ついて']} />}
          description="将来の商業施設や企業イベントでの体験の企画に、一緒に取り組める方との接点づくりを目的としています。"
        />
        <ul className="mx-auto mt-10 max-w-prose space-y-3 text-[15px] leading-relaxed text-ink-muted">
          {applicationNotes.map((note) => (
            <li key={note} className="flex gap-3">
              <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-clay-300" />
              <span>{typeset(note)}</span>
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-6 max-w-prose text-[15px] leading-relaxed text-ink-muted">
          これまでに開催した体験イベントは、
          <Link to="/events" className="text-clay-600 underline decoration-clay-300 underline-offset-4 hover:text-clay-700">
            Events
          </Link>
          でご紹介しています。
        </p>
      </Section>

      {/* 応募の方法（メール） */}
      <Section id="apply" tone="tint" spacing="lg">
        <SectionHeading
          eyebrow="How to apply"
          title={<Segments segments={['応募の', '方法']} />}
          description="応募は、メールで受け付けています。次の内容を添えて、お送りください。"
        />
        <div className="mx-auto mt-10 max-w-prose">
          <ul className="space-y-2 text-[15px] leading-relaxed text-ink">
            {applicationFields.map((f) => (
              <li key={f.label} className="flex gap-3">
                <Icon name="check" size={18} className="mt-1 shrink-0 text-clay-600" />
                <span>
                  {f.label}
                  {f.optional && <span className="text-ink-soft">（任意）</span>}
                </span>
              </li>
            ))}
          </ul>

          <h3 className="mt-10 text-sm font-normal text-ink-muted">応募先のメールアドレス</h3>
          <EmailOff>
            <p className="mt-2 select-all break-all text-2xl text-ink sm:text-3xl">{site.email}</p>
            <div className="mt-6">
              <Button href={buildApplicationMailto()} size="lg">
                <Icon name="mail" size={18} />
                メールで応募する
              </Button>
            </div>
          </EmailOff>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            {typeset('メールアプリが開かない場合は、上のアドレスあてに、お使いのメールから送信してください。')}
          </p>

          <h3 className="mt-12 text-lg text-ink">応募後の流れ</h3>
          <ol className="mt-4 space-y-4">
            {applicationSteps.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-clay-100 text-sm text-clay-600">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[15px] text-ink">{step.title}</p>
                  <p className="mt-1 text-[15px] leading-relaxed text-ink-muted">{typeset(step.body)}</p>
                </div>
              </li>
            ))}
          </ol>

          <h3 className="mt-12 text-lg text-ink">いただいた情報の取り扱い</h3>
          <div className="mt-4 space-y-2 text-[15px] leading-relaxed text-ink-muted">
            {applicationPrivacy.map((t) => (
              <p key={t}>{typeset(t)}</p>
            ))}
            <p>{typeset(`運営：${site.operator}（KitaKita Lab）`)}</p>
          </div>
        </div>
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
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="#apply" size="lg">
              応募の方法を見る
              <Icon name="arrow" size={18} />
            </Button>
            <Button to="/faq" size="lg" variant="secondary">
              よくある質問を見る
            </Button>
          </div>
        </Reveal>
      </Section>
    </>
  )
}
