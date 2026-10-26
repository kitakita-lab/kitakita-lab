/**
 * Codex レビューの合否判定（純粋関数。GitHub への通信は scripts/pr-gates.mjs が行う）。
 *
 * Codex（chatgpt-codex-connector[bot]）は PR に次のコメントを残す。
 *   - 要約コメント: `<!-- codex-review-state:v1 {...} -->` を含み、レビューのたびに上書きされる。
 *     code_review.commit_sha（レビューした commit）・status・has_unresolved_findings を持つ。
 *   - 受領コメント／レビュー: `<!-- codex-review-receipt:v1 -->` と `**Reviewed commit:** \`<sha先頭10桁>\``。
 *     指摘がある場合は行コメント（レビュースレッド）が付く。
 *
 * 判定（すべて満たすと PASS）:
 *   1. 要約コメントがある                         … なければ PENDING（未実行）
 *   2. status が completed                         … それ以外は PENDING（実行中）
 *   3. commit_sha が PR の head と一致             … 古い commit のレビューは PENDING（再レビュー待ち）
 *   4. has_unresolved_findings が false            … true は FAIL
 *   5. 未解決のレビュースレッドが 0（outdated 含む） … 残っていれば FAIL
 *   6. head commit の受領（receipt）がある          … なければ PENDING
 * 取得できなかった項目は合格扱いにしない（threads が null なら PENDING）。
 */

export const CODEX_LOGIN_PREFIX = 'chatgpt-codex-connector'

const STATE_RE = /<!--\s*codex-review-state:v1\s*(\{[\s\S]*?\})\s*-->/
const RECEIPT_RE = /codex-review-receipt:v1[\s\S]*?Reviewed commit:\*{0,2}\s*`([0-9a-f]{7,40})`/

const isCodex = (login) => typeof login === 'string' && login.startsWith(CODEX_LOGIN_PREFIX)

/** 要約コメントから state を取り出す（最後に更新されたものを採用） */
export function parseCodexState(comments) {
  const states = comments
    .filter((c) => isCodex(c.login) && STATE_RE.test(c.body ?? ''))
    .sort((a, b) => String(a.updatedAt ?? '').localeCompare(String(b.updatedAt ?? '')))
  const last = states.at(-1)
  if (!last) return null
  try {
    return JSON.parse(last.body.match(STATE_RE)[1])
  } catch {
    return null
  }
}

/** 受領コメント・レビュー本文から、レビュー済み commit（先頭）を列挙する */
export function receiptCommits(items) {
  return items
    .filter((c) => isCodex(c.login))
    .map((c) => (c.body ?? '').match(RECEIPT_RE)?.[1])
    .filter(Boolean)
}

/**
 * @param {object} input
 * @param {string} input.headSha PR の head commit（40桁）
 * @param {{login:string, body:string, updatedAt?:string}[]} input.comments Issue コメント
 * @param {{login:string, body:string}[]} input.reviews PR レビュー
 * @param {{resolved:boolean, outdated?:boolean}[] | null} input.threads レビュースレッド（取得失敗は null）
 */
export function evaluateCodex({ headSha, comments, reviews, threads }) {
  const reasons = []
  const state = parseCodexState(comments)
  if (!state?.code_review) {
    return { verdict: 'PENDING', reasons: ['Codex の要約コメント（codex-review-state）がまだない'] }
  }
  const cr = state.code_review
  if (cr.status !== 'completed') {
    return { verdict: 'PENDING', reasons: [`Codex レビューが完了していない（status: ${cr.status ?? 'null'}）`] }
  }
  if (!cr.commit_sha || cr.commit_sha !== headSha) {
    return {
      verdict: 'PENDING',
      reasons: [`最新の commit がレビューされていない（review: ${String(cr.commit_sha).slice(0, 10)} / head: ${headSha.slice(0, 10)}）`],
    }
  }
  if (cr.has_unresolved_findings !== false) {
    reasons.push(`未解決の指摘がある（has_unresolved_findings: ${cr.has_unresolved_findings}）`)
  }
  if (threads === null) {
    return { verdict: 'PENDING', reasons: [...reasons, 'レビュースレッドを取得できない（合格扱いにしない）'] }
  }
  const open = threads.filter((t) => !t.resolved)
  if (open.length > 0) reasons.push(`未解決のレビュースレッドが ${open.length} 件ある`)
  if (reasons.length > 0) return { verdict: 'FAIL', reasons }

  const receipts = receiptCommits([...comments, ...reviews])
  if (!receipts.some((sha) => headSha.startsWith(sha))) {
    return { verdict: 'PENDING', reasons: ['head commit に対する Codex の受領（Reviewed commit）がまだない'] }
  }
  return {
    verdict: 'PASS',
    reasons: [`Codex が ${headSha.slice(0, 10)} をレビュー済み。未解決の指摘・スレッドなし`],
    findingsOnHead: cr.has_any_findings === true,
  }
}
