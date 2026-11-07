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
 *   - レビュー回数の上限（既定 3 回。リスク区分で 1／3／5／5）は「Codex が実際にレビューした commit の数」（受領のある commit）で数える。
 *     応答のなかった依頼・同じ commit への再依頼は数えない。依頼の総数は別に数え、上限×同じ commit への依頼の上限を超えたら止める
 *   - 上限に達し、head が未レビューなら判定は CAPPED（合格ではない。人間が判断する）
 *   - 依頼・再依頼の前に、head の CI が成功していることを条件にする（ci が渡されたとき。失敗なら止め、実行中なら待つ）
 *   - 同種の指摘の繰り返し（repeatCheck）: 2 回続けば原因分析の記録まで依頼しない、3 回続けば止める
 *   - FAIL（未解決の指摘）は再依頼で解消しない。指摘に対応して新しい commit を積む
 *   - 統合の例外: 上限に達した後でも、head が「最新 main の取り込み（競合解消を含む）」だけの merge commit なら、
 *     最終確認のレビューを 1 回だけ依頼できる（integration.verified。判定は pr-gates.mjs の integrationCheck）。
 *     PR につき 1 回まで（2 回目の統合では止める）。取り込む前の commit がレビュー済みであることも条件。
 *     例外のレビューで指摘が出たら、通常どおり FAIL で止まる（回数は増やさない）
 */
export const CODEX_POLICY = { stallMinutes: 30, maxRequestsPerCommit: 2, maxReviewRounds: 3 }

/**
 * リスク区分ごとのレビュー上限（harness/profiles/review.md）。上限であって義務ではない。
 * 修正 commit・総 commit の上限は docs/AUTOPILOT.md §9（レビュー上限とは別に管理する）。
 */
export const REVIEW_TIERS = {
  minor: { label: '軽微', maxReviewRounds: 1 },
  standard: { label: '通常', maxReviewRounds: 3 },
  foundation: { label: '基盤', maxReviewRounds: 5 },
  critical: { label: '重要領域', maxReviewRounds: 5 },
}
const TIER_ORDER = ['minor', 'standard', 'foundation', 'critical']
const TIER_BY_LABEL = Object.fromEntries(Object.entries(REVIEW_TIERS).map(([k, v]) => [v.label, k]))

/**
 * このリポジトリの「変更したファイルから機械的に決まる下限」。パスの正規表現で判定する。
 *   critical: CI・ゲート・検査のスクリプト・AI の運用ルール（人間だけが行うことを決める文書）・セキュリティヘッダー
 *   foundation: ビルド・依存関係・プリレンダリング・設定
 *   minor: 文書だけ（下の critical の文書を除く）
 * どれにも当たらないファイルは standard。ファイルの一覧を取得できないときも standard 以上にする（低リスクとして扱わない）。
 */
