export type PageState = 'ok' | 'waiting' | 'blocked' | 'failed'
export type PageClass = { state: PageState; reason: string; expectFound?: boolean | null; network?: boolean }

export function classifyNetworkError(e: { code?: number; message?: string }): PageClass
export function classifyPage(r: {
  status?: number | null
  body?: string
  expect?: string
  error?: { code?: number; message?: string }
}): PageClass
export function decideDeploy(input: {
  deploy: 'pending' | 'success' | 'failure'
  pages: { url: string; state: PageState; reason: string; network?: boolean }[]
  expectGiven: boolean
  deadlineReached: boolean
}): { done: boolean; verdict: 'VERIFIED' | 'FAIL' | 'PENDING' | 'DEPLOYED_UNVERIFIED'; reasons: string[] }
