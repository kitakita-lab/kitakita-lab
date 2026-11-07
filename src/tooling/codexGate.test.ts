import { describe, it, expect } from 'vitest'
import { evaluateCodex, parseCodexState, receiptCommits, planCodexReview, codexRequests, codexRequestBody, CODEX_POLICY, classifyRisk, raiseTier, findingRounds, repeatCheck, rootCauseBody } from '../../scripts/lib/codex-gate.mjs'
import { parseDeployArgs } from '../../scripts/lib/deploy-args.mjs'

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

  it('Codex に似た名前のアカウント（前方一致）が書いた state・受領は信用しない', () => {
    const login = 'chatgpt-codex-connector-fake'
    const r = evaluateCodex({
      headSha: HEAD,
      comments: [{ ...summary(HEAD, 'completed', false), login }, { ...receipt(HEAD), login }],
      reviews: [],
      threads: [],
    })
    expect(r.verdict).toBe('PENDING')
  })

  it('要約コメントが複数あれば、最後に更新されたものを使う', () => {
    const s = parseCodexState([summary(HEAD, 'completed', false, '2026-10-17T23:00:00Z'), summary(OLD, 'completed', true, '2026-10-17T22:00:00Z')])
    expect(s?.code_review?.commit_sha).toBe(HEAD)
  })

  it('壊れた state は null（合格扱いにしない）', () => {
    expect(parseCodexState([{ login: BOT, body: '<!-- codex-review-state:v1 {broken} -->' }])).toBeNull()
  })
})

/**
 * レビュー依頼の運用（planCodexReview）。合否は evaluateCodex が決め、ここでは「次に何をするか」だけを決める。
 * PR #84 では、12:30:54 の依頼に Codex が 12:31:15 に running と応答したまま約 90 分止まり、
 * 13:59:26 の再依頼で 14:00:58 に完了した。
 */
