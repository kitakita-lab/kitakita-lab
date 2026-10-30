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
    // これまでの実績（商業施設での企画・運営）と、これから相談を受けたい領域（ブランドとの協業・社内イベント・
    // 自治体・教育機関）を分けて書く。後者を実績のように書かない
    answer:
      'はい、歓迎しています。これまでは主に、商業施設での体験イベント・ワークショップの企画と運営を担当してきました。ブランドとの協業や社内イベント、自治体・教育機関との企画も、目的に合わせてご相談いただけます。Contactページよりお問い合わせください。',
  },
  {
    id: 'consult-before-budget',
    audience: '企業・自治体の方',
    question: (
      <>
        予算や日程が決まって<span className="whitespace-nowrap">いなくても</span>、相談できますか？
      </>
    ),
    answer:
      'はい、ご相談いただけます。開催の目的や、考えている時期・場所など、わかる範囲でお知らせください。費用は、会場や開催の条件をお伺いしたうえで、個別にお見積もりします。',
  },
  {
    id: 'consult-scope',
    audience: '企業・自治体の方',
    question: 'どこまで任せられますか？',
    answer:
      '体験イベント・ワークショップの企画から、開催に向けた準備や会場のレイアウト、当日の運営、参加状況の集計まで担当しています。必要なところだけのご相談も歓迎です。',
  },
  {
    id: 'report-after-event',
    audience: '企業・自治体の方',
    question: '開催後の実施報告には対応していますか？',
    // すべての案件で報告書を必ず出すという約束にはしない
    answer:
      '開催内容に応じて、参加状況や当日の様子をまとめた実施報告にも対応しています。これまでの開催の様子は、開催実績のページでご覧いただけます。',
  },
  {
    id: 'area-outside-sapporo',
    audience: '企業・自治体の方',
    question: (
      <>
        札幌市以外でも<span className="whitespace-nowrap">開催</span>できますか？
      </>
    ),
    answer: 'これまでは、札幌市と北広島市で開催してきました。それ以外の地域での開催も、ご相談ください。',
  },
  {
    id: 'research-data-proposal',
    audience: '企業・自治体の方',
    question: '調査データを活用した提案は可能ですか？',
    answer:
      '北海道在住の20〜50代1,023名を対象に、商業施設でのワークショップ・体験イベントの需要を調べた結果を、Researchページで公開しています。来館頻度や子どもの有無による参加意向の違い、参加しやすい時間や参加費などを、企画を考える材料にしています。',
  },
]
