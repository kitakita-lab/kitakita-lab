/**
 * Workshop 実績データ。
 *
 * 写真や実績カードは、この配列に要素を追加するだけで掲載できます。
 * 画像は `public/workshops/` に置き、`image` にパスを指定してください
 * （未指定の場合はプレースホルダーが表示されます）。
 * 将来的にCMS化する際は、この配列を API レスポンスに置き換えるだけで移行できます。
 */

export type Workshop = {
  id: string
  title: string
  /** 開催者・講師名 */
  host: string
  /** 開催場所 */
  venue: string
  /** 開催時期（表示用の文字列） */
  date: string
  category: 'ワークショップ' | '企業コラボ' | '商業施設' | '自治体' | '教育機関'
  summary: string
  /** public/ 以下の画像パス。未指定可。 */
  image?: string
  /** 参加人数や満足度などのハイライト */
  highlights?: string[]
}

export const workshops: Workshop[] = [
  {
    id: 'ikyu-handmade-market',
    title: 'ハンドメイドマーケット出店ワークショップ',
    host: 'ikyu',
    venue: '地域マルシェ / 商業施設',
    date: '2024',
    category: '商業施設',
    summary:
      'ハンドメイド作家 ikyu として、各地のマーケットやポップアップに出店。作品販売だけでなく、来場者がその場でつくれる体験を届けてきました。',
    highlights: ['延べ参加者多数', 'リピーター多数', '幅広い年齢層が参加'],
  },
  {
    id: 'ikyu-accessory-lesson',
    title: 'アクセサリー制作ワークショップ',
    host: 'ikyu',
    venue: 'カフェ / レンタルスペース',
    date: '2024',
    category: 'ワークショップ',
    summary:
      '初めての方でも楽しめる少人数制のアクセサリー制作レッスン。「自分の手でつくる喜び」を大切にした、ていねいな進行が好評でした。',
    highlights: ['少人数制', '初心者歓迎', '満足度の高い体験'],
  },
  {
    id: 'ikyu-seasonal-craft',
    title: '季節のクラフト体験会',
    host: 'ikyu',
    venue: 'コミュニティスペース',
    date: '2023',
    category: 'ワークショップ',
    summary:
      '季節のモチーフを取り入れたクラフト体験会。親子での参加も多く、ものづくりを通じた交流の場になりました。',
    highlights: ['親子参加歓迎', '季節企画', '地域交流'],
  },
]

export const workshopCategories = [
  'すべて',
  'ワークショップ',
  '企業コラボ',
  '商業施設',
  '自治体',
  '教育機関',
] as const
