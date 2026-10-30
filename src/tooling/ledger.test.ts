import { describe, it, expect } from 'vitest'
import {
  LEDGER_START,
  LEDGER_END,
  parseLedger,
  updateLedgerBody,
  checkLedgerOwner,
  parseAllowed,
  parseNameStatusZ,
  parsePorcelainZ,
  checkScope,
} from '../../scripts/lib/ledger.mjs'

/**
 * 進捗台帳と変更範囲の検査（scripts/lib/ledger.mjs）のテスト。
 * 台帳の形式は docs/AUTOPILOT.md §4、実際の PR #96 の本文に合わせている。
 */
const SESSION = 'https://claude.ai/code/session_A'
const HEAD = 'c10687020ce3578811c6339609300161f4d706be'
const NEW = '48b47e5e75a4208c7e3e1e0eec2433662594893f'

const body = (rows: string) => `## 概要

本文。| 縦棒を含む行 |

${LEDGER_START}
## 進捗台帳（AI 司令塔）

| 項目 | 値 |
|---|---|
${rows}
${LEDGER_END}

フッター`

const base = body(`| セッション | ${SESSION} |
| 工程 | 7/15 Draft PR 作成 |
| head | c106870 |
| 許可ファイル | docs/AUTOPILOT.md, CLAUDE.md |`)

describe('parseLedger', () => {
  it('目印の内側の表だけを読む（見出し行・区切り行・目印の外は読まない）', () => {
    const l = parseLedger(base)
    expect(l?.rows).toEqual({
      セッション: SESSION,
      工程: '7/15 Draft PR 作成',
      head: 'c106870',
      許可ファイル: 'docs/AUTOPILOT.md, CLAUDE.md',
    })
    expect(l?.keys).toEqual(['セッション', '工程', 'head', '許可ファイル'])
  })

  it('目印がない・順序が逆・2 組以上あるときは null', () => {
    expect(parseLedger('台帳なし')).toBeNull()
    expect(parseLedger(`${LEDGER_END}\n| a | b |\n${LEDGER_START}`)).toBeNull()
    expect(parseLedger(`${base}\n${LEDGER_START}\n${LEDGER_END}`)).toBeNull()
    expect(parseLedger(null)).toBeNull()
  })
})

describe('updateLedgerBody', () => {
  it('指定した行の値だけを書き換え、目印の外側は変えない', () => {
    const next = updateLedgerBody(base, { 工程: '9/15 Codex 待ち', head: '48b47e5' })
    expect(parseLedger(next)?.rows['工程']).toBe('9/15 Codex 待ち')
    expect(parseLedger(next)?.rows['head']).toBe('48b47e5')
    expect(parseLedger(next)?.rows['セッション']).toBe(SESSION)
    expect(next.slice(0, next.indexOf(LEDGER_START))).toBe(base.slice(0, base.indexOf(LEDGER_START)))
    expect(next.slice(next.indexOf(LEDGER_END))).toBe(base.slice(base.indexOf(LEDGER_END)))
  })

  it('ない項目は表の末尾に足す。値の改行と縦棒は表を壊さない形にする', () => {
    const next = updateLedgerBody(base, { Notion: '反映済み | 7/15\n第 2 行' })
    const l = parseLedger(next)
    expect(l?.keys.at(-1)).toBe('Notion')
    expect(l?.rows['Notion']).toBe('反映済み ／ 7/15 第 2 行')
    expect(l?.rows['許可ファイル']).toBe('docs/AUTOPILOT.md, CLAUDE.md')
  })

  it('同じ内容で 2 回更新しても行は増えない', () => {
    const once = updateLedgerBody(base, { Notion: '反映済み' })
    expect(updateLedgerBody(once, { Notion: '反映済み' })).toBe(once)
  })

  it('台帳がなければ書き換えない（例外）', () => {
    expect(() => updateLedgerBody('台帳なし', { 工程: 'x' })).toThrow()
  })
})

describe('checkLedgerOwner', () => {
  const ledger = parseLedger(base)

  it('セッションと head が一致すれば ok', () => {
    expect(checkLedgerOwner({ ledger, session: SESSION, actualHead: HEAD })).toEqual({ ok: true, reasons: [] })
  })

  it('自分が push した commit（expectedHead）なら、台帳の head が古くても ok', () => {
    expect(checkLedgerOwner({ ledger, session: SESSION, actualHead: NEW, expectedHead: '48b47e5' }).ok).toBe(true)
  })

  it('別のセッションの台帳には書き込まない', () => {
    const r = checkLedgerOwner({ ledger, session: 'https://claude.ai/code/session_B', actualHead: HEAD })
    expect(r.ok).toBe(false)
    expect(r.reasons.join()).toContain('台帳のセッションが自分ではない')
  })

  it('head が予期せず動いていたら止める（台帳とも期待値とも違う）', () => {
    const r = checkLedgerOwner({ ledger, session: SESSION, actualHead: NEW })
    expect(r.ok).toBe(false)
    expect(r.reasons.join()).toContain('台帳の head')
    const r2 = checkLedgerOwner({ ledger, session: SESSION, actualHead: NEW, expectedHead: 'deadbee' })
    expect(r2.reasons.join()).toContain('期待する commit')
  })

  it('台帳が読めない・head が取れない・セッション未指定は ok にしない', () => {
    expect(checkLedgerOwner({ ledger: null, session: SESSION, actualHead: HEAD }).ok).toBe(false)
    expect(checkLedgerOwner({ ledger, session: SESSION, actualHead: '' }).ok).toBe(false)
    expect(checkLedgerOwner({ ledger, session: '', actualHead: HEAD }).ok).toBe(false)
    const noHead = parseLedger(body(`| セッション | ${SESSION} |`))
    expect(checkLedgerOwner({ ledger: noHead, session: SESSION, actualHead: HEAD }).reasons.join()).toContain('台帳の head が読めない')
  })
})

