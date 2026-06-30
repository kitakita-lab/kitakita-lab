import type { ReactNode } from 'react'
import { Reveal } from '@/components/ui/Reveal'

type PageHeaderProps = {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
}

/** Hero band shown at the top of subpages. */
export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden border-b border-line bg-paper-200">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-clay-100/60 blur-3xl"
        aria-hidden="true"
      />
      <div className="container-content relative py-16 sm:py-20 lg:py-24">
        <Reveal className="max-w-prose">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="mt-4 text-4xl leading-[1.15] sm:text-5xl lg:text-[3.25rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-6 text-base leading-relaxed text-ink-muted sm:text-lg">
              {description}
            </p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </Reveal>
      </div>
    </header>
  )
}
