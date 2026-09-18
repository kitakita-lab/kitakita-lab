import type { ReactNode } from 'react'

/**
 * 日本語の組版ユーティリティ。
 *
 * ブラウザの自動折り返しは文字単位で起きるため、スマートフォン幅では
 * 「す。」「ます。」だけが最終行に残る、短い「」の中で折れる、といった
 * 崩れが出る。ここでは、データ上の文字列を変えずに描画時だけ
 * 最小限の「折り返し禁止」を与える。
 *
 * - typeset(text): 短い「」の中身と、最後の文節を折り返さない
 * - <Segments />（components/ui/Segments.tsx）: 見出しなどを意味の単位で折り返させる
 *
 * いずれも文字サイズは変えない。長い本文の途中で起きる折り返しには
 * 手を入れない（幅に応じて自然に変わる部分）。
 */

const NOWRAP = 'whitespace-nowrap'

/**
 * 文節の切れ目とみなす文字（この直後で折り返してよい）。
 * 「と」は「として／とした／とい（う）」の途中では切れ目にしない。
 */
const BOUNDARY = /[、。！？・をにはがのでもへ]|と(?![しい])|から|まで/g

/** 最終行に最低限残したい文字数。 */
const MIN_TAIL = 3
/** nowrap にする文節の上限（18px の本文でも 320px 幅の 1 行に収まる長さ）。 */
const MAX_TAIL = 15
/** 「」の中身が 8 文字以下なら折り返さない（下の正規表現の {1,8}）。 */

/** カタカナ・長音・英数字（語の途中で切りたくない文字） */
const RUN = /[゠-ヿㇰ-ㇿA-Za-z0-9]/

/**
 * 文章の最後の文節を返す（句読点を含む）。見つからない／長すぎる場合は null。
 *
 * 1. 末尾が「（…）」で 14 文字以内なら、その括弧ごと
 * 2. 最後の切れ目（助詞・読点）から後ろが 3〜15 文字なら、そこから
 * 3. どちらでもなければ末尾 5 文字。ただしカタカナ語・英数字の途中で
 *    始まる場合は、その語の頭まで広げる（「ブラン／ド」のように割らない）
 *
 * 15 文字以下の短い文字列には 1 と 2 だけを使う（3 を使うとほぼ全体が
 * nowrap になり、狭い列で溢れる恐れがあるため）。
 */
function lastPhrase(text: string): string | null {
  const trimmed = text.replace(/[。！？」]+$/, '')
  const punct = text.slice(trimmed.length)
  if (trimmed.length <= MIN_TAIL * 2) return null
  const short = trimmed.length <= MAX_TAIL

  const paren = trimmed.match(/[（(][^（）()]{1,12}[）)]$/)
  if (paren && paren[0].length < trimmed.length) return paren[0] + punct

  const body = trimmed.replace(/[）)]+$/, '')
  const closing = trimmed.slice(body.length)
  // 短い「」の内側にある助詞は切れ目とみなさない（引用をまたいで分断しないため）
  const masked = body.replace(/「[^「」]{1,8}」/g, (q) => '＊'.repeat(q.length))
  const search = masked.slice(0, masked.length - MIN_TAIL)
  let lastEnd = -1
  for (const m of search.matchAll(BOUNDARY)) lastEnd = m.index! + m[0].length
  if (lastEnd > 0) {
    const tail = body.slice(lastEnd)
    if (tail.length >= MIN_TAIL && tail.length <= MAX_TAIL) return tail + closing + punct
  }
  if (short) return null

  let start = Math.max(0, body.length - (MIN_TAIL + 2))
  while (start > 0 && RUN.test(body[start]) && RUN.test(body[start - 1])) start--
  const tail = body.slice(start)
  if (tail.length > MAX_TAIL) return null
  return tail + closing + punct
}

/**
 * 文字列を描画用に整える。
 * 1. 短い「」（中身 8 文字以下）は折り返さない
 * 2. 最後の文節（3〜15 文字）は折り返さず、1〜2 文字だけの最終行を防ぐ
 * 文字列自体は変えない（表示上の折り返し位置だけ）。
 */
export function typeset(text: string): ReactNode {
  if (!text) return text
  const nodes: ReactNode[] = []
  const tail = lastPhrase(text)
  const head = tail ? text.slice(0, text.length - tail.length) : text
  // 短い「」を nowrap にしながら head を分割
  const re = /「[^「」]{1,8}」/g
  let cursor = 0
  let key = 0
  for (const m of head.matchAll(re)) {
    const i = m.index!
    if (i > cursor) nodes.push(head.slice(cursor, i))
    nodes.push(
      <span key={`q${key++}`} className={NOWRAP}>
        {m[0]}
      </span>,
    )
    cursor = i + m[0].length
  }
  if (cursor < head.length) nodes.push(head.slice(cursor))
  if (tail) {
    nodes.push(
      <span key="tail" className={NOWRAP}>
        {tail}
      </span>,
    )
  }
  if (nodes.length === 1 && typeof nodes[0] === 'string') return text
  return <>{nodes}</>
}
