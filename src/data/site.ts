/**
 * Site-wide configuration and constants.
 * Centralising these makes it easy to update branding, contact info,
 * and navigation without touching component code.
 */

export const site = {
  name: 'KitaKita Lab',
  nameJa: 'キタキタラボ',
  tagline: '北海道から、新しい挑戦を育てる。',
  /** ブランドフィロソフィー（docs/BRAND.md 参照）。要所でのみ掲げる。 */
  philosophy: '挑戦は、待つものではなく、育てるもの。',
  description:
    'KitaKita Lab（キタキタラボ）は、北海道から新しい挑戦を育てるブランドです。ハンドメイド、ワークショップ、地域や企業との企画——人・地域・アイデアにやってきた「きた！」を見過ごさず、試し、育て、かたちにして社会へ届けます。',
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
