export const EV_LIMIT: number
export const TONE_THRESHOLDS: { darkMedian: number; shadowL: number; highlightL: number; highlightShare: number }
export const SRGB_TO_LINEAR: number[]
export function lightness(y: number): number
export function toneCurve(y: number, ev: number): number
export function toneGainLut(ev: number, size?: number): number[]
export type LightnessStats = { mean: number; p05: number; median: number; p95: number; shadowShare: number; highlightShare: number }
export function lightnessStats(hist: number[]): LightnessStats
export function brightnessVerdict(stats: LightnessStats, t?: typeof TONE_THRESHOLDS): { level: 'ok' | 'dark' | 'bright'; reasons: string[] }
export function parsePhotoSpec(spec: string): { name: string; file: string; ratio: string; zoom: number; fx: number; fy: number; ev: number }
