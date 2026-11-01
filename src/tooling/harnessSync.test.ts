import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { normalize, revOf, renderBlock, parseBlocks, statusOf, planUpdate, ensureClaudeImport } from '../../scripts/lib/harness-sync.mjs'

/**
 * 共通ハーネスの展開（scripts/lib/harness-sync.mjs・harness/README.md）のテスト。
 * 各リポジトリの AGENTS.md の形（固有ルール＋管理ブロック）を模している。
 */
const V1 = { common: '# 共通\n\n- 規則 1\n', creative: '# 制作\n\n- 比較して決める\n' }
const V2 = { ...V1, common: '# 共通\n\n- 規則 1\n- 規則 2\n' }
const LOCAL = '# repo の作業ルール\n\n## 固有ルール\n\n- main へのマージは人間だけ\n'

describe('revOf / renderBlock', () => {
  it('改行コードや末尾の空白が違っても同じ rev になる', () => {
    expect(revOf('a\r\nb\n\n')).toBe(revOf('a\nb'))
    expect(normalize('\n\na\n  \n')).toBe('a\n')
  })

  it('描いたブロックを読み直すと、本文と rev が一致する', () => {
    const { blocks, errors } = parseBlocks(renderBlock('common', V1.common))
    expect(errors).toEqual([])
    expect(blocks).toHaveLength(1)
    expect(blocks[0].rev).toBe(revOf(V1.common))
    expect(blocks[0].actualRev).toBe(blocks[0].rev)
  })
})

describe('planUpdate', () => {
  it('未導入のリポジトリに追加すると、固有ルールの後ろに入り、固有ルールは変わらない', () => {
    const r = planUpdate(LOCAL, V1, { add: ['common', 'creative'] })
    expect(r.errors).toEqual([])
    expect(r.changed).toBe(true)
    expect(r.text.startsWith(LOCAL)).toBe(true)
    expect(r.changes).toEqual([
      { name: 'common', action: 'added' },
      { name: 'creative', action: 'added' },
    ])
    expect(statusOf(r.text, V1).profiles).toEqual({ common: 'current', creative: 'current' })
  })

  it('同じ正本でもう一度かけても変わらない（変更なし → PR を作らない）', () => {
    const once = planUpdate(LOCAL, V1, { add: ['common'] }).text
    const twice = planUpdate(once, V1, { add: ['common'] })
    expect(twice.changed).toBe(false)
    expect(twice.text).toBe(once)
    expect(twice.changes).toEqual([{ name: 'common', action: 'unchanged' }])
  })

  it('正本が更新されると、導入済みのブロックだけが置き換わり、固有ルールと他のブロックは残る', () => {
    const installed = planUpdate(LOCAL + '\n## 承認条件\n\n- 固有の条件\n', V1, { add: ['common', 'creative'] }).text
    expect(statusOf(installed, V2).profiles).toEqual({ common: 'outdated', creative: 'current' })
    const r = planUpdate(installed, V2)
    expect(r.changes).toEqual([
      { name: 'common', action: 'updated' },
      { name: 'creative', action: 'unchanged' },
    ])
    expect(r.text).toContain('- 規則 2')
    expect(r.text).toContain('- 固有の条件')
    expect(r.text).toContain('- main へのマージは人間だけ')
    expect(statusOf(r.text, V2).profiles).toEqual({ common: 'current', creative: 'current' })
  })

  it('対象外のプロファイルは追加しない（common だけのリポジトリに creative は入らない）', () => {
    const installed = planUpdate(LOCAL, V1, { add: ['common'] }).text
    const r = planUpdate(installed, V2)
    expect(statusOf(r.text, V2).profiles).toEqual({ common: 'current', creative: 'absent' })
  })

  it('既存の管理ブロックがあるときは、その直後に追加する', () => {
    const text = `${LOCAL}\n${renderBlock('common', V1.common)}\n\n## 後ろの固有ルール\n`
    const r = planUpdate(text, V1, { add: ['creative'] })
    const { blocks, lines } = parseBlocks(r.text)
    expect(blocks.map((b) => b.name)).toEqual(['common', 'creative'])
    expect(blocks[1].start).toBeGreaterThan(blocks[0].end)
    expect(lines.indexOf('## 後ろの固有ルール')).toBeGreaterThan(blocks[1].end)
  })

  it('ブロックが手で変更されていたら、何も書き換えない', () => {
    const installed = planUpdate(LOCAL, V1, { add: ['common'] }).text
    const edited = installed.replace('- 規則 1', '- 規則 1（勝手に緩めた）')
    expect(statusOf(edited, V2).profiles.common).toBe('modified')
    const r = planUpdate(edited, V2)
    expect(r.changed).toBe(false)
    expect(r.text).toBe(edited)
    expect(r.errors.join()).toContain('手で変更')
  })

  it('閉じていないブロック・重複・正本にない名前は誤りとして止める', () => {
    const begin = renderBlock('common', V1.common).split('\n').slice(0, -1).join('\n')
    expect(planUpdate(begin, V1).errors.join()).toContain('END がない')
    const block = renderBlock('common', V1.common)
    expect(planUpdate(`${block}\n\n${block}`, V1).errors.join()).toContain('2 つある')
    expect(planUpdate(LOCAL, V1, { add: ['promo'] }).errors.join()).toContain('正本にない')
    expect(statusOf(renderBlock('old', 'x'), V1).profiles.old).toBe('unknown')
  })

  it('他のツールの目印（Next.js の規則ブロックなど）には触れない', () => {
    const next = '<!-- BEGIN:nextjs-agent-rules -->\n# Next.js\n<!-- END:nextjs-agent-rules -->\n\n' + LOCAL
    const r = planUpdate(next, V1, { add: ['common'] })
    expect(r.errors).toEqual([])
    expect(r.text.startsWith(next)).toBe(true)
  })

  it('AGENTS.md がなければ、管理ブロックだけの AGENTS.md を作る', () => {
    const r = planUpdate(null, V1, { add: ['common'] })
    expect(r.changed).toBe(true)
    expect(parseBlocks(r.text).blocks.map((b) => b.name)).toEqual(['common'])
    expect(planUpdate(null, V1).changed).toBe(false)
  })
})

