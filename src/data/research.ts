/**
 * Research（調査活動）データ。
 *
 * 今後プレスリリースで公開する調査結果を掲載する想定です。
 * 現在はダミーデータです。実データに差し替える際は、この配列を更新するか
 * CMS / API レスポンスに置き換えてください。
 */

export type ResearchStat = {
  label: string
  value: string
  note?: string
}

export type ResearchReport = {
  id: string
  title: string
  /** 公開時期（表示用） */
  date: string
  /** 調査概要 */
  summary: string
  /** 主要な調査結果（ダミー） */
  stats: ResearchStat[]
  /** 調査方法のメモ */
  method?: string
  tag: string
}

export const researchReports: ResearchReport[] = [
  {
    id: 'handmade-creator-survey-2025',
    title: 'ハンドメイド作家の活動実態に関する調査',
    date: '2025（予定）',
    tag: '作家調査',
    summary:
      'ハンドメイド作家が活動を続けるうえで感じる課題や、挑戦したいことを明らかにするための調査です。作家がもっと挑戦できる環境づくりのための基礎データとして活用します。※数値はダミーです。',
    stats: [
      { label: '「もっと挑戦したい」と回答', value: '82%', note: '※ダミーデータ' },
      { label: '「活躍の場が足りない」と感じる', value: '67%', note: '※ダミーデータ' },
      { label: '企業案件に関心がある作家', value: '54%', note: '※ダミーデータ' },
    ],
    method: '全国のハンドメイド作家を対象としたアンケート調査（インターネット調査）',
  },
  {
    id: 'workshop-demand-survey-2025',
    title: 'ワークショップ需要に関する生活者調査',
    date: '2025（予定）',
    tag: '生活者調査',
    summary:
      'ものづくり体験・ワークショップに対する生活者のニーズを把握するための調査です。企業・商業施設・自治体への企画提案に活用します。※数値はダミーです。',
    stats: [
      { label: 'ワークショップに参加したい', value: '71%', note: '※ダミーデータ' },
      { label: '「手づくり体験は価値がある」', value: '88%', note: '※ダミーデータ' },
      { label: '商業施設での体験を希望', value: '49%', note: '※ダミーデータ' },
    ],
    method: '20〜60代の生活者を対象としたインターネット調査',
  },
  {
    id: 'handmade-market-trend-2025',
    title: 'ハンドメイド市場のトレンド分析',
    date: '2025（予定）',
    tag: '市場分析',
    summary:
      'ハンドメイド市場の動向や、作家・購入者の意識変化を分析するレポートです。市場の活性化に向けた示唆を整理します。※数値はダミーです。',
    stats: [
      { label: '市場への関心の高まり', value: '前年比 +12%', note: '※ダミーデータ' },
      { label: '体験消費への支出意向', value: '63%', note: '※ダミーデータ' },
      { label: '地域連携への期待', value: '58%', note: '※ダミーデータ' },
    ],
    method: '各種公開データおよび独自アンケートの分析',
  },
]