describe('planCodexReview', () => {
  const COMMITTED = '2026-10-29T12:28:00Z'
  const req = (at: string, body = '@codex review') => ({ login: 'kitakita-lab', body, createdAt: at })
  const marked = (sha: string, kind: 'initial' | 'rerequest', at: string) => ({ login: 'kitakita-lab', body: codexRequestBody(sha, kind), createdAt: at })
  const running = (sha: string, updatedAt: string) => summary(sha, 'running', null, updatedAt)
  const plan = (comments: Parameters<typeof planCodexReview>[0]['comments'], now: string, extra: Partial<Parameters<typeof planCodexReview>[0]> = {}) =>
    planCodexReview({ headSha: HEAD, headCommittedAt: COMMITTED, now, comments, reviews: [], threads: [], ...extra })

  it('head への依頼がなければ request', () => {
    expect(plan([], '2026-10-29T12:29:00Z').action).toBe('request')
  })

  it('依頼から 30 分未満なら wait（PENDING のまま）', () => {
    const r = plan([req('2026-10-29T12:30:54Z'), running(HEAD, '2026-10-29T12:31:15Z')], '2026-10-29T12:50:00Z')
    expect(r.action).toBe('wait')
    expect(r.verdict).toBe('PENDING')
  })

  it('PR #84 の再現: 依頼から 30 分たっても running なら、同じ commit に再依頼する', () => {
    const r = plan([req('2026-10-29T12:30:54Z'), running(HEAD, '2026-10-29T12:31:15Z')], '2026-10-29T13:01:00Z')
    expect(r.action).toBe('rerequest')
    expect(r.requestsOnHead).toBe(1)
  })

  it('再依頼の後は、再依頼から 30 分は待つ', () => {
    const r = plan([req('2026-10-29T12:30:54Z'), running(HEAD, '2026-10-29T12:31:15Z'), marked(HEAD, 'rerequest', '2026-10-29T13:01:00Z')], '2026-10-29T13:20:00Z')
    expect(r.action).toBe('wait')
  })

  it('再依頼から 30 分たっても完了しなければ stop（3 回目は依頼しない。PENDING のまま）', () => {
    const r = plan([req('2026-10-29T12:30:54Z'), running(HEAD, '2026-10-29T12:31:15Z'), marked(HEAD, 'rerequest', '2026-10-29T13:01:00Z')], '2026-10-29T13:40:00Z')
    expect(r.action).toBe('stop')
    expect(r.verdict).toBe('PENDING')
    expect(r.requestsOnHead).toBe(CODEX_POLICY.maxRequestsPerCommit)
  })

  it('手動の依頼が 2 回あれば、それ以上は依頼しない（重複依頼の防止）', () => {
    const r = plan([req('2026-10-29T12:30:54Z'), req('2026-10-29T12:31:30Z')], '2026-10-29T13:40:00Z')
    expect(r.action).toBe('stop')
  })

  it('PR #84 の再現: 再依頼の後に完了・受領ありなら done（PASS）', () => {
    const r = plan(
      [req('2026-10-29T12:30:54Z'), summary(HEAD, 'completed', false, '2026-10-29T14:01:00Z'), req('2026-10-29T13:59:26Z'), receipt(HEAD)],
      '2026-10-29T14:01:10Z',
    )
    expect(r.action).toBe('done')
    expect(r.verdict).toBe('PASS')
  })

  it('完了していても受領がなければ PASS にしない（wait）', () => {
    const r = plan([req('2026-10-29T12:30:54Z'), summary(HEAD, 'completed', false, '2026-10-29T12:40:00Z')], '2026-10-29T12:41:00Z')
    expect(r.verdict).toBe('PENDING')
    expect(r.action).toBe('wait')
  })

  it('未解決の指摘（FAIL）は、時間がたっても再依頼せず stop', () => {
    const r = plan([req('2026-10-29T12:30:54Z'), summary(HEAD, 'completed', true, '2026-10-29T12:40:00Z'), receipt(HEAD)], '2026-10-29T14:00:00Z')
    expect(r.action).toBe('stop')
    expect(r.verdict).toBe('FAIL')
  })

  it('head の commit より前の手動の依頼は、head への依頼として数えない', () => {
    const r = plan([req('2026-10-29T12:00:00Z'), summary(OLD, 'completed', false, '2026-10-29T12:05:00Z'), receipt(OLD)], '2026-10-29T12:29:00Z')
    expect(r.action).toBe('request')
    expect(r.requestsOnHead).toBe(0)
  })

  it('依頼がなくても Codex が head を running なら、依頼を重ねずに待つ（自動レビュー）', () => {
    const r = plan([running(HEAD, '2026-10-29T12:29:30Z')], '2026-10-29T12:40:00Z')
    expect(r.action).toBe('wait')
  })

  it('自動レビューの後に再依頼したら、要約が再依頼の後に更新されても 2 回目の再依頼はしない（Codex の指摘 #85）', () => {
    // 12:29:30 自動で running → 13:00 再依頼 → 13:00:20 要約が running のまま更新 → 13:31 時点
    const r = plan([running(HEAD, '2026-10-29T13:00:20Z'), marked(HEAD, 'rerequest', '2026-10-29T13:00:00Z')], '2026-10-29T13:31:00Z')
    expect(r.requestsOnHead).toBe(2)
    expect(r.action).toBe('stop')
  })

  it('自動レビューが依頼より前に始まっていれば、最初の依頼として数える', () => {
    const r = plan([running(HEAD, '2026-10-29T12:29:30Z'), marked(HEAD, 'rerequest', '2026-10-29T13:00:00Z')], '2026-10-29T13:31:00Z')
    expect(r.requestsOnHead).toBe(2)
    expect(r.action).toBe('stop')
  })

  it('依頼の後に running になった要約は、自動レビューとして数えない（依頼への応答）', () => {
    const r = plan([req('2026-10-29T12:30:54Z'), running(HEAD, '2026-10-29T12:31:15Z')], '2026-10-29T12:40:00Z')
    expect(r.requestsOnHead).toBe(1)
  })

  it('Codex の要約に含まれる「@codex review」の文字列は依頼として数えない', () => {
    expect(codexRequests([{ login: BOT, body: 'Comment "@codex review" or "@codex security review".', createdAt: '2026-10-29T12:40:00Z' }], HEAD, COMMITTED)).toEqual([])
  })

  it('「@codex security review」は通常のレビュー依頼として数えない', () => {
    expect(codexRequests([req('2026-10-29T12:40:00Z', '@codex security review')], HEAD, COMMITTED)).toEqual([])
  })

  it('目印付きの依頼は、目印の commit への依頼として数える（古い commit への依頼は head に数えない）', () => {
    const r = codexRequests([marked(OLD, 'initial', '2026-10-29T12:40:00Z'), marked(HEAD, 'initial', '2026-10-29T12:41:00Z')], HEAD, COMMITTED)
    expect(r.map((x) => [x.sha, x.forHead])).toEqual([
      [OLD, false],
      [HEAD, true],
    ])
  })

  it('レビュー回数の上限: 別の 3 commit をレビュー済みなら、新しい head には依頼しない', () => {
    const shas = ['a1a1a1a1a1', 'b2b2b2b2b2', 'c3c3c3c3c3']
    const r = plan(shas.map((s) => receipt(s.padEnd(40, '0'))), '2026-10-29T12:29:00Z')
    expect(r.action).toBe('stop')
    expect(r.reasons.join()).toContain('上限')
  })

  it('同じ commit への再依頼・応答のない依頼は、レビュー回数に数えない（受領のある commit だけを数える）', () => {
    const r = plan(
      [receipt('a1a1a1a1a1'.padEnd(40, '0')), receipt('b2b2b2b2b2'.padEnd(40, '0')), marked(HEAD, 'initial', '2026-10-29T12:30:00Z'), running(HEAD, '2026-10-29T12:30:20Z')],
      '2026-10-29T13:01:00Z',
    )
    expect(r.roundsUsed).toBe(2)
    expect(r.requestsTotal).toBe(1)
    expect(r.action).toBe('rerequest')
  })

  it('応答のなかった古い commit への依頼は回数に数えず、新しい head に依頼できる', () => {
    const r = plan([receipt('a1a1a1a1a1'.padEnd(40, '0')), marked(OLD, 'initial', '2026-10-29T12:00:00Z'), marked(OLD, 'rerequest', '2026-10-29T12:20:00Z')], '2026-10-29T12:29:00Z')
    expect(r.roundsUsed).toBe(1)
    expect(r.action).toBe('request')
  })

  it('上限に達して head が未レビューなら CAPPED（合格ではない）', () => {
    const shas = ['a1a1a1a1a1', 'b2b2b2b2b2', 'c3c3c3c3c3']
    const r = plan(shas.map((s) => receipt(s.padEnd(40, '0'))), '2026-10-29T12:29:00Z')
    expect(r.verdict).toBe('CAPPED')
    expect(r.action).toBe('stop')
  })

  it('依頼の総数が上限（レビュー上限×同じ commit への依頼の上限）に達したら、新しい依頼をしない', () => {
    const many = Array.from({ length: 6 }, (_, i) => marked(`${i}`.repeat(40), 'initial', `2026-10-29T12:0${i}:00Z`))
    const r = plan(many, '2026-10-29T12:29:00Z')
    expect(r.action).toBe('stop')
    expect(r.reasons.join()).toContain('依頼の総数')
  })

  it('CI が失敗していれば依頼しない（stop）、実行中なら待つ（wait）、成功なら依頼する', () => {
    expect(plan([], '2026-10-29T12:29:00Z', { ci: 'FAIL' })).toMatchObject({ action: 'stop', verdict: 'PENDING' })
    expect(plan([], '2026-10-29T12:29:00Z', { ci: 'PENDING' }).action).toBe('wait')
    expect(plan([], '2026-10-29T12:29:00Z', { ci: 'PASS' }).action).toBe('request')
  })

  it('再依頼の前にも CI を確かめる', () => {
    expect(plan([req('2026-10-29T12:30:54Z')], '2026-10-29T13:01:00Z', { ci: 'FAIL' }).action).toBe('stop')
  })

  it('リスク区分の上限を使う: 軽微（1 回）は 1 commit をレビュー済みなら CAPPED、重要領域（5 回）は 3 commit 後も依頼する', () => {
    const three = ['a1a1a1a1a1', 'b2b2b2b2b2', 'c3c3c3c3c3'].map((s) => receipt(s.padEnd(40, '0')))
    expect(plan(three.slice(0, 1), '2026-10-29T12:29:00Z', { policy: { ...CODEX_POLICY, maxReviewRounds: 1 } }).verdict).toBe('CAPPED')
    expect(plan(three, '2026-10-29T12:29:00Z', { policy: { ...CODEX_POLICY, maxReviewRounds: 5 } }).action).toBe('request')
  })

  it('同種の指摘の繰り返し: block なら新しい依頼をしない、stop なら止める（どちらも合格にしない）', () => {
    const block = plan([], '2026-10-29T12:29:00Z', { repeat: { action: 'block', reasons: ['原因分析が必要'] } })
    expect(block).toMatchObject({ action: 'stop', verdict: 'PENDING' })
    const stop = plan([], '2026-10-29T12:29:00Z', { repeat: { action: 'stop', reasons: ['3 回続いた'] } })
    expect(stop.action).toBe('stop')
    // 依頼済みの head の停滞による再依頼は、block では止めない（同じ commit の応答待ち）
    expect(plan([req('2026-10-29T12:30:54Z')], '2026-10-29T13:01:00Z', { repeat: { action: 'block', reasons: ['x'] } }).action).toBe('rerequest')
  })

  it('依頼の時刻を読めなければ stop（合格扱いにしない）', () => {
    const r = plan([{ login: 'kitakita-lab', body: codexRequestBody(HEAD, 'initial'), createdAt: 'not-a-date' }], '2026-10-29T13:00:00Z')
    expect(r.action).toBe('stop')
    expect(r.verdict).toBe('PENDING')
  })

  it('レビュースレッドを取得できなければ PASS にしない', () => {
    const r = plan([req('2026-10-29T12:30:54Z'), summary(HEAD, 'completed', false, '2026-10-29T12:40:00Z'), receipt(HEAD)], '2026-10-29T12:41:00Z', { threads: null })
    expect(r.verdict).toBe('PENDING')
  })
})

