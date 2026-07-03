import type { ReactNode } from 'react'

/**
 * FAQ データ。カテゴリ別に管理し、追加・編集が容易な構造にしています。
 * question は基本的に文字列で問題ありませんが、実機幅で単語途中の改行が
 * 確認された項目のみ、該当語を whitespace-nowrap で保護した ReactNode に
 * しています。
 */

export type FaqItem = {
  id: string
  question: ReactNode
  answer: string
  audience: '作家の方' | '企業・自治体の方' | '全般'
}

export const faqItems: FaqItem[] = [
  {
    id: 'what-is-kitakita-lab',
    audience: '全般',
    question: (
      <>
        KitaKita Labは<span className="whitespace-nowrap">どんな</span>場所ですか？
      </>
    ),
    answer:
      '北海道の「少し進めてみる」ための場所です。何を進めるかは決まっていません。作品でも、仕事でも、アイデアでも。大きな約束はしませんが、道が少し豊かになるような時間・体験・出会いを用意しています。',
  },
  {
    id: 'handmade-company',
    audience: '全般',
    question: 'ハンドメイドの会社ということですか？',
    answer:
      'ハンドメイドやワークショップは、いま育てているものの一部です。ほかにも、AIやシステムづくり、EC、地域や企業との企画などを育てています。ばらばらに見えるかもしれませんが、すべて「少し進めてみる」という同じ考えから生まれています。',
  },
  {
    id: 'creator-experience-required',
    audience: '作家の方',
    question: (
      <>
        作家として参加する<span className="whitespace-nowrap">には</span>経験が必要ですか？
      </>
    ),
    answer:
      '経験は問いません。大切にしているのは「進めてみたい」という気持ちです。ワークショップ講師、イベント出店、はじめての企業案件、将来講師を目指す方など、さまざまなかたちでの参加を歓迎しています。',
  },
  {
    id: 'creator-start-immediately',
    audience: '作家の方',
    question: '応募したらすぐに活動できますか？',
    answer:
      'まずはお互いの考え方を知るところから始めます。応募後にご連絡し、活動内容やご希望をうかがったうえで、無理のないかたちで参加いただけるよう進めます。',
  },
  {
    id: 'corporate-collab-inquiry',
    audience: '企業・自治体の方',
    question: (
      <>
        企業コラボや商業施設<span className="whitespace-nowrap">イベント</span>の相談はできますか？
      </>
    ),
    answer:
      'はい、歓迎しています。企業のブランドメッセージを体験として届けるワークショップや、商業施設の賑わいづくり、自治体・教育機関との企画など、目的に合わせて設計します。Contactページよりお問い合わせください。',
  },
  {
    id: 'research-data-proposal',
    audience: '企業・自治体の方',
    question: '調査データを活用した提案は可能ですか？',
    answer:
      'はい。ハンドメイド市場や生活者ニーズに関する調査活動の知見を踏まえ、企画提案に活かしています。詳細はお問い合わせ時にご相談ください。',
  },
]
