export const CODEX_LOGIN: string

export type CodexComment = { login: string; body: string; updatedAt?: string }
export type CodexThread = { resolved: boolean; outdated?: boolean }
export type CodexVerdict = {
  verdict: 'PASS' | 'PENDING' | 'FAIL'
  reasons: string[]
  findingsOnHead?: boolean
}

export function parseCodexState(comments: CodexComment[]): {
  code_review?: {
    commit_sha: string | null
    has_any_findings: boolean | null
    has_unresolved_findings: boolean | null
    status: string | null
  }
} | null

export function receiptCommits(items: CodexComment[]): string[]

export function evaluateCodex(input: {
  headSha: string
  comments: CodexComment[]
  reviews: CodexComment[]
  threads: CodexThread[] | null
}): CodexVerdict

export const CODEX_POLICY: { stallMinutes: number; maxRequestsPerCommit: number; maxReviewRounds: number }
export type ReviewTier = 'minor' | 'standard' | 'foundation' | 'critical'
export const REVIEW_TIERS: Record<ReviewTier, { label: string; maxReviewRounds: number }>
export const RISK_RULES: Record<'critical' | 'foundation' | 'minor', RegExp[]>
export function classifyRisk(input: { files: string[] | null; declared?: string | null; rules?: Record<'critical' | 'foundation' | 'minor', RegExp[]> }): {
  tier: ReviewTier
  label: string
  maxReviewRounds: number
  fromFiles: ReviewTier
  reasons: string[]
}
export function raiseTier(tier: ReviewTier): ReviewTier
export type FindingRound = { commit: string; paths: string[]; severe: boolean; at: string }
export function findingRounds(reviewComments: { login: string; body: string; path?: string; commitId?: string; createdAt?: string }[]): FindingRound[]
export function rootCauseBody(commit: string, tests: string[], note: string): string
export type RepeatResult = { action: 'ok' | 'block' | 'stop'; reasons: string[] }
export function repeatCheck(input: { rounds: FindingRound[]; comments: CodexComment[]; changedFiles: string[] | null }): RepeatResult
export function codexRequestBody(sha: string, kind: 'initial' | 'rerequest' | 'integration'): string
export type CodexRequest = { sha: string | null; kind: string; at: string; forHead: boolean }
export function codexRequests(comments: (CodexComment & { createdAt?: string })[], headSha: string, headCommittedAt?: string): CodexRequest[]
export type CodexPlan = {
  action: 'done' | 'stop' | 'wait' | 'request' | 'rerequest'
  requestKind?: 'initial' | 'integration'
  verdict: 'PASS' | 'PENDING' | 'FAIL' | 'CAPPED'
  reasons: string[]
  requestsOnHead: number
  elapsedMinutes: number | null
  roundsUsed: number
  requestsTotal: number
  maxReviewRounds: number
}
export function planCodexReview(input: {
  headSha: string
  headCommittedAt?: string
  now: string
  comments: (CodexComment & { createdAt?: string })[]
  reviews: CodexComment[]
  threads: CodexThread[] | null
  integration?: { verified: boolean; reason: string; parent?: string } | null
  policy?: { stallMinutes: number; maxRequestsPerCommit: number; maxReviewRounds: number }
  ci?: 'PASS' | 'PENDING' | 'FAIL' | null
  repeat?: RepeatResult | null
}): CodexPlan
