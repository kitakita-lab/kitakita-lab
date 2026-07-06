/**
 * Activities（私たちがつくる流れ）データ。
 *
 * 事業一覧ではなく「どんな流れをつくる会社か」を表す。
 * 流れはすべて「〜てみる」——哲学（ちょっと進めてみる）の動詞が
 * そのまま会社の動きになっている。
 * ワークショップ・AI・EC などの活動は、この流れの中の実例として置く。
 * 実例は examples に追加するだけで掲載されます。
 */

export type FlowStep = {
  id: string
  /** 流れの動詞（〜てみる） */
  verb: string
  /** 一行の説明 */
  summary: string
  /** この段階の実例（href は任意） */
  examples: Array<{ label: string; href?: string }>
}

export const flowSteps: FlowStep[] = [
  {
    id: 'meet',
    verb: '会ってみる',
    summary: 'はじまりは、顔を合わせること。人が集まる場を、まちの中につくります。',
    examples: [
      { label: 'ワークショップ', href: '/workshop' },
      { label: 'イベント・マルシェ', href: '/collaboration' },
    ],
  },
  {
    id: 'talk',
    verb: '話してみる',
    summary: '進めてみたいことを、言葉にしてみる。それだけで、ちょっと進みます。',
    examples: [
      { label: 'ご相談', href: '/contact' },
      { label: '企業・地域との企画', href: '/collaboration' },
    ],
  },
  {
    id: 'make',
    verb: 'つくってみる',
    summary: '完成を待たずに、小さく手を動かす。試作から始めます。',
    examples: [
      { label: 'ものづくり' },
      { label: 'AI・システムの試作' },
    ],
  },
  {
    id: 'deliver',
    verb: '届けてみる',
    summary: 'つくったものを、誰かのところへ。届いた先で、次が生まれます。',
    examples: [
      { label: 'EC・出店' },
      { label: 'ワークショップでの発表', href: '/workshop' },
    ],
  },
  {
    id: 'continue',
    verb: 'つづけてみる',
    summary: 'ふりかえって、またちょっと。声を数字にして、次に進む人の地図に。',
    examples: [
      { label: '調査', href: '/research' },
      { label: '次の企画へ' },
    ],
  },
]
