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
