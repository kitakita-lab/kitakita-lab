/**
 * Activities（私たちがつくっている流れ）データ。
 *
 * 役割は「KitaKita Lab に依頼できるサービス一覧」ではなく、
 * 「KitaKita Lab が、いま実際に手を動かしていること」を流れで見せること。
 * 5つの動詞（会ってみる／話してみる／つくってみる／届けてみる／つづけてみる）は
 * この目録固有の装置で、骨格は変えない。
 *
 * 実例（examples）を載せる基準:
 * - いま実際にやっていて、実物・実績・進行中の活動として説明できること
 * - href は、実物を確かめられるページ（Events / Workshop / Research / Collaboration / Contact）にだけ付ける
 * - リンクなしの実例は「自分たちがつくっているもの」として名詞で書く（依頼先には見せない）
 * - 「〜を支援します」「〜に対応します」のようなサービス文にも、
 *   「試作」「模索」のような自己縮小にもしない
 * - 未来の計画（例: EC。ikyu のサイトから販売先への導線が実際に動いたら、
 *   その時点の実物として改めて判断する）は書かない
 * - AI は提供サービスではなく、KitaKita Lab 自身の制作方法として書く。
 *   AI に相談導線を付けない。「AI がつくった」ではなく、人が考え AI を使いながらつくる関係を保つ
 * - ikyu の作品づくりなど、KitaKita Lab 以外の主体の活動を KitaKita Lab のものとして書かない
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
      { label: 'イベント実績', href: '/events' },
    ],
  },
  {
    id: 'talk',
    verb: '話してみる',
    summary: '進めてみたいことを、まず言葉にする。企業や施設、作家やつくり手と、そこから話しています。',
    examples: [
      { label: 'ご相談', href: '/contact' },
      { label: '企業・施設との企画', href: '/collaboration' },
    ],
  },
  {
    id: 'make',
    verb: 'つくってみる',
    summary: '完成を待たずに手を動かす。会場やPOP、Webや資料まで、必要なものは自分たちでもつくっています。',
    examples: [
      { label: 'イベントの会場・POP・ビジュアル' },
      { label: 'AIを使いながらつくるWebや資料。このサイトもそのひとつ' },
    ],
  },
  {
    id: 'deliver',
    verb: '届けてみる',
    summary: '企画や体験を、実際の場所へ。届いた先で、次が生まれます。',
    examples: [
      { label: '商業施設や企業イベントの現場へ', href: '/events' },
      { label: '作家の作品と体験を、同じ場に', href: '/workshop' },
    ],
  },
  {
    id: 'continue',
    verb: 'つづけてみる',
    summary: 'ふりかえって、次へ。気になったことは、調査でも確かめています。',
    examples: [
      { label: '進行中の調査', href: '/research' },
      { label: '次の企画へ' },
    ],
  },
]
