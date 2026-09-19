import { Seo } from '@/components/Seo'
import { Segments } from '@/components/ui/Segments'
import { typeset } from '@/lib/typo'
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
        description="商業施設でのワークショップ・体験イベントの需要について、北海道在住の20〜50代1,000人を対象とした調査を進めています。現場で感じてきたことを、数字でも確かめるために。"
      />

      <PageHeader
        eyebrow="Research"
        title={
          <>
            {/* 意味の単位: 「現場の声を、／数字とことばにする。」。幅を問わず「声を、」で折る。
                375〜390px では 36px の見出しに「数字とことばにする。」10 文字が入らないため、
                「数字と／ことばにする。」で折れる（430px 以上は 2 行）。
                「ことば／にする」のように助詞だけが落ちる形にはしない。PC は従来どおり2行。 */}
            <Segments segments={['現場の声を、']} />
            <br />
            <Segments segments={['数字と', 'ことばにする。']} relaxBelow360={false} />
          </>
        }
        description="現場で感じてきたことを、感覚だけで終わらせないために。商業施設でのワークショップ・体験イベントについて、北海道在住の20〜50代1,000人を対象とした調査を進めています。"
      />

      <Section tone="paper" spacing="lg">
        <Reveal>
          <div className="rounded-xl2 border border-clay-100 bg-clay-50/50 px-6 py-4 text-sm leading-relaxed text-clay-800">
            現在、次の調査を進めています。結果がまとまり次第、このページでお知らせします。
          </div>
        </Reveal>

        <div className="mt-10 space-y-6">
          {researchReports.map((report, i) => (
            <Reveal key={report.id} delay={(i % 3) * 70}>
              <article className="rounded-xl2 border border-line bg-paper-50 p-6 sm:p-8">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3">
                    <Badge tone="neutral">{report.tag}</Badge>
                    <span className="text-sm text-ink-soft">{report.status}</span>
                  </div>
                  {/* titleSegments があれば文節ごとに nowrap にし、語中で折れないようにする
                      （h2 の text-wrap: balance 対策。EventsPage のカードタイトルと同じ手法）。 */}
                  <h2 className="mt-3 text-xl leading-snug text-ink sm:text-2xl">
                    {report.titleSegments
                      ? report.titleSegments.map((seg, j) => (
                          <span key={j} className="whitespace-nowrap">
                            {seg}
                          </span>
                        ))
                      : report.title}
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
                        {typeset(topic)}
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
        // 共同調査の受託や調査サービスは提供していないので CTA にしない。
        // Research から先は、通常の企画・連携の相談へつなぐ。
        // 意味の単位で折る（「ご／相談」「ご相／談」と割れないように）
        title={<Segments segments={['イベントや企画の', 'ご相談は、', 'こちらから。']} />}
        description="商業施設や企業イベントでのワークショップ・体験企画のご相談をお受けしています。調査の結果は、まとまり次第このページでお知らせします。"
        primary={{ label: 'お問い合わせ', to: '/contact' }}
        secondary={{ label: '連携について見る', to: '/collaboration' }}
      />
    </>
  )
}
