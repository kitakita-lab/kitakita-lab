export type TrustResult = { pins: string[]; hosts: { host: string; verified: boolean; detail: string }[] }
export type ResourceRecord = { type: string; url: string; ok: boolean; status?: number | null; error?: string; outOfScope?: boolean }

export function parsePemChain(text: string): string[]
export function spkiHash(pem: string): string
export function environmentCaPins(hosts: string[]): TrustResult
export const RENDER_TYPES: string[]
export function summarizeResources(records: ResourceRecord[]): {
  byType: Record<string, { loaded: number; failed: number }>
  failed: ResourceRecord[]
  outOfScope: string[]
  verdict: 'VERIFIED' | 'PARTIAL'
}
