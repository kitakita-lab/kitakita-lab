import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Reveal } from './Reveal'
import { typeset } from '@/lib/typo'

type SectionHeadingProps = {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
  className?: string
  /** Render the title in a lighter colour for dark sections. */
  invert?: boolean
  /**
   * lg: 章の頭の見出し（既定）。md: 章の中の節の見出し。
   * 同じ強さに見えないよう、節は一段小さくする。
   */
  size?: 'lg' | 'md'
}

const titleSizes: Record<NonNullable<SectionHeadingProps['size']>, string> = {
  lg: 'text-3xl sm:text-4xl lg:text-[2.75rem]',
  md: 'text-2xl sm:text-3xl',
}

/** Consistent eyebrow + title + lede block used at the top of sections. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
  invert = false,
  size = 'lg',
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
          'mt-3 leading-tight',
          titleSizes[size],
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
          {typeof description === 'string' ? typeset(description) : description}
        </p>
      )}
    </Reveal>
  )
}
