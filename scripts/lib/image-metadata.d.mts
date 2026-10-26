export type ImageMetadataResult = {
  format: 'jpeg' | 'png' | 'webp' | 'unknown'
  ok: boolean
  findings: string[]
  error?: string
}

export function inspectImageMetadata(input: Uint8Array): ImageMetadataResult
