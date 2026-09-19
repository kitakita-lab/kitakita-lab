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
 * 方針: 「必ず末尾を守る」より「誤った位置を切れ目として固定しない」を優先する。
 * 安全な切れ目が見つからない文は、ブラウザの自然な折り返しに任せる。
 * 辞書や形態素解析は持たない。
 *
 * いずれも文字サイズは変えない。長い本文の途中で起きる折り返しには
 * 手を入れない（幅に応じて自然に変わる部分）。
 */

const NOWRAP = 'whitespace-nowrap'

/** 最終行に最低限残したい文字数。 */
const MIN_TAIL = 3
/** nowrap にする文節の上限（18px の本文でも 320px 幅の 1 行に収まる長さ）。 */
const MAX_TAIL = 15
/** 「」の中身が 8 文字以下なら折り返さない。 */
const SHORT_QUOTE = /「[^「」]{1,8}」/g

/** 明確な意味の切れ目（句読点）。この直後で折り返してよい。 */
const PUNCT = /[、。！？]/
/** 助詞など。直後が「語の頭」のときだけ切れ目とみなす。 */
const PARTICLE_1 = /[をにはがのでともへや・]/
const PARTICLE_2 = /^(から|まで)$/
/** ひらがな */
const HIRAGANA = /[ぁ-ゖ]/
/**
 * 語の頭とみなす文字: 漢字・カタカナ・英数字・括弧類・「」、および
 * 敬語の接頭辞「お」「ご」（お問い合わせ／ご参加）。
 * ひらがなで始まる語（いただく・ある・なる…）は語の頭と判定できないため、
 * その直前の助詞は切れ目にしない。これにより「まと｜まり」「その｜まま」
 * 「確認で｜きた」「は｜じめて」のような語中の仮名を助詞と誤認しない。
 */
const isWordStart = (ch: string | undefined): boolean =>
  ch !== undefined && (!HIRAGANA.test(ch) || ch === 'お' || ch === 'ご')

/**
 * 文章の最後の文節を返す（句読点を含む）。見つからない場合は null。
 *
 * 1. 末尾が「（…）」で中身 12 文字以内なら、その括弧ごと
 * 2. 末尾 15 文字の範囲で、末尾に最も近い安全な切れ目の直後から。
 *    安全な切れ目 = 句読点の直後、または「助詞＋語の頭」
 * 3. 切れ目がなく、末尾がカタカナ・英数字の連続なら、その語だけ（3〜15 文字）
 * 4. どれもなければ null（自然な折り返しに任せる）。ひらがなの語には
 *    末尾数文字を機械的に守るフォールバックを使わない（語中で始めてしまうため）
 *
 * 「助詞の直後」を無条件に切れ目にしない（isWordStart）ことで、語中の仮名を
 * 拾わない。末尾に最も近い切れ目を採るのは、nowrap を短く保ち、前の行を
 * 不必要に短くしたり、狭い列で溢れさせたりしないため（句読点を優先して長い
 * 節を採ると、320px のカード内で溢れた）。
 * 末尾 3 文字未満になる位置は対象外。短い「」の内側は切れ目とみなさない。
 */
function lastPhrase(text: string): string | null {
  const trimmed = text.replace(/[。！？」]+$/, '')
  const punct = text.slice(trimmed.length)
  if (trimmed.length <= MIN_TAIL * 2) return null

  const paren = trimmed.match(/[（(][^（）()]{1,12}[）)]$/)
  if (paren && paren[0].length < trimmed.length) return paren[0] + punct

  const body = trimmed.replace(/[）)]+$/, '')
  const closing = trimmed.slice(body.length)
  // 短い「」の内側にある句読点・助詞は切れ目とみなさない（引用をまたいで分断しないため）
  const masked = body.replace(SHORT_QUOTE, (q) => '＊'.repeat(q.length))

  // 切れ目の直後 = 文節の先頭になり得る位置 i（tail = body.slice(i)）
  const minStart = Math.max(1, body.length - MAX_TAIL)
  const maxStart = body.length - MIN_TAIL
  const tailAt = (i: number) => body.slice(i) + closing + punct

  for (let i = maxStart; i >= minStart; i--) {
    if (PUNCT.test(masked[i - 1])) return tailAt(i)
    const particle = PARTICLE_1.test(masked[i - 1]) || PARTICLE_2.test(masked.slice(Math.max(0, i - 2), i))
    if (particle && isWordStart(masked[i])) return tailAt(i)
  }

  // 切れ目がなくても、末尾がカタカナ・英数字の連続（＝ひとつの語）なら、その語だけは割らない
  const run = body.match(/[゠-ヿㇰ-ㇿA-Za-z0-9]+$/)
  if (run && run[0].length >= MIN_TAIL && run[0].length <= MAX_TAIL && run[0].length < body.length) {
    return run[0] + closing + punct
  }
  return null
}

/**
 * 文字列を描画用に整える。
 * 1. 短い「」（中身 8 文字以下）は折り返さない
 * 2. 最後の文節（3〜15 文字。句読点か「助詞＋語の頭」から後ろ）は折り返さない
 * 文字列自体は変えない（表示上の折り返し位置だけ）。
 *
 * 戻り値は必ず 1 つの <span>（または元の文字列）。flex / grid の直下に置かれても
 * 1 つのアイテムとして扱われ、gap や語順の崩れを起こさない。
 */
export function typeset(text: string): ReactNode {
  if (!text) return text
  const nodes: ReactNode[] = []
  const tail = lastPhrase(text)
  const head = tail ? text.slice(0, text.length - tail.length) : text
  let cursor = 0
  let key = 0
  for (const m of head.matchAll(SHORT_QUOTE)) {
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
  return <span>{nodes}</span>
}
