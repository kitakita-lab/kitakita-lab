/**
 * Formats an ISO date (YYYY-MM-DD) as "YYYY.MM.DD" for display.
 *
 * 日付のみの ISO 文字列は UTC の 0 時として解釈されるため、UTC の getter で読む。
 * ローカル時刻で読むと、UTC より西のタイムゾーン（米国など）の閲覧者には
 * 1 日前の日付が表示され、プリレンダリング（UTC）とのハイドレーションもずれる。
 */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}
