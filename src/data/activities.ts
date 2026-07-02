/**
 * Activities（いま、育てているもの）データ。
 *
 * 活動一覧ではなく「同じ思想（少し進めてみる）から生まれた、育てているもの」。
 * ワークショップも AI もシステムも EC も、根はひとつ。
 * 増えていく前提のため、この配列に追加するだけで掲載されます。
 * status:
 *   - growing  … いま育てているもの
 *   - sprouting … これから育てるもの（準備中）
 */

export type Activity = {
  id: string
  title: string
  summary: string
  /** Optional internal link to a dedicated page. */
  href?: string
  status: 'growing' | 'sprouting'
}

export const activities: Activity[] = [
  {
    id: 'workshop',
    title: 'ワークショップ',
    summary: '手を動かすと、少し進む。つくる時間を、体験として届けています。',
    href: '/workshop',
    status: 'growing',
  },
  {
    id: 'collab',
    title: '企業・地域との企画',
    summary: '商業施設、自治体、学校。まちの中に、進めてみる場をつくっています。',
    href: '/collaboration',
    status: 'growing',
  },
  {
    id: 'research',
    title: '調査',
    summary: 'つくり手と市場の声を、数字にして残す。次に進む人の地図になるように。',
    href: '/research',
    status: 'growing',
  },
  {
    id: 'tech',
    title: 'AIとシステムづくり',
    summary: '毎日の面倒を、少し軽く。小さな道具を、試しながらつくっています。',
    status: 'growing',
  },
  {
    id: 'craft-ec',
    title: 'ものづくりとEC',
    summary: 'つくったものが、誰かに届くまで。売り場も、届け方も、育てています。',
    status: 'growing',
  },
  {
    id: 'next',
    title: 'まだ名前のないもの',
    summary: '次に育てるものを、いくつか温めています。決めすぎないのも、この場所らしさ。',
    status: 'sprouting',
  },
]
