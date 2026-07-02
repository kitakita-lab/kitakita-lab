/**
 * Site-wide configuration and constants.
 * Centralising these makes it easy to update branding, contact info,
 * and navigation without touching component code.
 */

export const site = {
  name: 'KitaKita Lab',
  nameJa: 'キタキタラボ',
  tagline: '少し進めてみる。',
  /** ブランドフィロソフィー（docs/BRAND.md 参照）。要所でのみ掲げる。 */
  philosophy: '少し進めてみる。',
  description:
    'KitaKita Lab（キタキタラボ）は、北海道の「少し進めてみる」ための場所です。ワークショップ、AIやシステムづくり、地域や企業との企画——大きな約束はしません。少し前へ、少し良く、少し豊かになる時間と出会いを届けます。',
  url: 'https://kitakita-lab.com',
  ogImage: '/ogp.svg',
  email: 'hello@kitakita-lab.jp',
  locale: 'ja_JP',
} as const

/** Primary navigation shown in the header and footer. */
export const navItems = [
  { label: 'KitaKita Labとは', href: '/#about' },
  { label: 'Activities', href: '/#activities' },
  { label: 'Workshop', href: '/workshop' },
  { label: 'Research', href: '/research' },
  { label: 'Collaboration', href: '/collaboration' },
  { label: 'Creators', href: '/creators' },
  { label: 'News', href: '/news' },
  { label: 'FAQ', href: '/faq' },
] as const

/** Footer link groups. */
export const footerGroups = [
  {
    title: 'About',
    links: [
      { label: 'KitaKita Labとは', href: '/#about' },
      { label: 'Mission', href: '/#mission' },
      { label: 'Vision', href: '/#vision' },
      { label: 'Activities', href: '/#activities' },
    ],
  },
  {
    title: 'Programs',
    links: [
      { label: 'Workshop', href: '/workshop' },
      { label: 'Research', href: '/research' },
      { label: 'Collaboration', href: '/collaboration' },
      { label: 'Creators', href: '/creators' },
    ],
  },
  {
    title: 'Information',
    links: [
      { label: 'News', href: '/news' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Contact', href: '/contact' },
    ],
  },
] as const
