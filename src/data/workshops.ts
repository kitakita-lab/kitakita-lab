/**
 * Workshop 活動実績（写真ギャラリー）データ。
 *
 * 写真を追加するだけで実績が増えていく構造。
 * 画像は `public/workshops/` に置き、`image` にパスを指定してください。
 * タイトル・開催場所・概要・開催時期は、わかる範囲だけ埋めれば十分です
 * （不明な項目は省略可）。
 */

export type WorkshopPhoto = {
  id: string
  /** public/ 以下の画像パス */
  image: string
  /** 画像の内容を説明する alt テキスト */
  alt: string
  title?: string
  /** 開催場所 */
  venue?: string
  /** ひとこと概要 */
  summary?: string
  /** 開催時期（わかる範囲の表示用文字列） */
  period?: string
}

export const workshopPhotos: WorkshopPhoto[] = [
  {
    id: 'booth-wide-01',
    image: '/workshops/booth-wide-01.jpg',
    alt: '商業施設のロビーで開催されたワークショップ体験会。参加者が数名、テーブルを囲んで手を動かしている。',
    title: 'ワークショップ体験会',
    venue: '商業施設',
    summary: '通りがかりの方も、気軽に立ち寄れる体験の場。',
  },
  {
    id: 'craft-detail-01',
    image: '/workshops/craft-detail-01.jpg',
    alt: '白い手袋をした手が、ピンセットでドライフラワーを小さな瓶の中へ入れている様子。',
    title: 'ひとつずつ、瓶の中へ',
    summary: 'ピンセットで、ひとつずつ丁寧に。',
  },
  {
    id: 'craft-detail-02',
    image: '/workshops/craft-detail-02.jpg',
    alt: '参加者がピンセットで、仕分けされたドライフラワーの花材を選んでいる様子。',
    title: '花材を選ぶ時間',
    summary: '気に入った一輪を、ゆっくり選びます。',
  },
  {
    id: 'craft-detail-03',
    image: '/workshops/craft-detail-03.jpg',
    alt: 'はさみでドライフラワーのバラを整えている手元の様子。',
    title: '少しずつ、かたちに',
    summary: '急がず、手元の作業に集中する時間。',
  },
  {
    id: 'booth-wide-02',
    image: '/workshops/booth-wide-02.jpg',
    alt: 'ハンドメイドアクセサリーの展示ブースで、参加者が作品を手に取り、作家がサポートしている様子。',
    title: 'アクセサリーの展示・体験',
    venue: '商業施設',
    summary: '作家によるアクセサリーの展示と、体験の時間。',
  },
]
