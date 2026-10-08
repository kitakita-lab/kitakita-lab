import { Link } from 'react-router-dom'
import { Seo } from '@/components/Seo'
import { Segments } from '@/components/ui/Segments'
import { typeset } from '@/lib/typo'
import { PageHeader } from '@/components/layout/PageHeader'
import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { CtaBand } from '@/components/CtaBand'
import { researchReports } from '@/data/research'
import { formatCount, formatPercent } from '@/lib/percent'

/**
 * 調査レポート一覧（/research）。Events 一覧と同じく、カードから詳細へ進む索引。
 * 調査を追加するときは data/research.ts に 1 件足すだけでよい。
 */
export function ResearchPage() {
  return (
    <>
      <Seo
        title="Research"
        path="/research"
        description="KitaKita Labが行った調査のレポート。北海道在住の20〜50代1,023名に、商業施設でのワークショップ・体験イベントへの参加意向や参加しやすい条件を尋ねた結果を公開しています。"
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
        description="現場で感じてきたことを、感覚だけで終わらせないために。商業施設でのワークショップを重ねるなかで生まれた問いを、調査で確かめています。"
      />

      <Section tone="paper" spacing="lg">
        <div className="space-y-6">
          {researchReports.map((report, i) => (
            <Reveal key={report.slug} delay={(i % 3) * 70}>
              <Link
                to={`/research/${report.slug}`}
                className="group block rounded-xl2 border border-line bg-paper-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift sm:p-8"
              >
                <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:gap-12">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge tone="clay">{report.tag}</Badge>
                      <span className="text-sm text-ink-soft">
                        <time dateTime={report.announced.iso}>{report.announced.label}</time> 発表
                      </span>
                    </div>
                    {/* titleSegments があれば文節ごとに nowrap にし、語中で折れないようにする
                        （h2 の text-wrap: balance 対策。EventsPage のカードタイトルと同じ手法）。 */}
                    <h2 className="mt-3 text-xl leading-snug text-ink transition-colors sm:text-2xl [@media(hover:hover)]:group-hover:text-clay-600">
                      {report.titleSegments
                        ? report.titleSegments.map((seg, j) => (
                            <span key={j} className="whitespace-nowrap">
                              {seg}
                            </span>
                          ))
                        : report.title}
                    </h2>
                    <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
                      {typeset(report.summary)}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
                      {report.facts.map((fact) => (
                        <li key={fact}>{fact}</li>
                      ))}
                    </ul>
                  </div>

                  {/* 要点の数字（詳細ページの「要点」と同じ値） */}
                  <ul className="space-y-3 border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                    {report.keyFindings.map((k) => (
                      <li key={k.label} className="flex items-baseline justify-between gap-4">
                        <span className="text-sm leading-snug text-ink-muted">{typeset(k.label)}</span>
                        <span className="shrink-0 text-right">
                          <span className="block font-serif text-2xl text-clay-600">
                            {formatPercent(k.count, k.n)}
                          </span>
                          <span className="block text-[11px] tabular-nums text-ink-soft">
                            {formatCount(k.count)}/{formatCount(k.n)}名
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-clay-600">
                  レポートを見る
                  <Icon name="arrow" size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <CtaBand
        // 共同調査の受託や調査サービスは提供していないので CTA にしない。
        // Research から先は、通常の企画・連携の相談へつなぐ。
        // 意味の単位で折る（「ご／相談」「ご相／談」と割れないように）
        title={<Segments segments={['イベントや企画の', 'ご相談は、', 'こちらから。']} />}
        description="商業施設や企業イベントでのワークショップ・体験企画のご相談をお受けしています。調査の結果も、企画を考える材料にしています。"
        primary={{ label: 'お問い合わせ', to: '/contact' }}
        secondary={{ label: '連携について見る', to: '/collaboration' }}
      />
    </>
  )
}
