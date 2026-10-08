/**
 * 調査の割合表示。人数と対象人数から計算し、小数第 1 位に四捨五入する。
 * 割合をデータに直接書かず、常に人数から計算することで、
 * 「人数／対象人数（割合）」の表記が食い違わないようにする。
 */
export function percent(count: number, n: number): number {
  if (n <= 0) return 0
  // count * 1000 / n を整数に丸める（浮動小数の誤差で .x5 が切り下がらないよう、先に 1000 倍する）
  return Math.round((count * 1000) / n) / 10
}

/** 「41.7%」形式 */
export function formatPercent(count: number, n: number): string {
  return `${percent(count, n).toFixed(1)}%`
}

/** 「1,023」形式 */
export function formatCount(value: number): string {
  return value.toLocaleString('ja-JP')
}

/** 「427/1,023名（41.7%）」形式 */
export function formatRatio(count: number, n: number): string {
  return `${formatCount(count)}/${formatCount(n)}名（${formatPercent(count, n)}）`
}