describe('parseAllowed', () => {
  it('カンマ・読点・改行区切りとバッククォートを受け付ける', () => {
    expect(parseAllowed('docs/AUTOPILOT.md, `CLAUDE.md`、scripts/a.mjs\nb.ts')).toEqual([
      'docs/AUTOPILOT.md',
      'CLAUDE.md',
      'scripts/a.mjs',
      'b.ts',
    ])
    expect(parseAllowed(undefined)).toEqual([])
  })

  it('パスの中の空白は区切りにしない', () => {
    expect(parseAllowed('notes/new file.md, `docs/a b.md`')).toEqual(['notes/new file.md', 'docs/a b.md'])
  })
})

describe('parseNameStatusZ / parsePorcelainZ', () => {
  it('commit 済みの差分: 変更・追加・削除・リネーム（元と新）', () => {
    const z = ['M', 'CLAUDE.md', 'A', 'docs/new.md', 'D', 'old.txt', 'R087', 'src/a.ts', 'src/b.ts', ''].join('\0')
    expect(parseNameStatusZ(z)).toEqual([
      { status: 'M', paths: ['CLAUDE.md'] },
      { status: 'A', paths: ['docs/new.md'] },
      { status: 'D', paths: ['old.txt'] },
      { status: 'R', paths: ['src/a.ts', 'src/b.ts'] },
    ])
  })

  it('未 commit の変更: ステージ済み・未ステージ・未追跡・削除・リネーム（新と元）・空白を含むパス', () => {
    const z = ['M  CLAUDE.md', ' M docs/AUTOPILOT.md', '?? notes/new file.md', ' D gone.txt', 'R  b.ts', 'a.ts', ''].join('\0')
    expect(parsePorcelainZ(z)).toEqual([
      { status: 'M', paths: ['CLAUDE.md'] },
      { status: 'M', paths: ['docs/AUTOPILOT.md'] },
      { status: '?', paths: ['notes/new file.md'] },
      { status: 'D', paths: ['gone.txt'] },
      { status: 'R', paths: ['b.ts', 'a.ts'] },
    ])
  })

  it('壊れた出力は推測で読まない（例外）', () => {
    expect(() => parseNameStatusZ(['R100', 'only-one'].join('\0'))).toThrow()
    expect(() => parsePorcelainZ('XY')).toThrow()
    expect(() => parsePorcelainZ(['R  new.ts'].join('\0'))).toThrow()
  })
})

describe('checkScope', () => {
  const allowed = ['docs/AUTOPILOT.md', 'CLAUDE.md', 'src/b.ts']

  it('すべて許可ファイルの中なら ok', () => {
    const r = checkScope({
      allowed,
      committed: [{ status: 'M', paths: ['docs/AUTOPILOT.md'] }],
      working: [{ status: 'M', paths: ['CLAUDE.md'] }],
    })
    expect(r).toMatchObject({ ok: true, changed: ['CLAUDE.md', 'docs/AUTOPILOT.md'], violations: [] })
  })

  it('未追跡・削除・リネームの元のパスも、許可ファイルの外なら検出する', () => {
    const r = checkScope({
      allowed,
      committed: [{ status: 'R', paths: ['src/a.ts', 'src/b.ts'] }],
      working: [
        { status: '?', paths: ['tmp/debug.log'] },
        { status: 'D', paths: ['public/robots.txt'] },
      ],
    })
    expect(r.ok).toBe(false)
    expect(r.violations.map((v) => v.path).sort()).toEqual(['public/robots.txt', 'src/a.ts', 'tmp/debug.log'])
    expect(r.reasons.join()).toContain('未 commit')
  })

  it('空白を含む許可ファイルも、git の出力（NUL 区切り）と同じパスとして照合する', () => {
    const allowedWithSpace = parseAllowed('notes/new file.md, CLAUDE.md')
    const ok = checkScope({
      allowed: allowedWithSpace,
      committed: parseNameStatusZ(['A', 'notes/new file.md', ''].join('\0')),
      working: parsePorcelainZ([' M CLAUDE.md', ''].join('\0')),
    })
    expect(ok.ok).toBe(true)
    // 空白で分けた名前（notes/new・file.md）は許可しない
    const ng = checkScope({ allowed: allowedWithSpace, committed: [{ status: 'A', paths: ['file.md'] }], working: [] })
    expect(ng.ok).toBe(false)
  })

  it('許可ファイルが空なら ok にしない', () => {
    expect(checkScope({ allowed: [], committed: [], working: [] }).ok).toBe(false)
  })
})
