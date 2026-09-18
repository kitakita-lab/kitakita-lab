import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type SectionProps = {
  children: ReactNode
  id?: string
  className?: string
  /** Tone of the section background. */
  tone?: 'paper' | 'tint' | 'sage' | 'ink'
  /** Vertical padding scale. */
  spacing?: 'md' | 'lg'
}

const tones: Record<NonNullable<SectionProps['tone']>, string> = {
  paper: 'bg-paper text-ink',
  tint: 'bg-paper-200 text-ink',
  // 淡いセージ。Hero の草原と地続きの、明るいまま一段だけ色の変わる面。
  // sage-100 (#E2E9E5) だと隣の tint (#EDF0EE) と見分けがつきにくく、
  // sage-300 (#A7BAB0) だと重いため、その中間の値をこの面だけに使う
  // （共通パレットには足さない）。
  sage: 'bg-[#CFDBD4] text-ink',
  ink: 'bg-ink text-paper',
}

const spacings: Record<NonNullable<SectionProps['spacing']>, string> = {
  md: 'py-16 sm:py-20',
  lg: 'py-20 sm:py-28 lg:py-32',
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
