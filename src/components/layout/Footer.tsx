import { footerGroups, site } from '@/data/site'
import { Logo } from './Logo'
import { NavLink } from './NavLink'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    // 以前は暗い面（bg-ink）で締めていたが、Hero の軽さに対して最後だけ重くなるため、
    // ごく薄いブルーグレー（paper-200）の上に墨色の文字で組む。
    <footer className="bg-paper-200 text-ink">
      <div className="container-content py-16 sm:py-20">
        {/* スマホ・タブレットではリンク3グループを2列に組んで高さを抑える
            （ブランド欄は全幅）。PC は従来どおり4列。 */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-12">
          <div className="col-span-2 max-w-sm lg:col-span-1">
            <Logo />
            <p className="mt-5 text-sm leading-relaxed text-ink-muted">
              {site.tagline}
            </p>
            {/* メールアドレスは正式取得後に site.email へ設定すると表示される */}
            {site.email && (
              <p className="mt-4 text-sm text-ink-muted">
                お問い合わせ：
                <a
                  href={`mailto:${site.email}`}
                  className="break-all underline decoration-clay-300 underline-offset-4 transition-colors hover:text-clay-600"
                >
                  {site.email}
                </a>
              </p>
            )}
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="font-sans text-xs font-semibold uppercase tracking-wider2 text-ink-soft">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <NavLink
                      href={link.href}
                      className="text-sm text-ink-muted transition-colors hover:text-ink"
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          {/* 可視のブランド表記は「KitaKita Lab」に統一。読みの「キタキタラボ」は
              meta description と JSON-LD の alternateName にだけ残す（site.nameJa）。 */}
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
