/**
 * pr-gates.mjs deploy の引数: URL を並べ、任意で `--expect <文字列>`（指定がなければ URL をすべて残す）。
 * `--wait <秒>`（反映待ちを再試行する上限。既定 300、0 で 1 回だけ）・`--interval <秒>`（再試行の間隔。既定 15）。
 */
export function parseDeployArgs(args) {
  const rest = [...args]
  const take = (name) => {
    const i = rest.indexOf(name)
    if (i < 0) return undefined
    const [, value] = rest.splice(i, 2)
    return value
  }
  const expect = take('--expect')
  const wait = take('--wait')
  const interval = take('--interval')
  const num = (v, name) => {
    if (v === undefined) return undefined
    const n = Number(v)
    if (!Number.isFinite(n) || n < 0) throw new Error(`${name} は 0 以上の秒数で指定する: ${v}`)
    return n
  }
  return { urls: rest, expect, wait: num(wait, '--wait'), interval: num(interval, '--interval') }
}
