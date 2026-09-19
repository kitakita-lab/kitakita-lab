import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { render } from '@testing-library/react'
import { typeset } from './typo'

const html = (text: string) => renderToStaticMarkup(<>{typeset(text)}</>)
const nowraps = (text: string) =>
  [...html(text).matchAll(/<span class="whitespace-nowrap">([^<]*)<\/span>/g)].map((m) => m[1])
const plain = (text: string) => html(text).replace(/<[^>]+>/g, '')

describe('typeset', () => {
  it('文字列自体は変えない', () => {
    const t = '商業施設や企業のイベントで、ワークショップや体験の企画をかたちにし、当日の現場にも立つこと。'
    expect(plain(t)).toBe(t)
  })

  it('最後の文節を折り返さない（末尾 15 文字の範囲で、末尾に最も近い安全な切れ目から）', () => {
    expect(nowraps('劇的な変化ではなく、こんな景色を思い描いています。')).toEqual(['思い描いています。'])
    expect(nowraps('いま、実際に手を動かしていることを、流れで並べています。')).toEqual(['並べています。'])
  })

  it('句読点も「助詞＋語の頭」も切れ目になる', () => {
    expect(nowraps('2日間で37組・57名の皆さまにご参加いただきました。')).toEqual([
      'ご参加いただきました。',
    ])
    expect(nowraps('KitaKita Labはフラワーボトルの企画・運営を担当しています。')).toEqual([
      '担当しています。',
    ])
  })

  it('短い「」の中では折り返さない', () => {
    expect(nowraps('参加者には「つくる喜び」を、作家には「はじめての舞台」を。')).toEqual([
      '「つくる喜び」',
      '「はじめての舞台」を。',
    ])
  })

  it('末尾の短い（…）は括弧ごとまとめる', () => {
    expect(nowraps('アリオ札幌1Fハーベストコート（札幌市）')).toEqual(['（札幌市）'])
  })

  it('短い文字列は文節の切れ目があるときだけ扱う', () => {
    expect(nowraps('許容できる所要時間・参加費')).toEqual(['参加費'])
    expect(html('会ってみる')).toBe('会ってみる')
    expect(html('')).toBe('')
  })

  it('長い「」（9 文字以上）は自然な折り返しに任せる', () => {
    const t = '「久しぶりにお花を扱えて楽しかった」と話してくださいました。'
    expect(nowraps(t)).toEqual(['話してくださいました。'])
  })

  describe('語中の仮名を助詞と誤認しない（回帰）', () => {
    // 助詞の直後がひらがなで始まる語は「語の頭」と判定できないため、その位置では切らない。
    const cases: Array<[string, string | null]> = [
      // 「まとまり」はひらがな始まりの語なので「が」の直後は切れ目にならず、自然な折り返しに任せる
      ['商業施設でのワークショップ需要について調査を進めています。結果がまとまり次第お知らせします。', null],
      ['参加無料・予約不要で、完成した一本はそのままお持ち帰りいただきます。', null],
      ['体験そのものへの関心が参加のきっかけになっていることを、現場で確認できました。', '確認できました。'],
      ['関心を確認できた会期です。', '確認できた会期です。'],
      ['実店舗のイベントに参加した方が多いことも、今回はじめて試したことです。', '今回はじめて試したことです。'],
      ['自家製ドライフラワーを中心とした、色とりどりの花材', '色とりどりの花材'],
      ['ここに載っていないご質問も、まずはお気軽にお問い合わせください。', 'お問い合わせください。'],
      ['その場の温度を見ながら進めます。', '見ながら進めます。'],
      ['気に入った一輪を、ゆっくり選ぶところから。', 'ゆっくり選ぶところから。'],
    ]
    for (const [text, expected] of cases) {
      it(`${text.slice(-14)} → ${expected ?? '（切らない）'}`, () => {
        const spans = nowraps(text)
        // 語中を始点にした nowrap を作らない
        for (const s of spans) {
          expect(s).not.toMatch(/^(まり|まま|きた|きました|じめて|りどり|せください|ら進|ころから)/)
        }
        if (expected === null) expect(spans).toEqual([])
        else expect(spans).toContain(expected)
      })
    }

    it('安全な切れ目がなければ nowrap を作らない（ひらがなの語に末尾数文字のフォールバックはしない）', () => {
      expect(html('また一つはっきりした2日間でした。')).toBe('また一つはっきりした2日間でした。')
      expect(html('お問い合わせください。')).toBe('お問い合わせください。')
      expect(html('完成した一本はそのままお持ち帰りいただきます。')).toBe(
        '完成した一本はそのままお持ち帰りいただきます。',
      )
    })

    it('切れ目がなくても、末尾のカタカナ・英数字の語だけは割らない', () => {
      expect(nowraps('アリオ札幌フラワーボトルワークショップ')).toEqual(['フラワーボトルワークショップ'])
      expect(nowraps('今回初めて挑戦した企業主催イベント内ブース出展')).toEqual([])
      // 文字列全体がひとつの語なら何もしない（狭い列で溢れさせない）
      expect(html('フラワーボトルワークショップ')).toBe('フラワーボトルワークショップ')
    })
  })

  describe('flex / grid の直下でも 1 つのアイテムとして扱われる（回帰）', () => {
    it('nowrap を含む出力は 1 つの <span> に包まれる', () => {
      const { container } = render(
        <div style={{ display: 'flex', gap: 8 }}>{typeset('お買い物の途中に立ち寄れる気軽さ')}</div>,
      )
      const flex = container.firstElementChild!
      expect(flex.childNodes).toHaveLength(1)
      expect(flex.firstChild?.nodeName).toBe('SPAN')
      expect(flex.textContent).toBe('お買い物の途中に立ち寄れる気軽さ')
    })

    it('inline-flex のリンクの中でも、アイコンとテキストの 2 アイテムだけになる', () => {
      const { container } = render(
        <a href="/x" style={{ display: 'inline-flex', gap: 4 }}>
          {typeset('企業・施設との企画')}
          <svg aria-hidden="true" />
        </a>,
      )
      expect(container.firstElementChild!.childNodes).toHaveLength(2)
    })

    it('nowrap が不要な文字列は文字列のまま返す', () => {
      expect(typeset('会ってみる')).toBe('会ってみる')
    })
  })
})
