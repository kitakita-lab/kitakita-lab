export function parseDeployArgs(args: string[]): {
  urls: string[]
  expect: string | undefined
  wait: number | undefined
  interval: number | undefined
}
