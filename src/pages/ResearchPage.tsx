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
        title={<>現場の声を、<br className="hidden sm:block" />数字とことばにする。</>}
        description="つくり手と市場の声を、数字にして残しています。次に進む人の地図になるように。調査結果は、今後プレスリリースとして順次公開予定です。"
      />

      <Section tone="paper" spacing="lg">
        <Reveal>
          <div className="rounded-xl2 border border-clay-100 bg-clay-50/50 px-6 py-4 text-sm leading-relaxed text-clay-800">
            以下は構成イメージを示す
            <strong className="font-semibold">ダミーデータ</strong>
            です。実際の調査結果は、公開時にこのページへ掲載します。
          </div>
        </Reveal>

        <div className="mt-10 space-y-6">
          {researchReports.map((report, i) => (
            <Reveal key={report.id} delay={(i % 3) * 70}>
              <article className="rounded-xl2 border border-line bg-paper-50 p-6 sm:p-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3">
                      <Badge tone="sage">{report.tag}</Badge>
                      <span className="text-sm text-ink-soft">{report.date}</span>
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
                </div>

                <dl className="mt-7 grid gap-4 sm:grid-cols-3">
                  {report.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-line bg-paper px-5 py-5"
                    >
                      <dd className="font-serif text-3xl text-clay-600">
                        {stat.value}
                      </dd>
                      <dt className="mt-2 text-sm leading-snug text-ink-muted">
                        {stat.label}
                      </dt>
                      {stat.note && (
                        <p className="mt-1 text-[11px] text-ink-soft">{stat.note}</p>
                      )}
                    </div>
                  ))}
                </dl>
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
