import type { ReactNode } from 'react'
import type { ResearchFigure as Figure } from '@/data/research'
import { formatCount, formatPercent, percent } from '@/lib/percent'
import { typeset } from '@/lib/typo'
import { cn } from '@/lib/cn'
import { Segments } from '@/components/ui/Segments'

/**
 * 調査レポートの図。画像ではなく HTML で描く（数値と設問文がテキストとして
 * 読めるように。検索エンジンとスクリーンリーダーにも同じ内容が届く）。
 *
 * 配色はサイトのトークンだけを使う:
 *   前向きな回答 … clay-700（強い）／ clay-400（弱い）
 *   否定的な回答 … clay-100（弱い）／ ink/20（強い）
 * 割合は帯の中に書かず、各行の右または下にテキストで置く
 * （375px 幅で細い区分の文字が潰れないように、また色だけに頼らないように）。
 *
 * スマホでの読みやすさ（375〜430px で確認）:
 * - 項目名は 1 行を占有させ、数字は帯の右の固定幅の列に置く（項目名が数字に
 *   押されて語中で折れないように。固定幅なので帯の長さどうしは比較できる）
 * - 主たる数値（割合）は 13〜14px、補助の人数は 12px
 * - 色見本には薄い輪郭を付ける（淡い区分が地色に溶けないように）
 */

const SEGMENT_COLORS = ['bg-clay-700', 'bg-clay-400', 'bg-clay-100', 'bg-ink/20']
const COMPARE_COLORS = ['bg-clay-700', 'bg-clay-300']
const SWATCH = 'shrink-0 rounded-sm ring-1 ring-inset ring-ink/15'

/**
 * 1 行分の配置。
 *   スマホ（640px 未満）: 項目名を 1 行に置き、その下に「帯｜数字」
 *   640px 以上        : 「項目名｜数字」の下に帯（PC の見え方は従来どおり）
 */
const ROW_GRID =
  'grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 ' +
  "[grid-template-areas:'label_label'_'bar_value'] " +
  "sm:items-baseline sm:[grid-template-areas:'label_value'_'bar_bar']"

/** 見出し末尾の（複数回答・上位7項目）などを、補足の行として分ける */
function splitTitle(title: string): { main: string; sub?: string } {
  const m = title.match(/^(.*?)（([^（）]+)）$/)
  return m ? { main: m[1], sub: m[2] } : { main: title }
}

/** 文節の分割があれば、その境目でだけ折る */
function Label({ text, segments }: { text: string; segments?: string[] }) {
  return segments ? <Segments segments={segments} /> : <>{typeset(text)}</>
}

function FigureFrame({
  title,
  titleSegments,
  note,
  children,
}: {
  title: string
  titleSegments?: string[]
  note: string
  children: ReactNode
}) {
  const { main, sub } = splitTitle(title)
  return (
    <figure className="rounded-xl2 border border-line bg-paper-50 p-5 sm:p-7">
      <h3 className="text-base font-medium leading-relaxed text-ink sm:text-lg">
        <Label text={main} segments={titleSegments} />
        {sub && <span className="mt-0.5 block text-sm font-normal text-ink-soft">{sub}</span>}
      </h3>
      <div className="mt-6">{children}</div>
      <figcaption className="mt-5 text-[13px] leading-relaxed text-ink-soft">{typeset(note)}</figcaption>
    </figure>
  )
}

/** 帯の右に置く数字の列（固定幅。行ごとに幅が変わると帯の長さを比べられないため） */
function Value({ count, n }: { count: number; n: number }) {
  return (
    <span className="w-[7.5rem] shrink-0 text-right tabular-nums [grid-area:value] sm:w-auto">
      <span className="text-sm font-medium text-ink">{formatPercent(count, n)}</span>
      <span className="ml-1.5 text-xs text-ink-soft">
        {formatCount(count)}/{formatCount(n)}名
      </span>
    </span>
  )
}

function Bars({ figure }: { figure: Extract<Figure, { kind: 'bars' }> }) {
  // 帯の長さは図の中の最大値を 100% として描く（割合の大小が見やすいように）。
  // 数字は常に実際の割合を書く。
  const max = Math.max(...figure.items.map((i) => percent(i.count, i.n)))
  return (
    <ul className="space-y-4">
      {figure.items.map((item) => {
        const p = percent(item.count, item.n)
        return (
          <li key={item.label} className={ROW_GRID}>
            <p className="text-sm leading-snug text-ink [grid-area:label]">{typeset(item.label)}</p>
            <div className="h-2.5 rounded-full bg-paper-200 [grid-area:bar]" aria-hidden="true">
              <div
                className="h-full rounded-full bg-clay-600"
                style={{ width: `${max > 0 ? (p / max) * 100 : 0}%` }}
              />
            </div>
            <Value count={item.count} n={item.n} />
          </li>
        )
      })}
    </ul>
  )
}

