export const SOURCE: string

export type ProfileState = 'current' | 'outdated' | 'modified' | 'absent' | 'unknown'
export type Block = { name: string; rev: string; start: number; end: number; body: string; actualRev: string }
export type Change = { name: string; action: 'unchanged' | 'updated' | 'added' }

export function normalize(text: string): string
export function revOf(body: string): string
export function renderBlock(name: string, body: string): string
export function parseBlocks(text: string): { lines: string[]; blocks: Block[]; errors: string[] }
export function statusOf(
  agentsText: string | null | undefined,
  canonical: Record<string, string>,
): { profiles: Record<string, ProfileState>; errors: string[] }
export function planUpdate(
  agentsText: string | null | undefined,
  canonical: Record<string, string>,
  options?: { add?: string[] },
): { text: string; changes: Change[]; errors: string[]; changed: boolean }
export function ensureClaudeImport(claudeText: string | null | undefined): { text: string; changed: boolean }
export function findReviewLimitRules(files: { path: string; text: string | null }[]): { path: string; line: number; text: string }[]
