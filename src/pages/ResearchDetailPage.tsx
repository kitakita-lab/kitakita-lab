import { useParams, Navigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Seo } from '@/components/Seo'
import { site } from '@/data/site'
import { researchReports } from '@/data/research'
import { events } from '@/data/events'
import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { Segments } from '@/components/ui/Segments'
import { CtaBand } from '@/components/CtaBand'
import { ResearchFigure } from '@/components/research/ResearchFigure'
import { formatCount, formatPercent } from '@/lib/percent'
import { typeset } from '@/lib/typo'

/**
 * 調査レポート詳細（/research/:slug）。
 *
 * 読む人は主に、商業施設や企業でワークショップ・体験イベントを検討している担当者。
 * 冒頭の「要点」3 つで価値がわかり、必要なら各章の図と数字まで降りられる順に置く。
 * 構成: ヘッダー → 調査の背景 → 要点 → 章（データの priority 順ではなく、
 * 「誰が参加したいか → どうすれば参加しやすいか → 参加していない理由 →
 * 施設にとっての意味 → 補足」の読む順）→ 読み方と調査概要 → 現場の実績 → CTA。
 *
 * 数字はすべて research.ts の人数から計算する（割合を手で書かない）。
 */
export function ResearchDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const report = researchReports.find((r) => r.slug === slug)

  if (!report) {
    return <Navigate to="/research" replace />
  }

  const pageUrl = `${site.url}/research/${report.slug}`
  // 調査共通の読み方のあとに、このレポート固有の読み方を続ける
  const readingNotes = [...report.survey.readingNotes, ...(report.readingNotes ?? [])]
  // 同じ調査の関連レポート（テーマ別 → 総合 など）
  const relatedReports = (report.relatedReportSlugs ?? [])
    .map((s) => researchReports.find((r) => r.slug === s))
    .filter((r): r is (typeof researchReports)[number] => Boolean(r))
  const related = report.relatedEventSlugs
    .map((s) => events.find((e) => e.slug === s))
    .filter((e): e is (typeof events)[number] => Boolean(e))

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: report.title,
    description: report.description,
    mainEntityOfPage: pageUrl,
    image: `${site.url}${report.ogImage ?? site.ogImage}`,
    datePublished: report.sitePublished,
    author: { '@type': 'Organization', name: site.name, url: site.url },
    publisher: {
      '@type': 'Organization',
      name: site.name,
      logo: { '@type': 'ImageObject', url: `${site.url}/icon-512.png` },
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: `${site.url}/` },
      { '@type': 'ListItem', position: 2, name: 'Research', item: `${site.url}/research` },
      { '@type': 'ListItem', position: 3, name: report.title, item: pageUrl },
    ],
  }

  return (
    <>
      <Seo
        title={report.seoTitle ?? report.title}
        path={`/research/${report.slug}`}
        description={report.description}
        image={report.ogImage}
        type="article"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <article>
        {/* ── ヘッダー ─────────────────────────── */}
        <header className="border-b border-line bg-paper-200">
          <div className="container-content py-14 sm:py-20">
            <Reveal className="max-w-3xl">
              <Link
                to="/research"
                className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-clay-600"
              >
                <Icon name="arrow" size={16} className="rotate-180" />
                Research 一覧へ
              </Link>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Badge tone="clay">{report.tag}</Badge>
                <span className="text-sm text-ink-soft">
                  <time dateTime={report.announced.iso}>{report.announced.label}</time> 公開
                </span>
              </div>
              <h1 className="mt-4 text-[1.6rem] leading-snug sm:text-4xl sm:leading-tight lg:text-[2.75rem]">
                {report.titleSegments ? <Segments segments={report.titleSegments} /> : report.title}
              </h1>
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-sm leading-relaxed text-ink-muted">
                {report.survey.facts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            </Reveal>
          </div>
        </header>

        {/* ── 背景と要点 ───────────────────────── */}
        <Section tone="paper" spacing="lg">
          <Reveal className="max-w-prose space-y-5 text-[16px] leading-loose text-ink/85">
            {report.intro.map((para, i) => (
              <p key={i}>{typeset(para)}</p>
            ))}
          </Reveal>

          <Reveal className="mt-16">
            <span className="eyebrow">Key findings</span>
            <h2 className="mt-3 text-2xl sm:text-3xl">要点</h2>
          </Reveal>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {report.keyFindings.map((k, i) => (
              <Reveal key={k.label} delay={i * 80}>
                <div className="flex h-full flex-col rounded-xl2 border border-line bg-paper-50 p-6 sm:p-7">
                  <p className="text-sm leading-relaxed text-ink">{typeset(k.label)}</p>
                  <p className="mt-4 font-serif text-4xl text-clay-600 sm:text-[2.75rem]">
                    {formatPercent(k.count, k.n)}
                  </p>
                  <p className="mt-1 text-xs tabular-nums text-ink-soft">
                    {formatCount(k.count)}/{formatCount(k.n)}名
                  </p>
                  {k.compare && (
                    <dl className="mt-5 space-y-1.5 border-t border-line pt-4 text-sm">
                      {k.compare.map((c) => (
                        <div key={c.label} className="flex items-baseline justify-between gap-3">
                          <dt className="text-ink-muted">{c.label}</dt>
                          <dd className="shrink-0 tabular-nums text-ink">
                            <span className="font-medium">{formatPercent(c.count, c.n)}</span>
                            <span className="ml-1.5 text-xs text-ink-soft">
                              {formatCount(c.count)}/{formatCount(c.n)}名
                            </span>
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  <p className="mt-auto pt-5 text-xs leading-relaxed text-ink-soft">{typeset(k.note)}</p>
                </div>
              </Reveal>
            ))}
          </div>
          {/* このレポートの内容（章へのページ内リンク） */}
          <Reveal className="mt-12">
            <nav aria-label="このレポートの内容" className="rounded-xl2 border border-line bg-paper-50 p-6 sm:p-7">
              <p className="text-sm font-medium text-ink">このレポートの内容</p>
              <ol className="mt-4 grid gap-x-8 gap-y-2.5 text-sm sm:grid-cols-2">
                {report.sections.map((s, i) => (
                  <li key={s.id} className="flex gap-3">
                    <span className="w-5 shrink-0 tabular-nums text-ink-soft">{i + 1}</span>
                    <a
                      href={`#${s.id}`}
                      className="text-ink-muted underline decoration-line underline-offset-4 transition-colors hover:text-clay-600 hover:decoration-clay-300"
                    >
                      {s.heading}
                    </a>
                  </li>
                ))}
                <li className="flex gap-3">
                  <span className="w-5 shrink-0" aria-hidden="true" />
                  <a
                    href="#notes"
                    className="text-ink-muted underline decoration-line underline-offset-4 transition-colors hover:text-clay-600 hover:decoration-clay-300"
                  >
                    この調査の読み方・調査概要
                  </a>
                </li>
              </ol>
            </nav>
          </Reveal>
        </Section>

        {/* ── 章 ─────────────────────────────── */}
        {report.sections.map((section, i) => (
          <Section
            key={section.id}
            id={section.id}
            tone={i % 2 === 0 ? 'tint' : 'paper'}
            spacing="md"
          >
            <Reveal className="max-w-prose">
              <span className="eyebrow">{section.eyebrow}</span>
              <h2 className="mt-3 text-2xl leading-snug sm:text-3xl">
                {section.headingSegments ? (
                  <Segments segments={section.headingSegments} />
                ) : (
                  section.heading
                )}
              </h2>
              <div className="mt-5 space-y-4 text-[16px] leading-loose text-ink/85">
                {section.lead.map((para, j) => (
                  <p key={j}>{typeset(para)}</p>
                ))}
              </div>
            </Reveal>

            {/* 図のない章（考察など）では、図の余白を置かない */}
            {section.figures.length > 0 && (
              <div
                className={
                  section.figures.length > 1
                    ? 'mt-10 grid gap-6 lg:grid-cols-2 lg:items-start'
                    : 'mt-10 max-w-3xl'
                }
              >
                {section.figures.map((figure, j) => (
                  <Reveal key={j} delay={j * 80}>
                    <ResearchFigure figure={figure} />
                  </Reveal>
                ))}
              </div>
            )}

            {section.reading && (
              <Reveal className="mt-8 max-w-prose">
                <div className="border-l-2 border-clay-300 pl-4">
                  <p className="text-xs font-medium text-clay-600">読み方</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{typeset(section.reading)}</p>
                </div>
              </Reveal>
            )}

            {/* 同じテーマを深掘りしたレポートなどへの文字リンク */}
            {section.link && (
              <Reveal className="mt-6 max-w-prose">
                <Link
                  to={section.link.href}
                  className="inline-flex items-center gap-1 text-sm text-ink underline decoration-clay-300 underline-offset-4 transition-colors hover:text-clay-600"
                >
                  {typeset(section.link.label)}
                  <Icon name="arrow" size={13} />
                </Link>
              </Reveal>
            )}
          </Section>
        ))}

        {/* ── 読み方と調査概要 ──────────────────── */}
        <Section id="notes" tone={report.sections.length % 2 === 0 ? 'tint' : 'paper'} spacing="md">
          <div className="grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
            <Reveal>
              <span className="eyebrow">Notes</span>
              <h2 className="mt-3 text-2xl sm:text-3xl">この調査の読み方</h2>
              <ul className="mt-6 space-y-3">
                {readingNotes.map((note) => (
                  <li key={note} className="flex gap-3 text-sm leading-relaxed text-ink-muted">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-clay-400" aria-hidden="true" />
                    <span>{typeset(note)}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={100}>
              <div className="rounded-xl2 border border-line bg-paper-50 p-6 sm:p-7">
                <span className="eyebrow">Overview</span>
                <h2 className="mt-2 text-xl">調査概要</h2>
                <dl className="mt-5 space-y-4">
                  {report.survey.overview.map((row) => (
                    <div key={row.label}>
                      <dt className="text-xs font-medium text-ink-soft">{row.label}</dt>
                      <dd className="mt-1 text-sm leading-relaxed text-ink">{typeset(row.value)}</dd>
                    </div>
                  ))}
                  <div>
                    <dt className="text-xs font-medium text-ink-soft">回答者の内訳</dt>
                    <dd className="mt-1 space-y-0.5 text-sm leading-relaxed text-ink">
                      {report.survey.sample.map((s) => (
                        <span key={s} className="block">
                          {s}
                        </span>
                      ))}
                    </dd>
                  </div>
                </dl>
              </div>
            </Reveal>
          </div>
        </Section>

        {/* ── 同じ調査の関連レポート ─────────────── */}
        {relatedReports.length > 0 && (
          <Section tone={report.sections.length % 2 === 0 ? 'paper' : 'tint'} spacing="md">
            <Reveal className="max-w-prose">
              <span className="eyebrow">Related</span>
              <h2 className="mt-3 text-2xl sm:text-3xl">この調査のレポート</h2>
            </Reveal>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {relatedReports.map((r, i) => (
                <Reveal key={r.slug} delay={i * 80}>
                  <Link
                    to={`/research/${r.slug}`}
                    className="group flex h-full flex-col rounded-xl2 border border-line bg-paper-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                  >
                    <span className="text-xs text-ink-soft">
                      {r.scope === 'overview' ? '総合レポート' : 'テーマ別レポート'}
                    </span>
                    <span className="mt-2 text-lg leading-snug text-ink transition-colors [@media(hover:hover)]:group-hover:text-clay-600">
                      {r.titleSegments ? <Segments segments={r.titleSegments} /> : r.title}
                    </span>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-clay-600">
                      レポートを見る
                      <Icon name="arrow" size={16} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Section>
        )}

        {/* ── 現場の実績 ─────────────────────── */}
        {related.length > 0 && (
          <Section
            tone={(report.sections.length + (relatedReports.length > 0 ? 1 : 0)) % 2 === 0 ? 'paper' : 'tint'}
            spacing="md"
          >
            <Reveal className="max-w-prose">
              <span className="eyebrow">On site</span>
              <h2 className="mt-3 text-2xl sm:text-3xl">現場では</h2>
              <p className="mt-5 text-[16px] leading-loose text-ink/85">
                {typeset('この調査のきっかけになった、商業施設でのワークショップの記録です。')}
              </p>
            </Reveal>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {related.map((event, i) => (
                <Reveal key={event.slug} delay={i * 80}>
                  <Link
                    to={`/events/${event.slug}`}
                    className="group flex h-full flex-col rounded-xl2 border border-line bg-paper-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                  >
                    <span className="text-xs text-ink-soft">{event.dateLabel}</span>
                    <span className="mt-2 text-lg leading-snug text-ink transition-colors [@media(hover:hover)]:group-hover:text-clay-600">
                      {event.titleLines
                        ? event.titleLines.map((line) => (
                            <span key={line} className="block">
                              {line}
                            </span>
                          ))
                        : event.title}
                    </span>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-clay-600">
                      レポートを見る
                      <Icon name="arrow" size={16} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Section>
        )}

        <CtaBand
          title={<Segments segments={['調査をふまえた', '企画のご相談も、', 'お受けしています。']} />}
          description="商業施設や企業イベントでの体験企画を、この調査の結果もふまえて一緒に考えます。"
          primary={{ label: 'お問い合わせ', to: '/contact' }}
          // 開催の条件・お見積もりの際に伺うこと（依頼条件カード）へ
          secondary={{ label: '開催のご相談について', to: '/workshop#consultation' }}
        />
      </article>
    </>
  )
}
