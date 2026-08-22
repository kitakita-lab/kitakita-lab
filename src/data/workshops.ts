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
    alt: '地下歩行空間の広場で開催されたワークショップ体験会。参加者が数名、テーブルを囲んで手を動かしている。',
    title: 'ふらっと立ち寄れる場',
    venue: 'チカホ北三条広場',
    summary: '通りがかりの方も、気軽に座れる体験の場。',
    focus: '60% 50%',
  },
  // 2. 選ぶ・始める — 体験の入り口
  // （画像はイベント実績ページ public/events/ と共用）
  {
    id: 'materials-ario',
    image: '/events/ario-sapporo-harvest-court-2026/materials.jpg',
    alt: 'かごに盛られたドライフラワーと、木の実やシナモンが入ったガラス瓶が並ぶ花材テーブル。',
    title: '花材を選ぶ時間',
    venue: 'アリオ札幌',
    summary: '気に入った一輪を、ゆっくり選ぶところから。',
    focus: '40% 50%',
  },
  // 3. 制作中 — 手を動かす時間
  {
    id: 'hands-ario',
    image: '/events/ario-sapporo-harvest-court-2026/hands.jpg',
    alt: 'ピンセットで小さなガラスボトルへ花材を入れていく、制作中の手元。',
    title: 'ひとつずつ、瓶の中へ',
    venue: 'アリオ札幌',
    summary: '急がなくていい、手元に集中する時間。',
    focus: '45% 50%',
  },
  // 4. 交流 — 隣の人と、作家と
  {
    id: 'workshop-ario',
    image: '/events/ario-sapporo-flower-bottle-2026/workshop.jpg',
    alt: 'テーブルを囲んで花材を選びながら、フラワーボトルを制作する参加者たち。',
    title: '隣の人と、同じ時間を',
    venue: 'アリオ札幌',
    summary: '手を動かしていると、自然に会話が生まれます。',
    focus: '50% 50%',
  },
  // 5. 完成 — 締め
  {
    id: 'bottles-ario',
    image: '/events/ario-sapporo-harvest-court-2026/bottles.jpg',
    alt: 'コルク栓の小瓶に季節の花が詰められた、完成したフラワーボトル。',
    title: '自分だけの一本が完成',
    venue: 'アリオ札幌',
    summary: '季節の花を選んで、世界にひとつの一本に。',
    focus: '68% 50%',
  },
]
