import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type CardProps = {
  children: ReactNode
  className?: string
  /** Adds hover lift — use for interactive cards. */
  interactive?: boolean
}

/** Surface container with soft border and rounded corners. */
export function Card({ children, className, interactive = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl2 border border-line bg-paper-50 p-6 sm:p-7',
        interactive &&
          'transition-all duration-300 hover:-translate-y-1 hover:border-clay-200 hover:shadow-lift',
        className,
      )}
    >
      {children}
    </div>
  )
}
