import { site } from '@/data/site'

/**
 * Creators（作家・つくり手・事業者の募集）データ。
 *
 * 募集は、今後のワークショップや体験イベントでご一緒できるかを考えていける方との接点づくり。
 * 応募はメール（site.email）で受け付ける（2026-11 の決定。Google フォームは当面使わない）。
 * 案件・採用・契約・出店・報酬の機会を約束する表現は使わない。条件は確定していないため書かない。
 * 開催の実績の数（会期数・本数）はここに書かない（古くなるため。実績は /events を案内する）。
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

/** 応募メールに書いていただくこと（メールの本文のひな形にも使う） */
export const applicationFields: { label: string; optional?: boolean }[] = [
  { label: '活動名（屋号・作家名など）' },
  { label: '活動内容・ジャンル' },
  { label: '提供できる体験や技術' },
  { label: '作品やSNSのURL' },
  { label: '対応できる地域・曜日', optional: true },
]

/** 応募の前にご確認いただくこと */
export const applicationNotes: string[] = [
  '今回の募集は、今後のワークショップや体験イベントでご一緒できる方との出会いを目的としています。',
  '応募いただいても、案件のご依頼・採用・契約・出店の機会をお約束するものではありません。',
  '報酬や費用の負担などの条件は、具体的な企画が生まれた際に、個別にご相談します。',
]

/** 応募後の流れ */
export const applicationSteps: { title: string; body: string }[] = [
  {
    title: 'メールで応募',
    body: '下の項目を添えて、メールでお送りください。',
  },
  {
    title: '内容を拝見',
    body: 'いただいた内容を、KitaKita Labで拝見します。',
  },
  {
    title: '企画が具体化したときにご相談',
    body: '内容に合う企画が具体化した際に、個別にご相談させていただきます。具体的な協力内容や条件は、企画ごとに調整します。',
  },
]

/** 応募メールでいただいた情報の利用目的（運営主体は site.operator） */
export const applicationPrivacy: string[] = [
  'いただいた情報は、応募内容の確認、ご連絡、今後の企画のご相談のためにだけ使います。',
]

/** 応募メールの件名 */
export const applicationMailSubject = '作家・つくり手の募集への応募'

/** 応募メールの mailto: URL（件名と、書いていただく項目のひな形を入れる） */
export function buildApplicationMailto(): string {
  const body = applicationFields.map((f) => `${f.label}${f.optional ? '（任意）' : ''}：`).join('\n')
  return `mailto:${site.email}?subject=${encodeURIComponent(applicationMailSubject)}&body=${encodeURIComponent(body)}`
}
