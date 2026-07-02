/**
 * Activities（いま育てている挑戦）データ。
 *
 * Activities は「事業紹介」ではなく「現在この実験室で育てている挑戦」。
 * 挑戦は増えていく前提のため、この配列に追加するだけで掲載できます。
 * status:
 *   - growing  … いま育てている挑戦
 *   - sprouting … これから芽を出す挑戦（準備中）
 */

export type Activity = {
  id: string
  title: string
  summary: string
  /** Optional internal link to a dedicated page. */
  href?: string
  /** Lucide-style icon key resolved in the UI. */
  icon: 'workshop' | 'research' | 'collab' | 'event' | 'creators' | 'market'
  status: 'growing' | 'sprouting'
}

export const activities: Activity[] = [
  {
    id: 'workshop',
    title: 'ワークショップという挑戦',
    summary:
      'つくる楽しさに、はじめて触れる場所。参加者には「できた！」を、作家には講師という新しい舞台を育てます。',
    href: '/workshop',
    icon: 'workshop',
    status: 'growing',
  },
  {
    id: 'collab',
    title: '企業との共同実験',
    summary:
      'ブランドの想いを、手ざわりのある体験に。企業のメッセージと作家の表現が出会うと、新しい何かが芽を出します。',
    href: '/collaboration',
    icon: 'collab',
    status: 'growing',
  },
  {
    id: 'event',
    title: 'まちに賑わいを育てる',
    summary:
      '商業施設やイベントの場に、つくり手の熱を。訪れた人の「きた！」と、出店者の挑戦が同時に育つ企画をつくります。',
    href: '/collaboration',
    icon: 'event',
    status: 'growing',
  },
  {
    id: 'public',
    title: '地域・学びとの種まき',
    summary:
      '自治体や教育機関とともに、地域の魅力や子どもたちの創造力に水をやる。まちと人にやさしい挑戦を育てます。',
    href: '/collaboration',
    icon: 'market',
    status: 'growing',
  },
  {
    id: 'research',
    title: '声を数字にする調査',
    summary:
      'つくり手と市場の声を可視化して、次の挑戦の土壌を耕す。データは、挑戦を育てるための養分です。',
    href: '/research',
    icon: 'research',
    status: 'growing',
  },
  {
    id: 'next',
    title: 'つぎに芽を出す挑戦',
    summary:
      '中小企業支援、AI活用、Webサービス、商品開発——実験室では、次の種がもう発芽の準備をしています。',
    icon: 'creators',
    status: 'sprouting',
  },
]
