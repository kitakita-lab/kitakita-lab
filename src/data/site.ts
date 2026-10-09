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
  // 問い合わせ先メールアドレス。Footer / Contact ページのメール表示と
  // mailto リンク・コピーボタンに使われる。
  email: 'hello@kitakita-lab.com',
  locale: 'ja_JP',
} as const

/**
 * Primary navigation. モバイルメニューは全項目を表示する。
 *
 * PC ヘッダーには desktop: false 以外の項目だけを出す（desktopNavItems）。
 * ロゴ・ナビ・お問い合わせを 1024px（コンテンツ幅 944px）で 1 行に収めるため、
 * PC ヘッダーは企業担当者が使う 6 項目までにする。項目を足すときは、
 * PC ヘッダーに出すものを 6 項目以内に保つこと（Header.test.tsx で確認）。
 * 外した項目はフッターとモバイルメニューから辿れる。
 */
export const navItems = [
  { label: 'KitaKita Labとは', href: '/#about' },
  { label: 'Activities', href: '/#activities', desktop: false },
  { label: 'Workshop', href: '/workshop' },
  { label: 'Events', href: '/events' },
  { label: 'Research', href: '/research' },
  { label: 'Collaboration', href: '/collaboration' },
  { label: 'Creators', href: '/creators', desktop: false },
  { label: 'News', href: '/news', desktop: false },
  { label: 'FAQ', href: '/faq' },
] as const

/** PC ヘッダーに出す項目 */
export const desktopNavItems = navItems.filter((item) => !('desktop' in item && item.desktop === false))

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
