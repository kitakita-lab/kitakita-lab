import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type SectionProps = {
  children: ReactNode
  id?: string
  className?: string
  /** Tone of the section background. */
  tone?: 'paper' | 'tint' | 'ink'
  /**
   * Vertical padding scale.
   * - md / lg: 単独のセクション用（下層ページ）
   * - chapter: 大きな章の頭。上を大きく空けて呼吸を入れ、下は章の中へ続く分だけ
   * - node: 章の中の節。前後を詰めて、一続きの話として読ませる
   */
  spacing?: 'md' | 'lg' | 'chapter' | 'node'
}

// 面の色は「オフホワイト（paper）」と「ごく薄いブルーグレー（tint）」の2つで組む。
// 区切りは色ではなく余白とタイポグラフィで付けるのが基本。
// ink（暗い面）は大面積では使わない方針だが、型としては残している。
const tones: Record<NonNullable<SectionProps['tone']>, string> = {
  paper: 'bg-paper text-ink',
  tint: 'bg-paper-200 text-ink',
  ink: 'bg-ink text-paper',
}

const spacings: Record<NonNullable<SectionProps['spacing']>, string> = {
  md: 'py-16 sm:py-20',
  lg: 'py-20 sm:py-28 lg:py-32',
  chapter: 'pt-40 pb-16 sm:pt-48 sm:pb-24 lg:pt-52 lg:pb-28',
  node: 'py-10 sm:py-14 lg:py-16',
}

/** A full-width section band with an inner content container. */
export function Section({
  children,
  id,
  className,
  tone = 'paper',
  spacing = 'lg',
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(tones[tone], spacings[spacing], 'scroll-mt-20', className)}
    >
      <div className="container-content">{children}</div>
    </section>
  )
}
