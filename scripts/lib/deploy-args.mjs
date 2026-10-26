/** pr-gates.mjs deploy の引数: URL を並べ、任意で `--expect <文字列>`（指定がなければ URL をすべて残す） */
export function parseDeployArgs(args) {
  const i = args.indexOf('--expect')
  if (i < 0) return { urls: args, expect: undefined }
  return { urls: args.filter((_, j) => j !== i && j !== i + 1), expect: args[i + 1] }
}