export const RISK_RULES = {
  critical: [
    /^\.github\//,
    /^scripts\/pr-gates\.mjs$/,
    /^scripts\/lib\/(codex-gate|deploy-gate|ledger|harness-sync)\./,
    /^scripts\/harness-sync\.mjs$/,
    /^harness\//,
    /^\.claude\//,
    /^(AGENTS|CLAUDE)\.md$/,
    /^docs\/(AUTOPILOT|EVENT-UPDATE)\.md$/,
    /^public\/_headers$/,
    /^vercel\.json$/,
  ],
  foundation: [/^package(-lock)?\.json$/, /^vite\.config\./, /^tsconfig/, /^eslint/, /^scripts\//, /^src\/entry-server\.tsx$/, /^src\/main\.tsx$/],
  minor: [/^docs\/.*\.md$/, /^README\.md$/],
}

/**
 * リスク区分を決める（純粋関数）。ファイルから決まる下限と、申告（PR 台帳の「リスク区分」）の高い方を採る。
 * 申告で下限より下げることはできない（下げるのは人間が台帳ではなくルールを変える場合だけ）。
 * @param {{ files: string[] | null, declared?: string | null, rules?: typeof RISK_RULES }} input
 */
export function classifyRisk({ files, declared = null, rules = RISK_RULES }) {
  const reasons = []
  let fromFiles
  if (!Array.isArray(files) || files.length === 0) {
    fromFiles = 'standard'
    reasons.push('変更ファイルを確認できないため、通常以上として扱う')
  } else if (files.some((f) => rules.critical.some((re) => re.test(f)))) {
    fromFiles = 'critical'
    reasons.push(`重要領域のファイル: ${files.filter((f) => rules.critical.some((re) => re.test(f))).slice(0, 5).join(', ')}`)
  } else if (files.some((f) => rules.foundation.some((re) => re.test(f)))) {
    fromFiles = 'foundation'
    reasons.push(`基盤のファイル: ${files.filter((f) => rules.foundation.some((re) => re.test(f))).slice(0, 5).join(', ')}`)
  } else if (files.every((f) => rules.minor.some((re) => re.test(f)))) {
    fromFiles = 'minor'
    reasons.push('文書だけの変更')
  } else {
    fromFiles = 'standard'
    reasons.push('通常の変更')
  }
  let tier = fromFiles
  const raw = String(declared ?? '').trim()
  if (raw) {
    const key = REVIEW_TIERS[raw] ? raw : TIER_BY_LABEL[raw]
    if (!key) reasons.push(`申告「${raw}」を読めない（無視して、ファイルから決めた区分を使う）`)
    else if (TIER_ORDER.indexOf(key) > TIER_ORDER.indexOf(tier)) {
      tier = key
      reasons.push(`申告により ${REVIEW_TIERS[key].label} に上げる`)
    } else if (TIER_ORDER.indexOf(key) < TIER_ORDER.indexOf(tier)) {
      reasons.push(`申告「${REVIEW_TIERS[key].label}」はファイルから決まる下限より低いため採らない`)
    }
  }
  return { tier, label: REVIEW_TIERS[tier].label, maxReviewRounds: REVIEW_TIERS[tier].maxReviewRounds, fromFiles, reasons }
}

/** 区分を一段上げる（軽微の 1 回目で修正必須の指摘が出たときなど） */
export function raiseTier(tier) {
  return TIER_ORDER[Math.min(TIER_ORDER.indexOf(tier) + 1, TIER_ORDER.length - 1)]
}

const SEVERITY_RE = /!\[(P[0-3]) Badge\]/

/**
 * Codex のレビューを、レビューした commit ごとにまとめる（同種の指摘の繰り返しを見つけるため）。
 * 指摘のなかったレビュー（受領だけの commit）も 1 回として入れる。指摘なしの回をはさめば、繰り返しは途切れる。
 * @param {{login:string, body:string, path?:string, commitId?:string, createdAt?:string}[]} reviewComments PR の行コメント
 * @param {{login:string, body:string, createdAt?:string}[]} [receiptItems] 受領を含む Issue コメントとレビュー（createdAt は投稿・提出の時刻）
 * @returns {{ commit: string, paths: string[], severe: boolean, at: string }[]} 古い順。commit は先頭 7 桁
 */
export function findingRounds(reviewComments, receiptItems = []) {
  const by = new Map()
  const round = (sha, at) => {
    const key = sha.slice(0, 7)
    const r = by.get(key) ?? { commit: key, paths: new Set(), severe: false, at: at ?? '' }
    if (at && (!r.at || at < r.at)) r.at = at
    by.set(key, r)
    return r
  }
  for (const c of receiptItems) {
    if (!isCodex(c.login)) continue
    const sha = (c.body ?? '').match(RECEIPT_RE)?.[1]
    if (sha) round(sha, c.createdAt)
  }
  for (const c of reviewComments) {
    if (!isCodex(c.login) || !c.commitId) continue
    const r = round(c.commitId, c.createdAt)
    if (c.path) r.paths.add(c.path)
    const sev = (c.body ?? '').match(SEVERITY_RE)?.[1]
    if (sev === 'P0' || sev === 'P1') r.severe = true
  }
  return [...by.values()].sort((a, b) => a.at.localeCompare(b.at)).map((r) => ({ ...r, paths: [...r.paths].sort() }))
}

/** 原因分析の記録の目印。対象の commit（指摘を受けた最後の commit）と、追加した回帰テストのファイルを書く */
const ROOT_CAUSE_RE = /<!--\s*harness-root-cause:v1\s*(\{[^}]*\})\s*-->/

