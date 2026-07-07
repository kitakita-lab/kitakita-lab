/**
 * Workshop 写真ギャラリー（体験紹介）データ。
 *
 * 写真を追加するだけでレイアウトが完成する構造（グリッドは自動で流れる）。
 * 画像は `public/workshops/` に置き、`image` にパスを指定してください。
 *
 * 【並び順のルール】作品ではなく「体験」を伝える順に並べる:
 *   1. 会場の雰囲気（どんな場か）
 *   2. 選ぶ・始める（体験の入り口）
 *   3. 制作中（手を動かす時間）
 *   4. 交流（隣の人と、作家と）
 *   5. 笑顔・空気感（締め）
 * 新しい写真は、この流れの中の合う位置に差し込んでください。
 *
 * 【表示】全写真 4:5・object-cover で統一トリミングされます。
 * 被写体が中央にない写真は `focus` で見せたい位置を指定してください
 * （CSS object-position の値。例: '60% 50%' = 中央より少し右）。
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
  /** 4:5トリミング時のフォーカス位置（object-position値、省略時は中央） */
  focus?: string
}

export const workshopPhotos: WorkshopPhoto[] = [
  // 1. 会場の雰囲気 — どんな場か
  {
    id: 'booth-wide-01',
    image: '/workshops/booth-wide-01.jpg',
    alt: '商業施設のロビーで開催されたワークショップ体験会。参加者が数名、テーブルを囲んで手を動かしている。',
    title: 'ふらっと立ち寄れる場',
    venue: '商業施設',
    summary: '通りがかりの方も、気軽に座れる体験の場。',
    focus: '60% 50%',
  },
  // 2. 選ぶ・始める — 体験の入り口
  {
    id: 'craft-detail-02',
    image: '/workshops/craft-detail-02.jpg',
    alt: '参加者がピンセットで、仕分けされたドライフラワーの花材を選んでいる様子。',
    title: '花材を選ぶ時間',
    summary: '気に入った一輪を、ゆっくり選ぶところから。',
  },
  // 3. 制作中 — 手を動かす時間
  {
    id: 'craft-detail-01',
    image: '/workshops/craft-detail-01.jpg',
    alt: '白い手袋をした手が、ピンセットでドライフラワーを小さな瓶の中へ入れている様子。',
    title: 'ひとつずつ、瓶の中へ',
    summary: '急がなくていい、手元に集中する時間。',
    focus: '60% 50%',
  },
  // 4. 交流 — 隣の人と、作家と
  {
    id: 'craft-detail-03',
    image: '/workshops/craft-detail-03.jpg',
    alt: '参加者たちがテーブルを囲み、ドライフラワーを手に取りながらそれぞれの作業を進めている手元。',
    title: '隣の人と、同じ時間を',
    summary: '手を動かしていると、自然に会話が生まれます。',
    focus: '65% 50%',
  },
  // 5. 笑顔・空気感 — 締め
  {
    id: 'booth-wide-02',
    image: '/workshops/booth-wide-02.jpg',
    alt: 'ドライフラワーが並ぶブースで、作家が笑顔で参加者と話している様子。',
    title: '作家と、話しながら',
    venue: '商業施設',
    summary: 'つくったあとも、ゆるやかに続く時間。',
    focus: '65% 40%',
  },
]
