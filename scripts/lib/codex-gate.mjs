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

/**
 * Codex の GitHub App のログイン名（完全一致で照合する）。
 * 「[bot]」で終わる名前は GitHub App にしか付かないため、利用者が同じ名前を名乗ることはできない。
 * 前方一致にすると `chatgpt-codex-connector-fake` のようなアカウントのコメントを信用してしまう。
 */
export const CODEX_LOGIN = 'chatgpt-codex-connector[bot]'

const STATE_RE = /<!--\s*codex-review-state:v1\s*(\{[\s\S]*?\})\s*-->/
const RECEIPT_RE = /codex-review-receipt:v1[\s\S]*?Reviewed commit:\*{0,2}\s*`([0-9a-f]{7,40})`/

const isCodex = (login) => login === CODEX_LOGIN

/** 要約コメントから state を取り出す（最後に更新されたものを採用） */
export function parseCodexState(comments) {
  return latestCodexStateComment(comments)?.state ?? null
}

/** 最後に更新された要約コメントの state と更新時刻（壊れていれば null） */
function latestCodexStateComment(comments) {
  const states = comments
    .filter((c) => isCodex(c.login) && STATE_RE.test(c.body ?? ''))
    .sort((a, b) => String(a.updatedAt ?? '').localeCompare(String(b.updatedAt ?? '')))
  const last = states.at(-1)
  if (!last) return null
  try {
    return { state: JSON.parse(last.body.match(STATE_RE)[1]), updatedAt: last.updatedAt }
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

/**
 * レビュー依頼の運用（codex-wait）。合否は判定しない（合否は evaluateCodex だけが決める）。
 *
 *   - 依頼から stallMinutes 分たっても head のレビューが完了しなければ、同じ commit に 1 回だけ再依頼する
 *   - 再依頼からさらに stallMinutes 分たっても完了しなければ止める（PENDING のまま。合格扱いにしない）
 *   - 同じ commit への依頼は、誰が投稿したものも数える（初回＋再依頼 1 回まで。重複依頼をしない）
 *   - レビュー回数の上限（3 回）は「レビューした commit の数」で数える。同じ commit への再依頼は数えない
 *   - FAIL（未解決の指摘）は再依頼で解消しない。指摘に対応して新しい commit を積む
 */
export const CODEX_POLICY = { stallMinutes: 30, maxRequestsPerCommit: 2, maxReviewRounds: 3 }

/** ハーネスが投稿する依頼コメントの目印（どの commit への依頼かを残す） */
const REQUEST_MARK_RE = /<!--\s*harness-codex-request:v1\s*(\{[^}]*\})\s*-->/
const REQUEST_RE = /(^|\s)@codex review(\s|$)/

/** 依頼コメントの本文。`@codex review` に、対象の commit と種別を目印として添える */
export function codexRequestBody(sha, kind) {
  return `@codex review\n\n<!-- harness-codex-request:v1 ${JSON.stringify({ sha, kind })} -->`
}

/**
 * head commit への依頼を列挙する。
 * 目印付きは目印の commit で、目印のない依頼（手動）は head の commit 時刻以降のものを head への依頼とみなす。
 * bot（Codex の要約にも「@codex review」の文字列がある）のコメントは数えない。
 * @param {{login:string, body:string, createdAt?:string}[]} comments
 */
export function codexRequests(comments, headSha, headCommittedAt) {
  const out = []
  for (const c of comments) {
    if (!c.login || c.login.endsWith('[bot]')) continue
    const body = c.body ?? ''
    if (!REQUEST_RE.test(body)) continue
    let sha = null
    let kind = 'manual'
    const m = body.match(REQUEST_MARK_RE)
    if (m) {
      try {
        ;({ sha, kind } = JSON.parse(m[1]))
      } catch {
        sha = null
      }
    }
    const at = c.createdAt ?? ''
    const forHead = sha ? sha === headSha : Boolean(headCommittedAt) && at >= headCommittedAt
    out.push({ sha: sha ?? (forHead ? headSha : null), kind, at, forHead })
  }
  return out.sort((a, b) => a.at.localeCompare(b.at))
}

/**
 * 次に行うことを決める（純粋関数）。
 * @returns {{ action: 'done'|'stop'|'wait'|'request'|'rerequest', verdict: 'PASS'|'FAIL'|'PENDING', reasons: string[],
 *   requestsOnHead: number, elapsedMinutes: number|null, roundsUsed: number }}
 */
export function planCodexReview({ headSha, headCommittedAt, now, comments, reviews, threads, policy = CODEX_POLICY }) {
  const judged = evaluateCodex({ headSha, comments, reviews, threads })
  const requests = codexRequests(comments, headSha, headCommittedAt)
  const onHead = requests.filter((r) => r.forHead)
  // 依頼より前に Codex が head のレビューを始めている（PR 作成時の自動レビューなど）なら、それを最初の依頼とみなす
  const running = latestCodexStateComment(comments)
  const startedAt = running?.updatedAt ?? ''
  if (
    running?.state.code_review?.commit_sha === headSha &&
    running.state.code_review.status !== 'completed' &&
    (onHead.length === 0 || (startedAt && startedAt < onHead[0].at))
  ) {
    onHead.unshift({ sha: headSha, kind: 'auto', at: startedAt, forHead: true })
  }
  // 再依頼の目印は、その前に最初の依頼（自動レビューを含む）があったことを示す。
  // 自動レビューの記録（要約コメント）が再依頼の後に更新されて数えられなくなっても、再依頼を重ねないようにする
  const impliedFirst = onHead.some((r) => r.kind === 'rerequest') && !onHead.some((r) => r.kind !== 'rerequest') ? 1 : 0
  const requestCount = onHead.length + impliedFirst
  // レビューした（依頼した）commit の数。受領と目印付き依頼の commit を合わせて数える
  const commits = new Set([...receiptCommits([...comments, ...reviews]).map((s) => s.slice(0, 10)), ...requests.filter((r) => r.sha).map((r) => r.sha.slice(0, 10))])
  const roundsUsed = commits.size
  const base = { verdict: judged.verdict, requestsOnHead: requestCount, roundsUsed }

  if (judged.verdict === 'PASS') return { ...base, action: 'done', elapsedMinutes: null, reasons: judged.reasons }
  if (judged.verdict === 'FAIL') {
    return { ...base, action: 'stop', elapsedMinutes: null, reasons: [...judged.reasons, '指摘に対応して新しい commit を積む（再依頼では解消しない）'] }
  }
  if (onHead.length === 0) {
    const used = commits.has(headSha.slice(0, 10)) ? roundsUsed - 1 : roundsUsed
    if (used >= policy.maxReviewRounds) {
      return { ...base, action: 'stop', elapsedMinutes: null, reasons: [`レビュー回数の上限（${policy.maxReviewRounds} 回）に達している`] }
    }
    return { ...base, action: 'request', elapsedMinutes: null, reasons: ['head の commit にレビューを依頼していない'] }
  }
  const last = onHead.at(-1)
  const elapsedMinutes = Math.max(0, (Date.parse(now) - Date.parse(last.at)) / 60000)
  if (Number.isNaN(elapsedMinutes)) {
    return { ...base, action: 'stop', elapsedMinutes: null, reasons: ['依頼の時刻を読めない（合格扱いにしない）'] }
  }
  if (elapsedMinutes < policy.stallMinutes) {
    return { ...base, action: 'wait', elapsedMinutes, reasons: [...judged.reasons, `依頼から ${Math.floor(elapsedMinutes)} 分（${policy.stallMinutes} 分まで待つ）`] }
  }
  if (requestCount < policy.maxRequestsPerCommit) {
    return { ...base, action: 'rerequest', elapsedMinutes, reasons: [...judged.reasons, `依頼から ${policy.stallMinutes} 分以上たっても完了しない`] }
  }
  return {
    ...base,
    action: 'stop',
    elapsedMinutes,
    reasons: [...judged.reasons, `同じ commit への依頼が ${requestCount} 回、最後の依頼から ${policy.stallMinutes} 分以上たっても完了しない`],
  }
}