export function rootCauseBody(commit, tests, note) {
  return `${note}\n\n<!-- harness-root-cause:v1 ${JSON.stringify({ commit: commit.slice(0, 7), tests })} -->`
}

/**
 * 同種の指摘の繰り返しを判定する（純粋関数）。「同種」は、続けてレビューした commit で同じファイルに指摘があったことで近似する。
 *   - 2 回続いた: 原因分析の記録（目印・回帰テストのファイルが PR の変更に含まれる）がなければ、次の依頼をしない
 *   - 3 回続いた、または直近 3 回のレビューがすべて P0/P1 を含む: 上限が残っていても止めて人間に報告する
 * @param {{ rounds: ReturnType<typeof findingRounds>, comments: {login:string, body:string}[], changedFiles: string[] | null }} input
 */
export function repeatCheck({ rounds, comments, changedFiles }) {
  // 直近の回から、すべての回に共通するファイルを絞り込みながら数える（隣り合う組だけで数えると、別のファイルの連続を同じと数える）
  let streak = 0
  let shared = []
  if (rounds.length && rounds.at(-1).paths.length) {
    shared = rounds.at(-1).paths
    streak = 1
    for (let i = rounds.length - 2; i >= 0; i--) {
      const common = shared.filter((p) => rounds[i].paths.includes(p))
      if (!common.length) break
      shared = common
      streak++
    }
  }
  const last3 = rounds.slice(-3)
  if (streak >= 3) return { action: 'stop', reasons: [`同じファイルへの指摘が ${streak} 回続いた（${shared.join(', ')}）。上限が残っていても止めて人間に報告する`] }
  if (last3.length === 3 && last3.every((r) => r.severe)) return { action: 'stop', reasons: ['直近 3 回のレビューで、続けて P0/P1 の指摘が出た。上限が残っていても止めて人間に報告する'] }
  if (streak === 2) {
    const target = rounds.at(-1).commit.slice(0, 7)
    const notes = comments
      .filter((c) => c.login && !c.login.endsWith('[bot]'))
      .map((c) => (c.body ?? '').match(ROOT_CAUSE_RE)?.[1])
      .filter(Boolean)
      .map((j) => {
        try {
          return JSON.parse(j)
        } catch {
          return null
        }
      })
      .filter((n) => n && String(n.commit).slice(0, 7) === target)
    const ok = notes.some((n) => Array.isArray(n.tests) && n.tests.length > 0 && Array.isArray(changedFiles) && n.tests.every((t) => changedFiles.includes(t)))
    if (!ok) {
      return {
        action: 'block',
        reasons: [`同じファイルへの指摘が 2 回続いた（${shared.join(', ')}）。原因分析と回帰テストを PR に記録してから再レビューを依頼する（目印 harness-root-cause:v1、commit ${target}）`],
      }
    }
    return { action: 'ok', reasons: ['同種の指摘が 2 回続いたが、原因分析と回帰テストの記録がある'] }
  }
  return { action: 'ok', reasons: [] }
}

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
 * @returns {{ action: 'done'|'stop'|'wait'|'request'|'rerequest', verdict: 'PASS'|'FAIL'|'PENDING'|'CAPPED', reasons: string[],
 *   requestsOnHead: number, elapsedMinutes: number|null, roundsUsed: number, requestsTotal: number, maxReviewRounds: number }}
 */