/**
 * 統合の例外（上限 3 回の後、最新 main の取り込みだけの merge commit に最終確認を 1 回だけ）。
 * PR #87 では 3 回目の PASS の後に main を取り込み（5342c3e）、最終確認のレビューで PASS してマージした。
 */
describe('planCodexReview（統合の例外）', () => {
  const COMMITTED = '2026-10-29T12:28:00Z'
  const PRE = 'c3c3c3c3c3'.padEnd(40, '0')
  const three = [receipt('a1a1a1a1a1'.padEnd(40, '0')), receipt('b2b2b2b2b2'.padEnd(40, '0')), receipt(PRE)]
  const verified = { verified: true, reason: 'main の取り込みだけ', parent: PRE }
  const plan = (comments: Parameters<typeof planCodexReview>[0]['comments'], integration: Parameters<typeof planCodexReview>[0]['integration'], now = '2026-10-29T12:29:00Z') =>
    planCodexReview({ headSha: HEAD, headCommittedAt: COMMITTED, now, comments, reviews: [], threads: [], integration })

  it('上限に達していても、取り込みだけの merge commit なら最終確認を依頼する（種別 integration）', () => {
    const r = plan(three, verified)
    expect(r.action).toBe('request')
    expect(r.requestKind).toBe('integration')
  })

  it('取り込み以外の変更を含む・merge commit でない場合は、上限で止める（例外を流用しない）', () => {
    expect(plan(three, { verified: false, reason: 'main 側で変わっていないファイルを変更している: src/x.ts', parent: PRE }).action).toBe('stop')
    expect(plan(three, null).action).toBe('stop')
  })

  it('統合の例外は PR につき 1 回まで', () => {
    const used = { login: 'kitakita-lab', body: codexRequestBody(OLD, 'integration'), createdAt: '2026-10-29T12:00:00Z' }
    const r = plan([...three, used], verified)
    expect(r.action).toBe('stop')
    expect(r.reasons.join()).toContain('1 回まで')
  })

  it('取り込む前の commit がレビューされていなければ止める', () => {
    expect(plan(three.slice(0, 2), verified).action).toBe('request') // 上限未満なら通常の依頼
    const r = plan([...three.slice(0, 2), receipt('d4d4d4d4d4'.padEnd(40, '0'))], verified)
    expect(r.action).toBe('stop')
    expect(r.reasons.join()).toContain('レビューされていない')
  })

  it('例外のレビューで指摘が出たら FAIL で止まる（回数を増やさない）', () => {
    const r = plan([...three, { login: 'kitakita-lab', body: codexRequestBody(HEAD, 'integration'), createdAt: '2026-10-29T12:30:00Z' }, summary(HEAD, 'completed', true, '2026-10-29T12:35:00Z'), receipt(HEAD)], verified, '2026-10-29T12:40:00Z')
    expect(r.action).toBe('stop')
    expect(r.verdict).toBe('FAIL')
  })

  it('例外のレビューも PASS は gate:codex と同じ条件（最新 commit の完了・受領・スレッド）', () => {
    const req = { login: 'kitakita-lab', body: codexRequestBody(HEAD, 'integration'), createdAt: '2026-10-29T12:30:00Z' }
    expect(plan([...three, req, summary(OLD, 'completed', false, '2026-10-29T12:35:00Z')], verified, '2026-10-29T12:40:00Z').verdict).toBe('PENDING')
    expect(plan([...three, req, summary(HEAD, 'completed', false, '2026-10-29T12:35:00Z'), receipt(HEAD)], verified, '2026-10-29T12:40:00Z')).toMatchObject({ action: 'done', verdict: 'PASS' })
  })

  it('例外のレビューが停滞したときの再依頼は、レビュー回数とは別に 1 回まで', () => {
    const req = { login: 'kitakita-lab', body: codexRequestBody(HEAD, 'integration'), createdAt: '2026-10-29T12:30:00Z' }
    expect(plan([...three, req], verified, '2026-10-29T13:01:00Z').action).toBe('rerequest')
    const rereq = { login: 'kitakita-lab', body: codexRequestBody(HEAD, 'rerequest'), createdAt: '2026-10-29T13:01:00Z' }
    expect(plan([...three, req, rereq], verified, '2026-10-29T13:32:00Z').action).toBe('stop')
  })
})

