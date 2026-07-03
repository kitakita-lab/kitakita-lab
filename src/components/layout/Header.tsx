import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { navItems } from '@/data/site'
import { cn } from '@/lib/cn'
import { Logo } from './Logo'
import { NavLink } from './NavLink'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu on route change.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header
      className={cn(
        // backdrop-blur-md is always applied (not toggled with `scrolled`):
        // toggling backdrop-filter on/off on a position:sticky element via a
        // scroll-driven class change is a known trigger for the sticky
        // element's compositing layer to be torn down and rebuilt mid-scroll,
        // which can leave its hit-testing region stale — the header still
        // paints correctly but stops receiving taps until another repaint.
        // Left always-on, it has no visible effect while bg-paper/0 is fully
        // transparent, so this changes nothing visually.
        'sticky top-0 z-50 backdrop-blur-md transition-colors duration-300',
        scrolled
          ? 'border-b border-line bg-paper/85'
          : 'border-b border-transparent bg-paper/0',
      )}
    >
      <div className="container-content flex h-16 items-center justify-between sm:h-18">
        <Logo />

        <nav className="hidden lg:block" aria-label="メインナビゲーション">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <NavLink
                  href={item.href}
                  className="rounded-full px-3.5 py-2 text-sm text-ink-muted transition-colors hover:bg-paper-200 hover:text-ink"
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button to="/contact" size="md">
            お問い合わせ
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-paper-200 lg:hidden"
          aria-label={menuOpen ? 'メニューを閉じる' : 'メニューを開く'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} size={24} />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={cn(
          'lg:hidden',
          menuOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
      >
        <div
          className={cn(
            'fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-line bg-paper transition-all duration-300 sm:top-18',
            menuOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0',
          )}
        >
          <nav className="container-content py-6" aria-label="モバイルナビゲーション">
            <ul className="flex flex-col">
              {navItems.map((item) => (
                <li key={item.href} className="border-b border-line/70">
                  <NavLink
                    href={item.href}
                    onNavigate={() => setMenuOpen(false)}
                    className="flex items-center justify-between py-4 text-lg text-ink"
                  >
                    {item.label}
                    <Icon name="arrow" size={18} className="text-ink-soft" />
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Button to="/contact" size="lg" className="w-full">
                お問い合わせ
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
