import { describe, it, expect } from 'vitest'
import { classifyPage, classifyNetworkError, decideDeploy } from '../../scripts/lib/deploy-gate.mjs'

/**
 * 本番反映の判定（scripts/lib/deploy-gate.mjs）のテスト。
 * PR #84 では、Cloudflare Pages のデプロイ成功直後に公開 URL が 404 を返し、数十秒後に 200 になった。
 */
const URL_ = 'https://www.kitakita-lab.com/events/x'
const T = '「花と楽しむハロウィン」フラワーボトルワークショップ'
const html = `<html><title>${T}｜KitaKita Lab</title></html>`

describe('classifyPage', () => {
  it('2xx で期待する文字列があれば ok', () => {
    expect(classifyPage({ status: 200, body: html, expect: T })).toMatchObject({ state: 'ok', expectFound: true })
  })

  it('2xx でも期待する文字列がなければ waiting（VERIFIED にしない）', () => {
    expect(classifyPage({ status: 200, body: '<html>古い内容</html>', expect: T })).toMatchObject({ state: 'waiting', expectFound: false })
  })

  it('404・5xx・429 は反映待ちとして waiting', () => {
    for (const status of [404, 429, 500, 502, 503, 504, 522]) expect(classifyPage({ status, body: '', expect: T }).state).toBe('waiting')
  })

  it('403 は blocked（公開できていないとは断定しない）', () => {
    expect(classifyPage({ status: 403, body: '', expect: T }).state).toBe('blocked')
  })

  it('401・407 は認証エラーとして blocked', () => {
    expect(classifyPage({ status: 401, expect: T }).state).toBe('blocked')
    expect(classifyPage({ status: 407, expect: T }).state).toBe('blocked')
  })

  it('それ以外の 4xx（410 など）は failed', () => {
    expect(classifyPage({ status: 410, expect: T }).state).toBe('failed')
    expect(classifyPage({ status: 400, expect: T }).state).toBe('failed')
  })

  it('ステータスを取れない応答は failed（合格扱いにしない）', () => {
    expect(classifyPage({ status: null, expect: T }).state).toBe('failed')
  })

  it('--expect の指定がなければ ok だが、照合していないことを残す', () => {
    expect(classifyPage({ status: 200, body: html })).toMatchObject({ state: 'ok', expectFound: null })
  })
})

describe('classifyNetworkError', () => {
  it('プロキシが CONNECT を 403 で断れば blocked（許可ドメインにない）', () => {
    expect(classifyNetworkError({ code: 56, message: 'curl: (56) CONNECT tunnel failed, response 403' }).state).toBe('blocked')
  })

  it('証明書の検証に失敗したら blocked（検証を無効にして続けない）', () => {
    expect(classifyNetworkError({ code: 60, message: 'curl: (60) SSL certificate problem: unable to get local issuer certificate' }).state).toBe('blocked')
  })

  it('名前解決・接続・タイムアウトは waiting（通信の失敗として印を付ける）', () => {
    expect(classifyNetworkError({ code: 6, message: 'curl: (6) Could not resolve host' })).toMatchObject({ state: 'waiting', network: true })
    expect(classifyNetworkError({ code: 28, message: 'curl: (28) Operation timed out' })).toMatchObject({ state: 'waiting', network: true })
  })

  it('classifyPage は error があれば通信の分類を使う', () => {
    expect(classifyPage({ error: { code: 56, message: 'CONNECT tunnel failed, response 403' }, expect: T }).state).toBe('blocked')
  })
})

describe('decideDeploy', () => {
  const page = (state: 'ok' | 'waiting' | 'blocked' | 'failed', reason: string = state, network = false) => ({ url: URL_, state, reason, network })
  const base = { expectGiven: true, deadlineReached: false }

  it('デプロイ失敗は FAIL', () => {
    expect(decideDeploy({ ...base, deploy: 'failure', pages: [] })).toMatchObject({ done: true, verdict: 'FAIL' })
  })

  it('デプロイ待ちは、期限内なら待ち、期限後は PENDING', () => {
    expect(decideDeploy({ ...base, deploy: 'pending', pages: [] })).toMatchObject({ done: false })
    expect(decideDeploy({ ...base, deploy: 'pending', pages: [], deadlineReached: true })).toMatchObject({ done: true, verdict: 'PENDING' })
  })

  it('PR #84 の再現: デプロイ直後の 404 は期限内なら再試行し、200 になれば VERIFIED', () => {
    const first = decideDeploy({ ...base, deploy: 'success', pages: [{ url: URL_, ...classifyPage({ status: 404, body: '', expect: T }) }] })
    expect(first).toMatchObject({ done: false, verdict: 'PENDING' })
    const second = decideDeploy({ ...base, deploy: 'success', pages: [{ url: URL_, ...classifyPage({ status: 200, body: html, expect: T }) }] })
    expect(second).toMatchObject({ done: true, verdict: 'VERIFIED' })
  })

  it('期限を過ぎても 404 なら FAIL（恒久的な公開失敗）', () => {
    expect(decideDeploy({ ...base, deploy: 'success', pages: [page('waiting', 'HTTP 404')], deadlineReached: true })).toMatchObject({ done: true, verdict: 'FAIL' })
  })

  it('期限を過ぎても期待する文字列がなければ FAIL（VERIFIED にしない）', () => {
    expect(decideDeploy({ ...base, deploy: 'success', pages: [page('waiting', '期待する文字列がない')], deadlineReached: true }).verdict).toBe('FAIL')
  })

  it('期限を過ぎても通信できなければ DEPLOYED_UNVERIFIED（失敗とも成功とも言わない）', () => {
    expect(decideDeploy({ ...base, deploy: 'success', pages: [page('waiting', '通信できない', true)], deadlineReached: true }).verdict).toBe('DEPLOYED_UNVERIFIED')
  })

  it('blocked（プロキシ・認証・403）は待たずに DEPLOYED_UNVERIFIED', () => {
    expect(decideDeploy({ ...base, deploy: 'success', pages: [page('blocked')] })).toMatchObject({ done: true, verdict: 'DEPLOYED_UNVERIFIED' })
  })

  it('failed があれば待たずに FAIL', () => {
    expect(decideDeploy({ ...base, deploy: 'success', pages: [page('ok'), page('failed', 'HTTP 410')] })).toMatchObject({ done: true, verdict: 'FAIL' })
  })

  it('複数 URL は、すべて ok のときだけ VERIFIED', () => {
    expect(decideDeploy({ ...base, deploy: 'success', pages: [page('ok'), page('waiting', 'HTTP 404')] }).done).toBe(false)
    expect(decideDeploy({ ...base, deploy: 'success', pages: [page('ok'), page('ok')] }).verdict).toBe('VERIFIED')
  })

  it('--expect の指定がなければ、200 でも DEPLOYED_UNVERIFIED', () => {
    expect(decideDeploy({ ...base, expectGiven: false, deploy: 'success', pages: [page('ok')] }).verdict).toBe('DEPLOYED_UNVERIFIED')
  })

  it('公開 URL の指定がなければ DEPLOYED_UNVERIFIED', () => {
    expect(decideDeploy({ ...base, deploy: 'success', pages: [] }).verdict).toBe('DEPLOYED_UNVERIFIED')
  })
})
