import { describe, it, expect } from 'vitest'
import { evaluateCodex, parseCodexState, receiptCommits } from '../../scripts/lib/codex-gate.mjs'

/**
 * Codex レビューの合否判定（scripts/lib/codex-gate.mjs）のテスト。
 * コメントの形式は、実際の PR（#79〜#81）に Codex が残したものに合わせている。
 */
const BOT = 'chatgpt-codex-connector[bot]'
const HEAD = 'd49bf2bd7094c6f1eca7b2001de0e64c8bd01683'
const OLD = '738a869ddf0000000000000000000000000000aa'

const summary = (sha: string, status: string, unresolved: boolean | null, updatedAt = '2026-10-17T22:52:30Z') => ({
  login: BOT,
  updatedAt,
  body: `<!-- codex-pull-request-review-summary -->\n<!-- codex-review-state:v1 {"code_review":{"commit_sha":"${sha}","has_any_findings":${unresolved},"has_unresolved_findings":${unresolved},"status":"${status}"},"security_review":{"commit_sha":null,"has_any_findings":null,"has_unresolved_findings":null,"status":null}} -->\n## Codex Review Summary`,
})
const receipt = (sha: string) => ({
  login: BOT,
  body: `<!-- codex-review-receipt:v1 -->\n\nCodex Review: Didn't find any major issues. Delightful!\n\n**Reviewed commit:** \`${sha.slice(0, 10)}\``,
})
const request = { login: 'kitakita-lab', body: '@codex review' }

describe('evaluateCodex', () => {
  it('最新 commit をレビュー済み・未解決なし・受領ありなら PASS', () => {
    const r = evaluateCodex({
      headSha: HEAD,
      comments: [request, summary(HEAD, 'completed', false), receipt(HEAD)],
      reviews: [],
      threads: [{ resolved: true, outdated: false }],
    })
    expect(r.verdict).toBe('PASS')
  })

  it('要約コメントがなければ PENDING（レビュー依頼だけでは合格にしない）', () => {
    const r = evaluateCodex({ headSha: HEAD, comments: [request], reviews: [], threads: [] })
    expect(r.verdict).toBe('PENDING')
  })

  it('レビュー中（status が completed 以外）は PENDING', () => {
    const r = evaluateCodex({ headSha: HEAD, comments: [summary(HEAD, 'in_progress', null)], reviews: [], threads: [] })
    expect(r.verdict).toBe('PENDING')
  })

  it('古い commit のレビュー結果は PENDING（修正後の再レビューを待つ）', () => {
    const r = evaluateCodex({
      headSha: HEAD,
      comments: [summary(OLD, 'completed', false), receipt(OLD)],
      reviews: [],
      threads: [],
    })
    expect(r.verdict).toBe('PENDING')
    expect(r.reasons[0]).toContain('最新の commit')
  })

  it('未解決の指摘があれば FAIL', () => {
    const r = evaluateCodex({ headSha: HEAD, comments: [summary(HEAD, 'completed', true)], reviews: [], threads: [] })
    expect(r.verdict).toBe('FAIL')
  })

  it('未解決のレビュースレッドが残っていれば FAIL（outdated でも解決扱いにしない）', () => {
    const r = evaluateCodex({
      headSha: HEAD,
      comments: [summary(HEAD, 'completed', false), receipt(HEAD)],
      reviews: [],
      threads: [{ resolved: false, outdated: true }],
    })
    expect(r.verdict).toBe('FAIL')
  })

  it('レビュースレッドを取得できなければ PENDING（合格扱いにしない）', () => {
    const r = evaluateCodex({
      headSha: HEAD,
      comments: [summary(HEAD, 'completed', false), receipt(HEAD)],
      reviews: [],
      threads: null,
    })
    expect(r.verdict).toBe('PENDING')
  })

  it('head の受領（Reviewed commit）がなければ PENDING', () => {
    const r = evaluateCodex({
      headSha: HEAD,
      comments: [summary(HEAD, 'completed', false), receipt(OLD)],
      reviews: [],
      threads: [],
    })
    expect(r.verdict).toBe('PENDING')
  })

  it('受領はレビュー本文（指摘ありのレビュー）からも読む', () => {
    expect(receiptCommits([{ login: BOT, body: '<!-- codex-review-receipt:v1 -->\n### 💡 Codex Review\n**Reviewed commit:** `738a869ddf`' }])).toEqual([
      '738a869ddf',
    ])
  })

  it('Codex 以外のユーザーが書いた state は無視する', () => {
    const fake = { ...summary(HEAD, 'completed', false), login: 'someone' }
    expect(parseCodexState([fake])).toBeNull()
  })

  it('要約コメントが複数あれば、最後に更新されたものを使う', () => {
    const s = parseCodexState([summary(HEAD, 'completed', false, '2026-10-17T23:00:00Z'), summary(OLD, 'completed', true, '2026-10-17T22:00:00Z')])
    expect(s?.code_review?.commit_sha).toBe(HEAD)
  })

  it('壊れた state は null（合格扱いにしない）', () => {
    expect(parseCodexState([{ login: BOT, body: '<!-- codex-review-state:v1 {broken} -->' }])).toBeNull()
  })
})
