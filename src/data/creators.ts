/**
 * Creators（作家・つくり手・事業者の募集）データ。
 *
 * 募集は、今後のワークショップや体験イベントでご一緒できるかを考えていける方との接点づくり。
 * 案件・採用・契約・出店の機会を約束する表現は使わない（「〜できます」「〜を用意しています」など）。
 * 報酬・費用負担などの条件は確定していないため書かない。
 */

export type CreatorRole = {
  title: string
  /** 見出しを意味の単位で折るための分割（連結すると title に一致すること。320px 幅で語中に割れないように） */
  titleSegments: string[]
  description: string
}

/** 募集する方の方向性（確約ではなく、どんな方と出会いたいか） */
export const creatorRoles: CreatorRole[] = [
  {
    title: '体験を届けたい作家・つくり手',
    titleSegments: ['体験を届けたい', '作家・つくり手'],
    description:
      'ものづくりの楽しさを、ワークショップや体験として人に届けたい方。ハンドメイドに限らず、ジャンルは問いません。',
  },
  {
    title: 'イベントの場づくりに関心のある方',
    titleSegments: ['イベントの', '場づくりに', '関心のある方'],
    description:
      '商業施設やイベントスペースで、来場された方と出会う体験の場づくりに関心のある方。',
  },
  {
    title: '体験にできる技術・商品を持つ事業者',
    titleSegments: ['体験にできる', '技術・商品を持つ', '事業者'],
    description:
      '技術や商品、得意なことを、短い時間の体験として届けられる方。事業者の方も歓迎します。',
  },
  {
    title: 'これから体験を形にしたい方',
    titleSegments: ['これから体験を', '形にしたい方'],
    description:
      'ワークショップをやってみたいけれど、内容はまだ固まっていない方。いまの段階のままで、応募いただけます。',
  },
]

/** 共感してほしい価値観（docs/BRAND.md の価値観から）。 */
export const creatorValues: { title: string; body: string }[] = [
  {
    title: '歩くのは、本人',
    body:
      '私たちは代わりに歩きません。そのかわり、道がちょっと豊かになる時間と出会いを、隣で用意しています。',
  },
  {
    title: '押し付けない',
    body:
      'ペースも、やり方も、どこまで進むかも、決めるのはあなた。私たちは提案はしても、強要はしません。',
  },
  {
    title: 'もらったものは、次へ',
    body:
      '受け取った応援やつながりは、次の誰かへ手渡していく。この循環を、一緒に回してくれる人が好きです。',
  },
]

/** 応募後の流れ */
export const applicationSteps: { title: string; body: string }[] = [
  {
    title: '応募フォームから応募',
    body: '活動内容や提供できる体験、作品・SNSのURLなどをお知らせください。',
  },
  {
    title: '内容を拝見',
    body: 'いただいた内容を、KitaKita Labで拝見します。',
  },
  {
    title: '機会があるときにご連絡',
    body: '今後の企画で、ご一緒できそうな機会があるときに、メールでご連絡します。',
  },
  {
    title: '企画ごとにご相談',
    body: '内容・日程・条件などは、具体的な企画ごとに、ご相談のうえで決めます。',
  },
]

/** 応募の前にご確認いただくこと */
export const applicationNotes: string[] = [
  '今回の募集は、今後のワークショップや体験イベントでご一緒できる方との出会いを目的としています。',
  '応募いただいても、案件のご依頼・採用・契約・出店の機会をお約束するものではありません。',
  '報酬や費用の負担などの条件は、具体的な企画が生まれた際に、個別にご相談します。',
]

/** 応募フォームでお伺いすること（Google フォームの設問と揃える。docs/creators-application-form.md） */
export const applicationFields: { label: string; optional?: boolean }[] = [
  { label: '氏名または活動名' },
  { label: 'メールアドレス' },
  { label: '活動内容・ジャンル' },
  { label: '提供できる体験と所要時間' },
  { label: '作品・SNSのURL' },
  { label: '対応できる地域・曜日', optional: true },
  { label: '個人情報の取り扱いへの同意' },
]

/**
 * 応募フォームの公開設定。
 * 応募フォームへの導線は、次の両方がそろうまで表示しない（未設定の間は「準備中」を表示）。
 *   - formUrl: 公開・応募受付を承認した Google フォームの URL（docs.google.com/forms または forms.gle）
 *   - privacyPolicyPath: 公開を承認したプライバシーポリシーのページ（docs/privacy-policy-draft.md は下書き）
 * URL を推測で入れない。公開の判断はユーザーが行う。
 */
export const creatorApplication: { formUrl: string | null; privacyPolicyPath: string | null } = {
  formUrl: null,
  privacyPolicyPath: null,
}

/** フォームへの導線を表示してよいか（URL の形式とプライバシーポリシーの公開をそろえて確認） */
export function isApplicationOpen(config = creatorApplication): boolean {
  return Boolean(
    config.formUrl &&
      /^https:\/\/(docs\.google\.com\/forms\/|forms\.gle\/)/.test(config.formUrl) &&
      config.privacyPolicyPath,
  )
}