export function planCodexReview({ headSha, headCommittedAt, now, comments, reviews, threads, integration = null, policy = CODEX_POLICY, ci = null, repeat = null }) {
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
  // 有効なレビューの数＝Codex が実際にレビューした（受領のある）commit の数。応答のなかった依頼は数えない
  const commits = new Set(receiptCommits([...comments, ...reviews]).map((s) => s.slice(0, 10)))
  const roundsUsed = commits.size
  const requestsTotal = requests.length
  const maxRequestsTotal = policy.maxReviewRounds * policy.maxRequestsPerCommit
  const base = { verdict: judged.verdict, requestsOnHead: requestCount, roundsUsed, requestsTotal, maxReviewRounds: policy.maxReviewRounds }
  // 依頼・再依頼の前の条件（CI・依頼の総数・同種の指摘の繰り返し）。満たさなければ依頼しない
  const gate = (planned) => {
    if (requestsTotal >= maxRequestsTotal) {
      return { ...base, action: 'stop', elapsedMinutes: null, reasons: [`依頼の総数が上限（${maxRequestsTotal} 回）に達している（応答のない依頼を重ねない）`] }
    }
    if (repeat && repeat.action === 'stop') return { ...base, action: 'stop', elapsedMinutes: null, reasons: repeat.reasons }
    if (repeat && repeat.action === 'block' && planned.action === 'request') return { ...base, action: 'stop', elapsedMinutes: null, reasons: repeat.reasons }
    if (ci === 'FAIL') return { ...base, action: 'stop', elapsedMinutes: null, reasons: ['head の CI が失敗している（CI を直してから依頼する）'] }
    if (ci !== null && ci !== 'PASS') return { ...base, action: 'wait', elapsedMinutes: null, reasons: ['head の CI の完了を待ってから依頼する'] }
    return planned
  }

  if (judged.verdict === 'PASS') return { ...base, action: 'done', elapsedMinutes: null, reasons: judged.reasons }
  if (judged.verdict === 'FAIL') {
    return { ...base, action: 'stop', elapsedMinutes: null, reasons: [...judged.reasons, '指摘に対応して新しい commit を積む（再依頼では解消しない）'] }
  }
  if (onHead.length === 0) {
    const used = commits.has(headSha.slice(0, 10)) ? roundsUsed - 1 : roundsUsed
    if (used >= policy.maxReviewRounds) {
      const limit = `レビュー回数の上限（${policy.maxReviewRounds} 回）に達している`
      const capped = { ...base, verdict: 'CAPPED' }
      if (!integration?.verified) {
        return { ...capped, action: 'stop', elapsedMinutes: null, reasons: [limit, ...(integration ? [`統合の例外に当たらない: ${integration.reason}`] : []), 'CAPPED（合格ではない。人間が判断する）'] }
      }
      if (requests.some((r) => r.kind === 'integration' && !r.forHead)) {
        return { ...capped, action: 'stop', elapsedMinutes: null, reasons: [limit, '統合の例外は PR につき 1 回まで（使用済み）', 'CAPPED（合格ではない。人間が判断する）'] }
      }
      const reviewed = receiptCommits([...comments, ...reviews]).some((sha) => integration.parent?.startsWith(sha))
      if (!reviewed) {
        return { ...capped, action: 'stop', elapsedMinutes: null, reasons: [limit, '取り込む前の commit が Codex にレビューされていない', 'CAPPED（合格ではない。人間が判断する）'] }
      }
      return gate({ ...base, action: 'request', requestKind: 'integration', elapsedMinutes: null, reasons: [limit, `統合の例外として最終確認を依頼する（${integration.reason}）`] })
    }
    return gate({ ...base, action: 'request', requestKind: 'initial', elapsedMinutes: null, reasons: ['head の commit にレビューを依頼していない'] })
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
    return gate({ ...base, action: 'rerequest', elapsedMinutes, reasons: [...judged.reasons, `依頼から ${policy.stallMinutes} 分以上たっても完了しない`] })
  }
  return {
    ...base,
    action: 'stop',
    elapsedMinutes,
    reasons: [...judged.reasons, `同じ commit への依頼が ${requestCount} 回、最後の依頼から ${policy.stallMinutes} 分以上たっても完了しない`],
  }
}