describe('ensureClaudeImport', () => {
  it('CLAUDE.md がなければ @AGENTS.md だけの CLAUDE.md を作る', () => {
    expect(ensureClaudeImport(null)).toEqual({ text: '@AGENTS.md\n', changed: true })
  })
  it('読み込みがなければ先頭に足し、既存の内容は残す', () => {
    const r = ensureClaudeImport('# サイト\n\n本文\n')
    expect(r.changed).toBe(true)
    expect(r.text).toBe('@AGENTS.md\n\n# サイト\n\n本文\n')
  })
  it('すでにあれば変えない', () => {
    expect(ensureClaudeImport('@AGENTS.md\n\n## コマンド\n').changed).toBe(false)
  })
})

describe('正本（harness/profiles）', () => {
  const dir = join(__dirname, '../../harness/profiles')
  const files = readdirSync(dir).filter((f) => f.endsWith('.md'))

  it('common がある', () => {
    expect(files).toContain('common.md')
  })

  it.each(files)('%s は公開リポジトリに置けて、AGENTS.md に収まる大きさ', (f) => {
    const text = readFileSync(join(dir, f), 'utf8')
    // Codex が読む AGENTS.md の既定の上限（32 KiB）に、固有ルールと合わせて収まるよう小さく保つ
    expect(Buffer.byteLength(text)).toBeLessThan(8 * 1024)
    // 公開リポジトリのため、Notion の URL・ID やメールアドレスを書かない
    expect(text).not.toMatch(/notion\.(so|site|com)|[0-9a-f]{32}|[\w.+-]+@[\w-]+\.[a-z]{2,}/)
    // 管理ブロックの目印を本文に含めない（入れ子になる）
    expect(text).not.toContain('kitakita-harness')
  })
})
