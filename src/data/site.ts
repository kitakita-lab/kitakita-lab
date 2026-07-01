/**
 * Site-wide configuration and constants.
 * Centralising these makes it easy to update branding, contact info,
 * and navigation without touching component code.
 */

export const site = {
  name: 'KitaKita Lab',
  nameJa: 'キタキタラボ',
  tagline: 'ハンドメイド作家が、もっと挑戦できる世界をつくる。',
  description:
    'KitaKita Labは、ハンドメイド作家がもっと挑戦できる世界をつくるプロジェクトです。企業コラボ、商業施設イベント、自治体・教育機関との連携、ワークショップ、調査活動を通じて、作家が活躍できる場所を増やします。',
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