describe('classifyRisk（リスク区分）', () => {
  it('文書だけなら軽微（1 回）', () => {
    expect(classifyRisk({ files: ['docs/BRAND.md', 'README.md'] })).toMatchObject({ tier: 'minor', maxReviewRounds: 1 })
  })
  it('ふつうのソースの変更は通常（3 回）', () => {
    expect(classifyRisk({ files: ['src/data/news.ts', 'docs/BRAND.md'] })).toMatchObject({ tier: 'standard', maxReviewRounds: 3 })
  })
  it('依存関係・ビルドの変更は基盤（5 回）', () => {
    expect(classifyRisk({ files: ['package.json', 'src/data/news.ts'] }).tier).toBe('foundation')
  })
  it('CI・ゲート・運用ルール・セキュリティヘッダーは重要領域（5 回）', () => {
    for (const f of ['.github/workflows/ci.yml', 'scripts/lib/codex-gate.mjs', 'harness/profiles/common.md', 'AGENTS.md', 'docs/AUTOPILOT.md', 'public/_headers']) {
      expect(classifyRisk({ files: [f] }).tier, f).toBe('critical')
    }
  })
  it('AUTOPILOT・EVENT-UPDATE は docs の文書でも軽微にしない', () => {
    expect(classifyRisk({ files: ['docs/EVENT-UPDATE.md'] }).tier).toBe('critical')
  })
  it('変更ファイルを取得できない・空なら、低リスクとして扱わない（通常）', () => {
    expect(classifyRisk({ files: null }).tier).toBe('standard')
    expect(classifyRisk({ files: [] }).tier).toBe('standard')
  })
  it('申告で上げられる（ラベルでもキーでも読む）。下げる申告は採らない', () => {
    expect(classifyRisk({ files: ['src/data/news.ts'], declared: '重要領域' }).tier).toBe('critical')
    expect(classifyRisk({ files: ['src/data/news.ts'], declared: 'foundation' }).tier).toBe('foundation')
    const down = classifyRisk({ files: ['scripts/pr-gates.mjs'], declared: '軽微' })
    expect(down.tier).toBe('critical')
    expect(down.reasons.join()).toContain('採らない')
  })
  it('読めない申告は無視する（ファイルから決めた区分のまま）', () => {
    expect(classifyRisk({ files: ['docs/x.md'], declared: 'とても重要' }).tier).toBe('minor')
  })
  it('raiseTier は一段上げる（最上位はそのまま）', () => {
    expect(raiseTier('minor')).toBe('standard')
    expect(raiseTier('critical')).toBe('critical')
  })
})

