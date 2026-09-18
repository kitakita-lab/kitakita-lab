import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
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

  it('最後の文節（助詞・読点のあと）を折り返さない', () => {
    expect(nowraps('劇的な変化ではなく、こんな景色を思い描いています。')).toEqual(['思い描いています。'])
    expect(nowraps('いま、実際に手を動かしていることを、流れで並べています。')).toEqual(['並べています。'])
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

  it('切れ目がなければ末尾 5 文字。カタカナ語の途中なら語の頭まで広げる', () => {
    expect(nowraps('今回初めて挑戦した企業主催イベント内ブース出展')).toEqual(['ブース出展'])
    expect(nowraps('今回初めて挑戦した企業主催イベントブース')).toEqual(['イベントブース'])
  })

  it('「として／とした」の「と」は切れ目にしない', () => {
    expect(nowraps('イベントを目的とした来館意向')).toEqual(['目的とした来館意向'])
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
})
