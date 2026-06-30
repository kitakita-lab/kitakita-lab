import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none'

const variants: Record<Variant, string> = {
  primary:
    'bg-ink text-paper hover:bg-clay-600 shadow-soft hover:shadow-lift',
  secondary:
    'bg-transparent text-ink border border-line hover:border-ink/40 hover:bg-paper-200',
  ghost: 'bg-transparent text-ink hover:text-clay-600',
}

const sizes: Record<Size, string> = {
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

type CommonProps = {
  children: ReactNode
  variant?: Variant
  size?: Size
  className?: string
}

type ButtonAsLink = CommonProps & {
  /** Internal route path. */
  to: string
  href?: never
}

type ButtonAsAnchor = CommonProps & {
  /** External URL or anchor. */
  href: string
  to?: never
}

type ButtonAsButton = CommonProps & {
  to?: never
  href?: never
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
}

type ButtonProps = ButtonAsLink | ButtonAsAnchor | ButtonAsButton

export function Button(props: ButtonProps) {
  const { children, variant = 'primary', size = 'md', className } = props
  const classes = cn(base, variants[variant], sizes[size], className)

  if ('to' in props && props.to) {
    return (
      <Link to={props.to} className={classes}>
        {children}
      </Link>
    )
  }

  if ('href' in props && props.href) {
    const external = props.href.startsWith('http')
    return (
      <a
        href={props.href}
        className={classes}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    )
  }

  const { type = 'button', onClick } = props as ButtonAsButton
  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  )
}
