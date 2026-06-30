import type { ElementType, ReactNode } from 'react'
import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/lib/cn'

type RevealProps = {
  children: ReactNode
  className?: string
  /** Stagger delay in milliseconds. */
  delay?: number
  as?: ElementType
}

/**
 * Wraps children with a subtle scroll-triggered fade-up.
 * Motion is disabled automatically under `prefers-reduced-motion`.
 */
export function Reveal({ children, className, delay = 0, as: Tag = 'div' }: RevealProps) {
  const { ref, isVisible } = useReveal<HTMLDivElement>()

  return (
    <Tag
      ref={ref}
      className={cn('reveal', isVisible && 'is-visible', className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
