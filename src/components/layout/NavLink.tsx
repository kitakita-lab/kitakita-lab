import { useCallbackRef } from '@/hooks/useCallbackRef'
import { useNavigate, useLocation } from 'react-router-dom'
import type { MouseEvent, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type NavLinkProps = {
  href: string
  children: ReactNode
  className?: string
  onNavigate?: () => void
}

/**
 * Navigation link that understands both plain routes ("/workshop") and
 * in-page hash targets ("/#about"). For hash targets it smooth-scrolls to
 * the element, navigating home first when on another page.
 */
export function NavLink({ href, children, className, onNavigate }: NavLinkProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const handleNavigate = useCallbackRef(onNavigate)

  const [path, hash] = href.split('#')
  const isHashLink = href.includes('#')

  const scrollToHash = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!isHashLink) {
      // Let plain routes use default Link behaviour below.
      return
    }
    e.preventDefault()
    const targetPath = path || '/'
    if (location.pathname === targetPath) {
      scrollToHash(hash)
    } else {
      navigate(targetPath)
      // Wait for the destination to render before scrolling.
      window.setTimeout(() => scrollToHash(hash), 80)
    }
    handleNavigate()
  }

  if (isHashLink) {
    return (
      <a href={href} onClick={handleClick} className={className}>
        {children}
      </a>
    )
  }

  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault()
        navigate(href)
        handleNavigate()
      }}
      className={cn(className)}
    >
      {children}
    </a>
  )
}
