/**
 * Site-wide configuration and constants.
 * Centralising these makes it easy to update branding, contact info,
 * and navigation without touching component code.
 */

export const site = {
  name: 'KitaKita Lab',
  nameJa: 'キタキタラボ',
  tagline: 'ちょっと進めてみる',
  /** ブランドフィロソフィー（docs/BRAND.md 参照）。要所でのみ掲げる。 */
  philosophy: 'ちょっと進めてみる',
  description:
    'KitaKita Lab（キタキタラボ）は、札幌を拠点に、商業施設や企業イベントでのワークショップや体験企画を、企業・施設、作家やつくり手と一緒に企画・運営しています。北海道の「ちょっと進めてみる」ための場所です。',
  url: 'https://www.kitakita-lab.com',
  // og:image は PNG 必須（SVG は SNS 各社が描画しない）。scripts/generate-og.mjs で再生成。
  ogImage: '/ogp.png',
  // 問い合わせ先メールアドレス。Footer / Contact ページのメール表示と、
  // Contact フォームの送信先（mailto）に使われる。
  email: 'hello@kitakita-lab.com',
  locale: 'ja_JP',
} as const

/** Primary navigation shown in the header and footer. */
export const navItems = [
  { label: 'KitaKita Labとは', href: '/#about' },
  { label: 'Activities', href: '/#activities' },
  { label: 'Workshop', href: '/workshop' },
  { label: 'Events', href: '/events' },
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
      { label: 'Events', href: '/events' },
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
