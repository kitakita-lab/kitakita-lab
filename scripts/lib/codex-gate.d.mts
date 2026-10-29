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
export function codexRequestBody(sha: string, kind: 'initial' | 'rerequest'): string
export type CodexRequest = { sha: string | null; kind: string; at: string; forHead: boolean }
export function codexRequests(comments: (CodexComment & { createdAt?: string })[], headSha: string, headCommittedAt?: string): CodexRequest[]
export type CodexPlan = {
  action: 'done' | 'stop' | 'wait' | 'request' | 'rerequest'
  verdict: 'PASS' | 'PENDING' | 'FAIL'
  reasons: string[]
  requestsOnHead: number
  elapsedMinutes: number | null
  roundsUsed: number
}
export function planCodexReview(input: {
  headSha: string
  headCommittedAt?: string
  now: string
  comments: (CodexComment & { createdAt?: string })[]
  reviews: CodexComment[]
  threads: CodexThread[] | null
  policy?: { stallMinutes: number; maxRequestsPerCommit: number; maxReviewRounds: number }
}): CodexPlan
