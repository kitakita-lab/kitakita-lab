import { cn } from '@/lib/cn'

type SegmentsProps = {
  /** 意味の単位。各単位の内側では折り返さない。単位の境目でだけ折り返す。 */
  segments: readonly string[]
  /**
   * 360px 未満では nowrap を外す（既定 true）。
   * 見出しサイズの単位は 320px 幅で 1 行に収まらないことがあるため、
   * 極端に狭い画面では自然な折り返しに戻す。
   */
  relaxBelow360?: boolean
  className?: string
}

/** 見出し・コピーを意味の単位で折り返させる。 */
export function Segments({ segments, relaxBelow360 = true, className }: SegmentsProps) {
  return (
    <>
      {segments.map((s, i) => (
        <span
          key={`${i}-${s}`}
          className={cn(relaxBelow360 ? 'min-[360px]:whitespace-nowrap' : 'whitespace-nowrap', className)}
        >
          {s}
        </span>
      ))}
    </>
  )
}
