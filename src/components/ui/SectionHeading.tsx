import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Reveal } from './Reveal'

type SectionHeadingProps = {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
  className?: string
  /** Render the title in a lighter colour for dark sections. */
  invert?: boolean
}

/** Consistent eyebrow + title + lede block used at the top of sections. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
  invert = false,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        'max-w-prose',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2
        className={cn(
          'mt-3 text-3xl leading-tight sm:text-4xl lg:text-[2.75rem]',
          invert ? 'text-paper' : 'text-ink',
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'mt-5 text-base leading-relaxed sm:text-lg',
            invert ? 'text-paper/70' : 'text-ink-muted',
          )}
        >
          {description}
        </p>
      )}
    </Reveal>
  )
}
