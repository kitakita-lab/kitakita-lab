import { Seo } from '@/components/Seo'
import { PageHeader } from '@/components/layout/PageHeader'
import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { Badge } from '@/components/ui/Badge'
import { CtaBand } from '@/components/CtaBand'
import { researchReports } from '@/data/research'

export function ResearchPage() {
  return (
    <>
      <Seo
        title="Research"
        path="/research"
        description="ハンドメイド作家・市場・生活者ニーズに関する調査活動。今後プレスリリースで調査結果を順次公開していきます。"
      />

      <PageHeader
        eyebrow="Research"
        title={
          <>
            現場の声を、
            <br className="hidden sm:block" />
            {/* 「数字とことば」は対（と で連なる）なので分割しない。狭幅では
                「現場の声を、／数字とことば／にする。」と意味のまとまりで折る。 */}
            <span className="whitespace-nowrap">数字とことば</span>にする。
          </>
        }
        description="つくり手と市場の声を、数字にして残しています。次に進む人の地図になるように。調査結果は、今後プレスリリースとして順次公開予定です。"
      />

      <Section tone="paper" spacing="lg">
        <Reveal>
          <div className="rounded-xl2 border border-clay-100 bg-clay-50/50 px-6 py-4 text-sm leading-relaxed text-clay-800">
            現在、以下の調査を実施しています。結果がまとまり次第、
            プレスリリースとしてこのページに順次掲載していきます。
          </div>
        </Reveal>

        <div className="mt-10 space-y-6">
          {researchReports.map((report, i) => (
            <Reveal key={report.id} delay={(i % 3) * 70}>
              <article className="rounded-xl2 border border-line bg-paper-50 p-6 sm:p-8">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3">
                    <Badge tone="sage">{report.tag}</Badge>
                    <span className="text-sm text-ink-soft">{report.status}</span>
                  </div>
                  <h2 className="mt-3 text-xl leading-snug text-ink sm:text-2xl">
                    {report.title}
                  </h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
                    {report.summary}
                  </p>
                  {report.method && (
                    <p className="mt-4 text-xs text-ink-soft">
                      調査方法：{report.method}
                    </p>
                  )}
                </div>

                <div className="mt-7 rounded-xl border border-line bg-paper px-5 py-5">
                  <p className="text-sm font-medium text-clay-600">主な調査項目</p>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-3">
                    {report.topics.map((topic) => (
                      <li
                        key={topic}
                        className="flex gap-2 text-sm leading-snug text-ink-muted"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-clay-300" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <CtaBand
        title="調査の知見を、企画に活かす。"
        description="調査データを踏まえた企画提案や、共同調査のご相談も承っています。お気軽にご連絡ください。"
        primary={{ label: 'お問い合わせ', to: '/contact' }}
        secondary={{ label: '連携について見る', to: '/collaboration' }}
      />
    </>
  )
}