function Stacked({ figure }: { figure: Extract<Figure, { kind: 'stacked' }> }) {
  return (
    <div>
      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-ink-muted" aria-label="凡例">
        {figure.legend.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span className={cn('h-3 w-3', SWATCH, SEGMENT_COLORS[i])} aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>
      <div className="mt-6 space-y-6">
        {figure.rows.map((row) => {
          const positiveCount = row.counts.slice(0, figure.positive.segments).reduce((a, b) => a + b, 0)
          return (
            <div key={row.label}>
              <div className={ROW_GRID}>
              <p className="text-sm leading-snug text-ink [grid-area:label]">
                <Label text={row.label} segments={row.labelSegments} />{' '}
                {/* 余白ではなく空白で区切る（行頭に回ったときに字下げにならないように） */}
                <span className="whitespace-nowrap text-xs text-ink-soft">n={formatCount(row.n)}</span>
              </p>
                <div className="flex h-4 overflow-hidden rounded-full [grid-area:bar] sm:mt-0.5" aria-hidden="true">
                  {row.counts.map((c, i) => (
                    <div
                      key={i}
                      className={SEGMENT_COLORS[i]}
                      style={{ width: `${(c / row.n) * 100}%` }}
                    />
                  ))}
                </div>
                <span className="w-[6.5rem] shrink-0 text-right tabular-nums [grid-area:value] sm:w-auto">
                  <span className="text-xs text-ink-soft">{figure.positive.label}</span>
                  <span className="ml-1.5 text-sm font-medium text-ink">
                    {formatPercent(positiveCount, row.n)}
                  </span>
                </span>
              </div>
              {/* 区分ごとの数字（色に頼らず読めるように、凡例と同じ順で並べる） */}
              <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] tabular-nums text-ink-muted">
                {row.counts.map((c, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className={cn('h-2.5 w-2.5', SWATCH, SEGMENT_COLORS[i])} aria-hidden="true" />
                    <dt className="sr-only">{figure.legend[i]}</dt>
                    <dd>
                      {formatPercent(c, row.n)}
                      <span className="sr-only">（{formatCount(c)}名）</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Compare({ figure }: { figure: Extract<Figure, { kind: 'compare' }> }) {
  const max = Math.max(
    ...figure.items.flatMap((item) => item.counts.map((c, g) => percent(c, figure.groups[g].n))),
  )
  return (
    <div>
      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-ink-muted" aria-label="凡例">
        {figure.groups.map((g, i) => (
          <li key={g.label} className="flex items-center gap-2">
            <span className={cn('h-3 w-3', SWATCH, COMPARE_COLORS[i])} aria-hidden="true" />
            {g.label}（n={formatCount(g.n)}）
          </li>
        ))}
      </ul>
      <ul className="mt-6 space-y-5">
        {figure.items.map((item) => (
          <li key={item.label}>
            <p className="text-sm text-ink">{typeset(item.label)}</p>
            <div className="mt-1.5 space-y-1.5">
              {item.counts.map((c, g) => {
                const p = percent(c, figure.groups[g].n)
                return (
                  <div key={g} className="flex items-center gap-3">
                    <div className="h-2.5 flex-1 rounded-full bg-paper-200" aria-hidden="true">
                      <div
                        className={cn('h-full rounded-full', COMPARE_COLORS[g])}
                        style={{ width: `${max > 0 ? (p / max) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="sr-only">{figure.groups[g].label}：</span>
                    <Value count={c} n={figure.groups[g].n} />
                  </div>
                )
              })}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ResearchFigure({ figure }: { figure: Figure }) {
  return (
    <FigureFrame title={figure.title} titleSegments={figure.titleSegments} note={figure.note}>
      {figure.kind === 'bars' && <Bars figure={figure} />}
      {figure.kind === 'stacked' && <Stacked figure={figure} />}
      {figure.kind === 'compare' && <Compare figure={figure} />}
    </FigureFrame>
  )
}
