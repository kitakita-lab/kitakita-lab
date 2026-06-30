import { Helmet } from 'react-helmet-async'
import { site } from '@/data/site'

type SeoProps = {
  /** Page-specific title; rendered as "Title｜KitaKita Lab". */
  title?: string
  description?: string
  /** Path beginning with "/" used to build the canonical/OG url. */
  path?: string
  image?: string
  type?: 'website' | 'article'
  /** Set true on pages that should not be indexed (e.g. 404). */
  noindex?: boolean
}

/**
 * Per-page SEO + OGP meta. Centralises canonical URL, Open Graph and
 * Twitter card tags so each page only declares what differs.
 */
export function Seo({
  title,
  description = site.description,
  path = '/',
  image = site.ogImage,
  type = 'website',
  noindex = false,
}: SeoProps) {
  const fullTitle = title ? `${title}｜${site.name}` : `${site.name}｜${site.tagline}`
  const url = `${site.url}${path}`
  const imageUrl = image.startsWith('http') ? image : `${site.url}${image}`

  return (
    <Helmet>
      <html lang="ja" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={site.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:locale" content={site.locale} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  )
}
