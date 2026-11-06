export const HOLD_MARK: string
export const CATEGORIES: string[]
export const STALE_DAYS: number
export const ABANDON_DAYS: number
export const NO_MERGE_GRACE_DAYS: number
export const WEEK_DAYS: number

export type Comment = { body?: string | null; created_at?: string }
export type Hold =
  | { released: true; recordedAt?: string }
  | { released?: undefined; reason: string | null; recheck: string | null; recordedAt?: string; valid: boolean }

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
}

export function parseHold(comments: Comment[] | null | undefined): Hold | null
export function linkedIssues(body: string | null | undefined): number[]
export function classifyItem(item: Omit<Item, 'repo' | 'number'> & Partial<Item>, now: Date): Classified
export function buildInventory(items: Item[], now: Date): (Item & Classified & { pairedPr: number | null })[]
export function renderReport(inventory: (Item & Classified & { pairedPr: number | null })[], now: Date): string
export function snippet(text: string | null | undefined, re: RegExp): string | null
