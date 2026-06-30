import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type BadgeProps = {
  children: ReactNode
  className?: string
  tone?: 'clay' | 'sage' | 'neutral'
}

const tones: Record<NonNullable<BadgeProps['tone']>, string> = {
  clay: 'bg-clay-50 text-clay-700',
  sage: 'bg-sage-100 text-sage-700',
  neutral: 'bg-paper-200 text-ink-muted',
}

/** Small category / status pill. */
export function Badge({ children, className, tone = 'neutral' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
