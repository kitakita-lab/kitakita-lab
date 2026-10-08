import type { ReactNode } from 'react'
import type { ResearchFigure as Figure } from '@/data/research'
import { formatCount, formatPercent, percent } from '@/lib/percent'
import { typeset } from '@/lib/typo'
import { cn } from '@/lib/cn'

/**
 * 調査レポートの図。画像ではなく HTML で描く（数値と設問文がテキストとして
 * 読めるように。検索エンジンとスクリーンリーダーにも同じ内容が届く）。
 *
 * 配色はサイトのトークンだけを使う:
 *   前向きな回答 … clay-700（強い）／ clay-400（弱い）
 *   否定的な回答 … clay-100（弱い）／ ink/20（強い）
 * 割合は帯の中に書かず、各行の右または下にテキストで置く
 * （375px 幅で細い区分の文字が潰れないように、また色だけに頼らないように）。
 */

const SEGMENT_COLORS = ['bg-clay-700', 'bg-clay-400', 'bg-clay-100', 'bg-ink/20']
const COMPARE_COLORS = ['bg-clay-700', 'bg-clay-300']

function FigureFrame({
  title,
  note,
  children,
}: {
  title: string
  note: string
  children: ReactNode
}) {
  return (
    <figure className="rounded-xl2 border border-line bg-paper-50 p-5 sm:p-7">
      <h3 className="text-base font-medium leading-relaxed text-ink sm:text-lg">{typeset(title)}</h3>
      <div className="mt-6">{children}</div>
      <figcaption className="mt-5 text-xs leading-relaxed text-ink-soft">{typeset(note)}</figcaption>
    </figure>
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
          <li key={item.label}>
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className="text-ink">{typeset(item.label)}</span>
              <span className="shrink-0 tabular-nums text-ink">
                <span className="font-medium">{formatPercent(item.count, item.n)}</span>
                <span className="ml-2 text-xs text-ink-soft">
                  {formatCount(item.count)}/{formatCount(item.n)}名
                </span>
              </span>
            </div>
            <div className="mt-1.5 h-2.5 rounded-full bg-paper-200" aria-hidden="true">
              <div
                className="h-full rounded-full bg-clay-600"
                style={{ width: `${max > 0 ? (p / max) * 100 : 0}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function Stacked({ figure }: { figure: Extract<Figure, { kind: 'stacked' }> }) {
  return (
    <div>
      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-muted" aria-label="凡例">
        {figure.legend.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span className={cn('h-2.5 w-2.5 shrink-0 rounded-sm', SEGMENT_COLORS[i])} aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>
      <div className="mt-6 space-y-6">
        {figure.rows.map((row) => {
          const positiveCount = row.counts.slice(0, figure.positive.segments).reduce((a, b) => a + b, 0)
          return (
            <div key={row.label}>
              <div className="flex items-baseline justify-between gap-4 text-sm">
                <span className="text-ink">
                  {typeset(row.label)}
                  <span className="ml-2 text-xs text-ink-soft">n={formatCount(row.n)}</span>
                </span>
                <span className="shrink-0 tabular-nums text-ink">
                  <span className="text-xs text-ink-soft">{figure.positive.label}</span>
                  <span className="ml-1.5 font-medium">{formatPercent(positiveCount, row.n)}</span>
                </span>
              </div>
              <div className="mt-2 flex h-4 overflow-hidden rounded-full" aria-hidden="true">
                {row.counts.map((c, i) => (
                  <div
                    key={i}
                    className={SEGMENT_COLORS[i]}
                    style={{ width: `${(c / row.n) * 100}%` }}
                  />
                ))}
              </div>
              {/* 区分ごとの数字（色に頼らず読めるように、凡例と同じ順で並べる） */}
              <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs tabular-nums text-ink-muted">
                {row.counts.map((c, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className={cn('h-2 w-2 shrink-0 rounded-sm', SEGMENT_COLORS[i])} aria-hidden="true" />
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
      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-muted" aria-label="凡例">
        {figure.groups.map((g, i) => (
          <li key={g.label} className="flex items-center gap-2">
            <span className={cn('h-2.5 w-2.5 shrink-0 rounded-sm', COMPARE_COLORS[i])} aria-hidden="true" />
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
                    <span className="w-28 shrink-0 text-right text-xs tabular-nums text-ink-muted">
                      <span className="sr-only">{figure.groups[g].label}：</span>
                      <span className="font-medium text-ink">{formatPercent(c, figure.groups[g].n)}</span>
                      <span className="ml-1.5">
                        {formatCount(c)}/{formatCount(figure.groups[g].n)}名
                      </span>
                    </span>
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
    <FigureFrame title={figure.title} note={figure.note}>
      {figure.kind === 'bars' && <Bars figure={figure} />}
      {figure.kind === 'stacked' && <Stacked figure={figure} />}
      {figure.kind === 'compare' && <Compare figure={figure} />}
    </FigureFrame>
  )
}