describe('findingRounds・repeatCheck（同種の指摘の繰り返し）', () => {
  const line = (commit: string, path: string, sev: string, at: string) => ({ login: BOT, body: `**<sub><sub>![${sev} Badge](https://img.shields.io/badge/${sev}-orange?style=flat)</sub></sub>  指摘`, path, commitId: commit.padEnd(40, '0'), createdAt: at })
  const r1 = line('a1a1a1a1a1', 'kacc/importers/pdf.py', 'P1', '2026-11-07T08:38:00Z')
  const r2 = line('b2b2b2b2b2', 'kacc/importers/pdf.py', 'P1', '2026-11-07T08:43:00Z')
  const r3 = line('c3c3c3c3c3', 'kacc/importers/pdf.py', 'P2', '2026-11-07T08:47:00Z')

  it('Codex 以外の行コメントは数えない。commit ごとにまとめ、P0/P1 を重大として印を付ける', () => {
    const rounds = findingRounds([r1, { ...r2, login: 'chatgpt-codex-connector-fake' }, r3])
    expect(rounds.map((r) => [r.commit, r.severe])).toEqual([
      ['a1a1a1a1a1', true],
      ['c3c3c3c3c3', false],
    ])
  })
  it('同じファイルへの指摘が 2 回続き、原因分析の記録がなければ block', () => {
    expect(repeatCheck({ rounds: findingRounds([r1, r2]), comments: [], changedFiles: [] }).action).toBe('block')
  })
  it('原因分析の記録（対象 commit・回帰テストが PR の変更に含まれる）があれば ok', () => {
    const note = { login: 'kitakita-lab', body: rootCauseBody('b2b2b2b2b2', ['tests/test_pdf.py'], '原因: 行を黙って捨てる処理が 2 か所にあった') }
    expect(repeatCheck({ rounds: findingRounds([r1, r2]), comments: [note], changedFiles: ['tests/test_pdf.py'] }).action).toBe('ok')
    // 回帰テストのファイルが変更に含まれなければ、記録として認めない
    expect(repeatCheck({ rounds: findingRounds([r1, r2]), comments: [note], changedFiles: [] }).action).toBe('block')
    // bot が書いた目印は認めない
    expect(repeatCheck({ rounds: findingRounds([r1, r2]), comments: [{ ...note, login: BOT }], changedFiles: ['tests/test_pdf.py'] }).action).toBe('block')
  })
  it('3 回続けば、上限が残っていても stop', () => {
    expect(repeatCheck({ rounds: findingRounds([r1, r2, r3]), comments: [], changedFiles: [] }).action).toBe('stop')
  })
  it('別のファイルでも、直近 3 回続けて P0/P1 なら stop（新しい重大な不具合の繰り返し）', () => {
    const a = line('a1a1a1a1a1', 'a.py', 'P1', '2026-11-07T08:38:00Z')
    const b = line('b2b2b2b2b2', 'b.py', 'P0', '2026-11-07T08:43:00Z')
    const c = line('c3c3c3c3c3', 'c.py', 'P1', '2026-11-07T08:47:00Z')
    expect(repeatCheck({ rounds: findingRounds([a, b, c]), comments: [], changedFiles: [] }).action).toBe('stop')
  })
  it('繰り返しがなければ ok', () => {
    const a = line('a1a1a1a1a1', 'a.py', 'P1', '2026-11-07T08:38:00Z')
    const b = line('b2b2b2b2b2', 'b.py', 'P2', '2026-11-07T08:43:00Z')
    expect(repeatCheck({ rounds: findingRounds([a, b]), comments: [], changedFiles: [] }).action).toBe('ok')
    expect(repeatCheck({ rounds: [], comments: [], changedFiles: [] }).action).toBe('ok')
  })
})

describe('parseDeployArgs', () => {
  it('--expect がなければ URL をすべて残す', () => {
    expect(parseDeployArgs(['https://a.example/x'])).toEqual({ urls: ['https://a.example/x'], expect: undefined })
  })

  it('--expect とその値だけを取り除く（位置を問わない）', () => {
    expect(parseDeployArgs(['https://a.example/x', '--expect', 'タイトル', 'https://a.example/y'])).toEqual({
      urls: ['https://a.example/x', 'https://a.example/y'],
      expect: 'タイトル',
    })
    expect(parseDeployArgs(['--expect', 'タイトル', 'https://a.example/x'])).toEqual({ urls: ['https://a.example/x'], expect: 'タイトル' })
  })

  it('--wait と --interval を秒で読む（URL には残さない）', () => {
    expect(parseDeployArgs(['https://a.example/x', '--wait', '0', '--expect', 'T', '--interval', '5'])).toEqual({ urls: ['https://a.example/x'], expect: 'T', wait: 0, interval: 5 })
  })

  it('--wait に数値でない値・負の値は受け付けない', () => {
    expect(() => parseDeployArgs(['--wait', 'abc'])).toThrow()
    expect(() => parseDeployArgs(['--wait', '-1'])).toThrow()
  })
})
