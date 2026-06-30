import { footerGroups, site } from '@/data/site'
import { Logo } from './Logo'
import { NavLink } from './NavLink'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-ink text-paper">
      <div className="container-content py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo invert />
            <p className="mt-5 text-sm leading-relaxed text-paper/65">
              {site.tagline}
            </p>
            <p className="mt-4 text-sm text-paper/65">
              お問い合わせ：
              <a
                href={`mailto:${site.email}`}
                className="underline decoration-paper/30 underline-offset-4 transition-colors hover:text-clay-200"
              >
                {site.email}
              </a>
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="font-sans text-xs font-semibold uppercase tracking-wider2 text-paper/50">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <NavLink
                      href={link.href}
                      className="text-sm text-paper/75 transition-colors hover:text-paper"
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-paper/15 pt-6 text-xs text-paper/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <p className="font-serif tracking-wide text-paper/60">{site.nameJa}</p>
        </div>
      </div>
    </footer>
  )
}
