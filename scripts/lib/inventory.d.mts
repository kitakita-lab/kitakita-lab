export const HOLD_MARK: string
export const DEADLINE_MARK: string
export const CATEGORIES: string[]
export const STALE_DAYS: number
export const ABANDON_DAYS: number
export const NO_MERGE_GRACE_DAYS: number
export const WEEK_DAYS: number
export const DUE_SOON_DAYS: number
export const MAX_DECISIONS: number

export type Comment = { id?: number | string; body?: string | null; created_at?: string; updated_at?: string }
export type Record = { id: number | string | null; body: string; recordedAt?: string; edited: boolean; count: number }
type RecordMeta = { id?: number | string | null; recordedAt?: string; edited?: boolean; count?: number }
export type Hold =
  | (RecordMeta & { released: true })
  | (RecordMeta & { released?: undefined; reason: string | null; recheck: string | null; valid: boolean })
export type Deadline = { date: string; source: string; edited?: boolean } | { invalid: true; source: string; date?: undefined }
export type Due = { state: 'overdue' | 'soon' | 'later' | 'unknown'; daysLeft: number | null; urgent: boolean }

export type Item = {
  repo: string
  kind: 'pr' | 'issue'
  number: number
  title: string
  body?: string | null
  draft?: boolean
  created_at: string
  updated_at?: string
  url?: string
  hold?: Hold | null
  deadline?: Deadline | null
}

export type Classified = {
  category: '要判断' | '保留中' | '終了候補' | '不明'
  reasons: string[]
  idleDays: number | null
  ageDays: number | null
  isNew: boolean
  changed: boolean
  stale: boolean
  recommend: string
  hold: Hold | null
  deadline: Deadline | null
  due: Due & { text: string }
}
export type Entry = Item & Classified & { pairedPr: number | null }

export function jstDate(d: Date): string
export function latestRecord(comments: Comment[] | null | undefined, mark: string): Record | null
export function parseHold(comments: Comment[] | null | undefined): Hold | null
export function parseDeadline(input?: {
  body?: string | null
  comments?: Comment[] | null
  milestone?: { due_on?: string | null; title?: string } | null
}): Deadline | null
export function deadlineStatus(deadline: Deadline | null | undefined, now: Date): Due
export function linkedIssues(body: string | null | undefined, repo?: string): number[]
export function snippet(text: string | null | undefined, re: RegExp): string | null
export function classifyItem(item: Omit<Item, 'repo' | 'number'> & Partial<Item>, now: Date): Classified
export function buildInventory(items: Item[], now: Date): Entry[]
export function byPriority(a: Entry, b: Entry): number
export function selectDecisions(inventory: Entry[]): { urgent: Entry[]; others: Entry[]; omitted: number }
export function renderReport(
  inventory: Entry[],
  now: Date,
  status?: { repos?: string[]; failed?: string[]; notion?: string },
): string
export function planRecord(
  comments: Comment[] | null | undefined,
  kind: 'hold' | 'deadline' | string,
  values: { reason?: string; recheck?: string; date?: string; basis?: string },
  options?: { expectLatest?: string | number; today?: string },
): { action: 'write' | 'skip' | 'conflict' | 'error'; reasons: string[]; latestId?: string | number; body?: string }
