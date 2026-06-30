import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { site } from '@/data/site'

type LogoProps = {
  className?: string
  invert?: boolean
}

/** Wordmark logo linking home. */
export function Logo({ className, invert = false }: LogoProps) {
  return (
    <Link
      to="/"
      className={cn('group inline-flex items-center gap-2.5', className)}
      aria-label={`${site.name} ホームへ`}
    >
      <span
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors',
          invert ? 'bg-paper text-ink' : 'bg-ink text-paper group-hover:bg-clay-600',
        )}
        aria-hidden="true"
      >
        K
      </span>
      <span
        className={cn(
          'font-serif text-lg font-semibold tracking-tight',
          invert ? 'text-paper' : 'text-ink',
        )}
      >
        {site.name}
      </span>
    </Link>
  )
}
