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
      '札幌を拠点に、商業施設や企業イベントでのワークショップや体験企画を、関わる人たちと一緒につくっています。企業や施設からは企画や運営のご相談を、作品や技術を持っている人からは「それを別の場所でやってみたい」というご相談を受けて、必要なところを一緒に進めます。「ちょっと進めてみる」を大切にしていて、ご相談の段階で内容が固まっていなくても構いません。',
  },
  {
    id: 'handmade-company',
    audience: '全般',
    question: 'ハンドメイドの会社ということですか？',
    answer:
      'いま最も多いのは、ハンドメイド作家と組んだワークショップの企画・運営です。ただ、対象をハンドメイドに限ってはいません。作品や技術、人に届けられるものを持っている人、場所を持つ企業・施設と一緒に企画し、実際の体験の場まで関わることが仕事です。',
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
      '現在、商業施設でのワークショップ・体験イベントの需要について、北海道在住の20〜50代1,000人を対象とした調査を進めています。結果がまとまり次第、Researchページでお知らせします。企画のご相談は、調査結果を待たずにお受けしています。',
  },
]
