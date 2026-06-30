/**
 * 活動内容（Activities）データ。
 * トップページの Activities セクションと各詳細ページへの導線に使用。
 */

export type Activity = {
  id: string
  title: string
  summary: string
  /** Optional internal link to a dedicated page. */
  href?: string
  /** Lucide-style icon key resolved in the UI. */
  icon: 'workshop' | 'research' | 'collab' | 'event' | 'creators' | 'market'
}

export const activities: Activity[] = [
  {
    id: 'workshop',
    title: 'オリジナルワークショップ',
    summary:
      '作家とともに企画する、ものづくりの体験。参加者にとっては「つくる楽しさ」との出会いの場であり、作家にとっては挑戦の舞台になります。',
    href: '/workshop',
    icon: 'workshop',
  },
  {
    id: 'collab',
    title: '企業コラボワークショップ',
    summary:
      '企業のブランドや想いを、ハンドメイドの体験として届ける。作家の表現力と企業のメッセージが出会う場をつくります。',
    href: '/collaboration',
    icon: 'collab',
  },
  {
    id: 'event',
    title: '商業施設イベント',
    summary:
      '商業施設の賑わいづくりと、作家の活躍の場を同時に生み出す。出店・体験・展示など、施設に合わせた企画を設計します。',
    href: '/collaboration',
    icon: 'event',
  },
  {
    id: 'public',
    title: '自治体・教育機関との企画',
    summary:
      '地域の魅力発信や教育プログラムに、ハンドメイドの力を。自治体・学校と連携し、まちと人にやさしい企画を届けます。',
    href: '/collaboration',
    icon: 'market',
  },
  {
    id: 'research',
    title: '調査活動',
    summary:
      'ハンドメイド市場やつくり手の声を可視化する。データと現場の実感の両面から、業界の未来を考える材料をつくります。',
    href: '/research',
    icon: 'research',
  },
  {
    id: 'creators',
    title: 'ハンドメイド市場の活性化',
    summary:
      '作家が挑戦し、活躍し、次の作家が育つ循環を。市場そのものを大きく、あたたかくしていくことを目指します。',
    href: '/creators',
    icon: 'creators',
  },
]
