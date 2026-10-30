export const LEDGER_START: string
export const LEDGER_END: string

export type Ledger = { rows: Record<string, string>; keys: string[] }
export type ChangeEntry = { status: string; paths: string[] }

export function parseLedger(body: string | null | undefined): Ledger | null
export function updateLedgerBody(body: string, updates: Record<string, string>): string
export function checkLedgerOwner(input: {
  ledger: Ledger | null
  session: string
  actualHead: string
  expectedHead?: string
}): { ok: boolean; reasons: string[] }
export function parseAllowed(text: string | null | undefined): string[]
export function parseNameStatusZ(text: string): ChangeEntry[]
export function parsePorcelainZ(text: string): ChangeEntry[]
export function checkScope(input: { allowed: string[]; committed: ChangeEntry[]; working: ChangeEntry[] }): {
  ok: boolean
  changed: string[]
  violations: { path: string; status: string; source: string }[]
  reasons: string[]
}
