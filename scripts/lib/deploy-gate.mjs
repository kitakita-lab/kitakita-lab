/**
 * 本番反映の判定（純粋関数。通信と再試行は scripts/pr-gates.mjs の deploy が行う）。
 *
 * 公開 URL の 1 回分の取得結果を分類し、再試行の期限内なら待ち、期限を過ぎたら確定させる。
 *   ok       … 2xx で、期待する文字列がある
 *   waiting  … 反映待ちの可能性がある（404・5xx・429・期待する文字列がない・名前解決や接続の失敗）→ 期限まで再試行
 *   blocked  … この環境からは確認できない（プロキシの遮断・認証・403）→ 再試行しない。未確認として報告
 *   failed   … 恒久的な失敗（上以外の 4xx）→ 再試行しない
 *
 * 最終判定:
 *   VERIFIED            … Cloudflare Pages のデプロイ成功、すべての URL が ok
 *   FAIL                … デプロイ失敗、failed がある、期限を過ぎても 404・期待する文字列がない
 *   PENDING             … 期限を過ぎてもデプロイが完了しない
 *   DEPLOYED_UNVERIFIED … デプロイ成功だが、blocked、期限を過ぎても通信できない、期待する文字列の指定がない
 */

const TRANSIENT_STATUS = new Set([404, 408, 425, 429, 500, 502, 503, 504, 520, 521, 522, 523, 524, 525, 526, 530])

/**
 * curl の失敗を分類する（終了コードと標準エラー）。
 * プロキシが CONNECT を 403 で断る場合（許可ドメインにない）は blocked、名前解決・接続・タイムアウトは waiting。
 */
export function classifyNetworkError({ code, message = '' }) {
  if (/CONNECT tunnel failed, response 40[37]|Received HTTP code 40[37] from proxy/i.test(message)) {
    return { state: 'blocked', reason: `プロキシが接続を拒否（許可ドメインにない可能性）: ${message.trim().slice(0, 120)}` }
  }
  if (/certificate|SSL/i.test(message) || code === 60 || code === 35) {
    return { state: 'blocked', reason: `TLS の検証に失敗（証明書を信頼できない）: ${message.trim().slice(0, 120)}` }
  }
  return { state: 'waiting', network: true, reason: `通信できない（curl ${code ?? '?'}）: ${message.trim().slice(0, 120)}` }
}

/**
 * 1 回分の取得結果を分類する。
 * @param {{ status?: number|null, body?: string, expect?: string, error?: { code?: number, message?: string } }} r
 */
export function classifyPage({ status, body = '', expect, error }) {
  if (error) return classifyNetworkError(error)
  if (status === 401 || status === 407) return { state: 'blocked', reason: `認証が必要（HTTP ${status}）` }
  if (status === 403) return { state: 'blocked', reason: 'HTTP 403（アクセス制限・WAF の可能性。公開できていないとは断定しない）' }
  if (TRANSIENT_STATUS.has(status)) return { state: 'waiting', reason: `HTTP ${status}（反映待ちの可能性）` }
  if (typeof status !== 'number' || status < 200 || status >= 300) return { state: 'failed', reason: `HTTP ${status}` }
  if (expect === undefined) return { state: 'ok', reason: 'HTTP 2xx（期待する文字列の指定なし）', expectFound: null }
  if (!body.includes(expect)) return { state: 'waiting', reason: '期待する文字列がない（古い内容の可能性）', expectFound: false }
  return { state: 'ok', reason: 'HTTP 2xx・期待する文字列あり', expectFound: true }
}

/**
 * 最終判定を決める（または、まだ待つかを返す）。
 * @param {object} input
 * @param {'pending'|'success'|'failure'} input.deploy Cloudflare Pages のチェック（完了前は pending）
 * @param {{ url: string, state: string, reason: string, network?: boolean }[]} input.pages 公開 URL ごとの直近の分類
 * @param {boolean} input.expectGiven --expect の指定があるか
 * @param {boolean} input.deadlineReached 再試行の期限を過ぎたか
 * @returns {{ done: boolean, verdict: 'VERIFIED'|'FAIL'|'PENDING'|'DEPLOYED_UNVERIFIED', reasons: string[] }}
 */
export function decideDeploy({ deploy, pages, expectGiven, deadlineReached }) {
  if (deploy === 'failure') return { done: true, verdict: 'FAIL', reasons: ['Cloudflare Pages のデプロイが失敗'] }
  if (deploy === 'pending') {
    return deadlineReached
      ? { done: true, verdict: 'PENDING', reasons: ['期限内に Cloudflare Pages のデプロイが完了しなかった'] }
      : { done: false, verdict: 'PENDING', reasons: ['Cloudflare Pages のデプロイ待ち'] }
  }
  const by = (s) => pages.filter((p) => p.state === s)
  const describe = (list) => list.map((p) => `${p.url}: ${p.reason}`)
  if (by('failed').length) return { done: true, verdict: 'FAIL', reasons: ['公開 URL の取得に失敗', ...describe(by('failed'))] }
  if (by('waiting').length && !deadlineReached) {
    return { done: false, verdict: 'PENDING', reasons: ['反映待ち（再試行する）', ...describe(by('waiting'))] }
  }
  if (by('waiting').length) {
    // 期限を過ぎても HTTP で 404 や古い内容が返るなら、恒久的な失敗とみなす。通信そのものができない場合は未確認
    const httpWaiting = by('waiting').filter((p) => !p.network)
    if (httpWaiting.length) {
      return { done: true, verdict: 'FAIL', reasons: ['期限を過ぎても公開 URL に反映されていない', ...describe(httpWaiting)] }
    }
    return { done: true, verdict: 'DEPLOYED_UNVERIFIED', reasons: ['デプロイは成功。期限内に公開 URL と通信できなかった', ...describe(by('waiting'))] }
  }
  if (by('blocked').length) {
    return { done: true, verdict: 'DEPLOYED_UNVERIFIED', reasons: ['デプロイは成功。この環境からは公開 URL を確認できない', ...describe(by('blocked'))] }
  }
  if (pages.length === 0) return { done: true, verdict: 'DEPLOYED_UNVERIFIED', reasons: ['デプロイは成功。公開 URL の指定がない'] }
  if (!expectGiven) {
    return { done: true, verdict: 'DEPLOYED_UNVERIFIED', reasons: ['デプロイは成功。--expect の指定がなく、公開 URL の内容を照合していない'] }
  }
  return { done: true, verdict: 'VERIFIED', reasons: ['デプロイ成功・公開 URL で期待する内容を確認'] }
}
