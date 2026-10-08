/**
 * Research（調査）データ。
 *
 * 商業施設でのワークショップを重ねるなかで生まれた問いを、感覚だけで終わらせず
 * 数字でも確かめるための調査を、1 本ずつレポートとして残す。
 * 調査事業を拡大する計画や、複数の調査を継続的に実施する計画はない
 * （将来、別の問いが生まれて追加調査をする可能性はあるが、決めていないことは書かない）。
 *
 * ── 数字の書き方 ──────────────────────────────
 * - 割合はデータに書かない。図は「人数」と「対象人数」だけを持ち、割合は表示時に
 *   src/lib/percent.ts で計算する（表記の食い違いを構造上なくすため）。
 * - 本文中の数字は「人数/対象人数名（割合）」の形で書く。research.test.ts が
 *   この形の数字をすべて検算する。
 * - 人数は PRIZMA 納品のサマリー集計（単純集計）と、個別データからの再集計
 *   （子どもの有無別・来館頻度別のクロス集計）による。
 * - 意向と行動を混同しない。「参加したい」「買い物や飲食もしたい」は意向であり、
 *   実際の参加・購買・売上・滞在時間を示すものとして書かない。
 * - 調査元は KitaKita Lab。配信に使ったサービスや他社の名称は載せない。
 *
 * ── 新しい調査を追加するとき ─────────────────────
 * この配列に 1 件足すと、/research の一覧、/research/<slug> の詳細、
 * sitemap、プリレンダリングが揃う（entry-server.tsx が配列から URL を作る）。
 */

/** 横棒グラフの 1 行。対象人数は行ごとに持つ（来館頻度別のように行で変わるため）。 */
export type ResearchBar = {
  label: string
  count: number
  n: number
}

/** 図の種類 */
export type ResearchFigure =
  | {
      kind: 'bars'
      /** 図の見出し。末尾の（…）は補足の行として表示する */
      title: string
      /** 見出しを意味の単位で折るための分割（連結すると title の（…）より前と一致） */
      titleSegments?: string[]
      /** 図の下に置く対象・注記（例: 「参加に前向きな427名が回答」） */
      note: string
      items: ResearchBar[]
    }
  | {
      kind: 'stacked'
      title: string
      titleSegments?: string[]
      note: string
      /** 区分（左から順に積む） */
      legend: string[]
      /** 左から何区分を「前向き」として合計表示するか */
      positive: { segments: number; label: string }
      /** labelSegments: 行の名前を意味の単位で折るための分割（連結すると label に一致） */
      rows: { label: string; labelSegments?: string[]; n: number; counts: number[] }[]
    }
  | {
      kind: 'compare'
      title: string
      titleSegments?: string[]
      note: string
      /** 比べる 2 群 */
      groups: { label: string; n: number }[]
      items: { label: string; counts: number[] }[]
    }

/** 掲載の優先度（必須＝レポートの中心／推奨＝企画に効く／補足＝省略可能） */
export type ResearchPriority = 'core' | 'recommended' | 'supplementary'

export type ResearchSection = {
  id: string
  eyebrow: string
  heading: string
  /** 見出しを意味の単位で折るための分割（連結すると heading に一致すること） */
  headingSegments?: string[]
  priority: ResearchPriority
  /** 結果の説明（事実のみ） */
  lead: string[]
  figures: ResearchFigure[]
  /** 読み方・解釈（事実と分けて置く。仮説は仮説として書く） */
  reading?: string
}

/**
 * 調査そのもの（1 回の調査票・1 つのローデータ）の情報。
 * 同じ調査から総合レポートとテーマ別レポートを複数つくれるよう、
 * 調査概要・回答者の内訳・共通の注意事項はレポートではなくここに置く。
 */
export type ResearchSurvey = {
  id: string
  /** ヘッダーに並べる短い事実（対象・回答数・期間・調査元） */
  facts: string[]
  /** 調査概要 */
  overview: { label: string; value: string }[]
  /** 回答者の内訳 */
  sample: string[]
  /** どのレポートにも共通する読み方（母集団・定義・四捨五入など） */
  readingNotes: string[]
}

/** 冒頭の要点（3 つまで） */
export type ResearchKeyFinding = {
  label: string
  count: number
  n: number
  /** 比較として添える数字 */
  compare?: { label: string; count: number; n: number }[]
  note: string
}

export type ResearchReport = {
  /** URL スラッグ（/research/:slug） */
  slug: string
  title: string
  /**
   * 見出しの折り返し位置を文節に限るための分割（連結すると title に一致すること）。
   * 各文節は 320px 幅のカード（本文幅 224px・20px 文字）に収まる 11 文字以内にする。
   */
  titleSegments?: string[]
  /** 一覧のステータス表示 */
  status: string
  tag: string
  /** 一覧カード・SEO 用の要約 */
  summary: string
  /** meta description（120 字前後） */
  description: string
  /**
   * レポートの範囲。
   *   overview … 総合レポート（調査全体の要点を章立てでまとめたもの）
   *   theme    … テーマ別レポート（同じ調査の一部の設問を深掘りしたもの）
   * テーマ別を追加したら、総合レポートの該当する章からリンクし、
   * 総合レポートの章はテーマ別の要約にとどめる、という形で役割を分ける。
   */
  scope: 'overview' | 'theme'
  /** 元になった調査 */
  survey: ResearchSurvey
  /**
   * 表示している日付。
   * 【未解決・マージ直前に修正】現在は PR TIMES の配信日（2026-10-07）を表示している。
   * 方針（A 案）: 画面・JSON-LD とも実際のサイト公開日に揃え、配信日は出さない。
   * 公開日はマージ時に確定するため、そのときに sitePublished と合わせて直す。
   */
  announced: { iso: string; label: string }
  /**
   * サイトに掲載した日（JSON-LD の datePublished）。
   * 【未解決・マージ直前に修正】2026-10-08 は仮の値。マージした日に変える。
   */
  sitePublished: string
  /** なぜこの調査をしたか */
  intro: string[]
  keyFindings: ResearchKeyFinding[]
  sections: ResearchSection[]
  /** このレポート固有の読み方（調査共通のものは survey.readingNotes） */
  readingNotes?: string[]
  /** 関連する実績（events.ts の slug） */
  relatedEventSlugs: string[]
  /** 専用の OG 画像（public/ 以下） */
  ogImage?: string
}

const NOTE_INTENT = '参加に前向きだった427名が回答'

/** 「北海道の商業施設におけるワークショップ・体験イベントの需要」に関する調査（2026年9月） */
const hokkaidoMallSurvey2026: ResearchSurvey = {
  id: 'hokkaido-mall-workshop-demand-2026',
  facts: ['北海道在住の20〜50代', '1,023名が回答', '調査期間 2026年9月7日〜8日', '調査元 KitaKita Lab'],
  overview: [
    { label: '調査名', value: '「北海道の商業施設におけるワークショップ・体験イベントの需要」に関する調査' },
    { label: '調査期間', value: '2026年9月7日（月）〜9月8日（火）' },
    { label: '調査方法', value: 'PRIZMAによるインターネット調査' },
    { label: '調査対象', value: '調査回答時に北海道在住の20〜50代の男女と回答したモニター' },
    { label: '回答数', value: '1,023名' },
    { label: '調査元', value: 'KitaKita Lab' },
  ],
  sample: [
    '男性528名・女性495名',
    '20代236名・30代259名・40代259名・50代269名',
    '札幌市559名・札幌市以外464名',
    '同居する子どもがいる311名・いない712名',
  ],
  readingNotes: [
    'インターネット調査のモニターのうち、調査回答時に北海道在住の20〜50代と回答した1,023名の回答です。北海道に住む人全体の割合を表すものではありません。',
    '「参加したい」「買い物や飲食もしたい」は意向を尋ねた結果です。実際の参加や購買、売上、滞在時間を測ったものではありません。',
    '「子どもがいる／いない」は、調査時点で同居している子どもの有無です。子どもの年齢は複数回答のため、年齢別の人数を合計しても311名にはなりません。',
    '割合は、対象人数に対する人数の比率を小数第2位で四捨五入しています。',
  ],
}

export const researchReports: ResearchReport[] = [
  {
    slug: 'hokkaido-mall-workshop-demand-2026',
    title: '北海道の商業施設におけるワークショップ・体験イベントの需要調査',
    titleSegments: ['北海道の', '商業施設における', 'ワークショップ・', '体験イベントの', '需要調査'],
    status: '結果を公開しています',
    tag: '生活者調査',
    summary:
      '北海道在住の20〜50代1,023名に、商業施設でのワークショップ・体験イベントへの参加意向や、参加しやすい条件を尋ねました。来館頻度や子どもの有無で、参加意向がどう変わるかもまとめています。',
    description:
      '北海道在住の20〜50代1,023名に、商業施設でのワークショップ・体験イベントについて尋ねた調査の結果。参加に前向きな人は41.7%、月1回以上来館する人では60.2%、参加の前後に買い物や飲食もしたい人は59.0%でした。',
    scope: 'overview',
    survey: hokkaidoMallSurvey2026,
    // 【未解決・マージ直前に修正】日付の扱いは型定義のコメントを参照
    announced: { iso: '2026-10-07', label: '2026年10月7日' },
    sitePublished: '2026-10-08',
    intro: [
      'KitaKita Labは、企業や施設、作家やつくり手と一緒に、体験の場を企画・運営しています。商業施設でのワークショップを重ねるなかで、どんな人が、どんな条件なら参加したいと思うのかが、現場の感覚として見えてきました。',
      'それを感覚だけで終わらせず、数字でも確かめるために行ったのがこの調査です。このページでは、商業施設でワークショップ・体験イベントを企画するときの判断材料になる結果を中心にまとめています。',
    ],
    keyFindings: [
      {
        label: '内容や条件が合えば参加したい',
        count: 427,
        n: 1023,
        compare: [
          { label: '同居する子どもがいる人', count: 203, n: 311 },
          { label: 'いない人', count: 224, n: 712 },
        ],
        note: '「積極的に」「やや」参加したいと思う人の合計。参加の約束ではなく、意向です。',
      },
      {
        label: '月1回以上、商業施設を訪れる人の参加意向',
        count: 324,
        n: 538,
        compare: [{ label: '月1回未満の人', count: 103, n: 485 }],
        note: '来館頻度が高い人ほど、参加に前向きな割合が高くなりました。',
      },
      {
        label: '参加のために訪れたら、前後に買い物や飲食もしたい',
        count: 604,
        n: 1023,
        note: '「とても」「やや」そう思う人の合計。実際の購買ではなく、意向です。',
      },
    ],
    sections: [
      {
        id: 'intent',
        eyebrow: 'Intent',
        heading: '参加に前向きな人は約4割。子どもの有無で大きく分かれる',
        headingSegments: ['参加に前向きな人は', '約4割。', '子どもの有無で', '大きく分かれる'],
        priority: 'core',
        lead: [
          '「積極的に参加したいと思う」「やや参加したいと思う」を合わせた前向きな回答は、全体で427/1,023名（41.7%）でした。同居する子どもがいる人では203/311名（65.3%）、いない人では224/712名（31.5%）と、大きく分かれました。',
        ],
        figures: [
          {
            kind: 'stacked',
            title: '参加意向（子どもの有無別）',
            note: '設問「商業施設で、材料や道具を使って作品を作るワークショップ・体験イベントが開催されていた場合、内容や条件が自分に合えば参加したいと思いますか？」。子どもの有無は、同居する子どもの有無',
            legend: [
              '積極的に参加したいと思う',
              'やや参加したいと思う',
              'あまり参加したいと思わない',
              '全く参加したいと思わない',
            ],
            positive: { segments: 2, label: '前向き' },
            rows: [
              { label: '全体', n: 1023, counts: [107, 320, 235, 361] },
              { label: '子どもがいる', n: 311, counts: [64, 139, 53, 55] },
              { label: '子どもがいない', n: 712, counts: [43, 181, 182, 306] },
            ],
          },
        ],
      },
      {
        id: 'frequency',
        eyebrow: 'Frequency',
        heading: '商業施設をよく訪れる人ほど、参加に前向き',
        headingSegments: ['商業施設を', 'よく訪れる人ほど、', '参加に前向き'],
        priority: 'core',
        lead: [
          'ショッピングモールや大型商業施設を、買い物や飲食、娯楽などで訪れる頻度別に、参加に前向きな人の割合を集計しました。',
          '子どもがいない人に限っても、月1回以上訪れる人では153/322名（47.5%）、月1回未満の人では71/390名（18.2%）が前向きでした。なお、月1回以上訪れる人は、子どもがいる人で216/311名（69.5%）、いない人で322/712名（45.2%）です。',
        ],
        figures: [
          {
            kind: 'bars',
            title: '来館頻度別の参加意向',
            note: '「積極的に」「やや」参加したいと思う人の割合。全員（1,023名）の回答を、ショッピングモールや大型商業施設を訪れる頻度で分けて集計',
            items: [
              { label: '月1回以上', count: 324, n: 538 },
              { label: '月1回未満', count: 103, n: 485 },
            ],
          },
          {
            kind: 'bars',
            title: '来館頻度別の参加意向（7区分）',
            note: '各行の対象人数は、その頻度で訪れると答えた人数',
            items: [
              { label: '週2回以上', count: 53, n: 64 },
              { label: '週1回程度', count: 105, n: 146 },
              { label: '月2〜3回程度', count: 79, n: 142 },
              { label: '月1回程度', count: 87, n: 186 },
              { label: '2〜3か月に1回程度', count: 53, n: 137 },
              { label: '半年に1回程度', count: 32, n: 102 },
              { label: '年に1回以下', count: 18, n: 246 },
            ],
          },
        ],
        reading:
          'これは同じ時点の回答どうしの関係で、来館頻度が上がれば参加意向も上がる、という因果を示すものではありません。すでに施設をよく訪れている人に向けた企画ほど届きやすい可能性がある、と私たちは読んでいます。',
      },
      {
        id: 'conditions',
        eyebrow: 'Conditions',
        heading: '参加しやすい時間と参加費',
        priority: 'recommended',
        lead: [
          'ここからは、参加に前向きだった427名に尋ねた結果です。参加できる最大の時間は30分以内が209/427名（48.9%）、参加費は1,499円以下が305/427名（71.4%）でした。',
        ],
        figures: [
          {
            kind: 'bars',
            title: '参加できる最大の時間',
            note: `設問「商業施設でワークショップ・体験イベントに参加するとしたら、どのくらいの時間までであれば参加したいと思いますか？」。${NOTE_INTENT}`,
            items: [
              { label: '15分以内', count: 50, n: 427 },
              { label: '16〜30分', count: 159, n: 427 },
              { label: '31〜45分', count: 106, n: 427 },
              { label: '46〜60分', count: 89, n: 427 },
              { label: '61分以上', count: 23, n: 427 },
            ],
          },
          {
            kind: 'bars',
            title: '参加を検討できる参加費',
            note: `設問「参加費がいくらくらいまでなら、ワークショップ・体験イベントに参加したいと思いますか？」（材料費を含み、1人につき1作品を作って持ち帰れる場合の1人分）。${NOTE_INTENT}`,
            items: [
              { label: '500円未満', count: 72, n: 427 },
              { label: '500〜999円', count: 99, n: 427 },
              { label: '1,000〜1,499円', count: 134, n: 427 },
              { label: '1,500〜1,999円', count: 48, n: 427 },
              { label: '2,000〜2,999円', count: 38, n: 427 },
              { label: '3,000円以上', count: 17, n: 427 },
              { label: '金額はかけたくない', count: 19, n: 427 },
            ],
          },
        ],
      },
      {
        id: 'companions',
        eyebrow: 'Companions',
        heading: '誰と参加したいかは、子どもの有無で変わる',
        headingSegments: ['誰と参加したいかは、', '子どもの有無で', '変わる'],
        priority: 'recommended',
        lead: [
          '参加に前向きだった人に、誰と一緒に参加したいかを尋ねました（複数回答）。最も多かったのは、子どもがいる人では「子ども」161/203名（79.3%）、いない人では「一人」126/224名（56.3%）です。',
        ],
        figures: [
          {
            kind: 'compare',
            title: '一緒に参加したい人（複数回答）',
            note: '参加に前向きだった人のうち、子どもがいる203名・いない224名が回答。「その他」は省略',
            groups: [
              { label: '子どもがいる', n: 203 },
              { label: '子どもがいない', n: 224 },
            ],
            items: [
              { label: '子ども', counts: [161, 11] },
              { label: '配偶者・パートナー', counts: [120, 68] },
              { label: '一人', counts: [35, 126] },
              { label: '友人', counts: [6, 60] },
              { label: '親', counts: [9, 34] },
            ],
          },
        ],
        reading:
          '家族で過ごす時間に組み込む企画と、大人が一人でも参加しやすい企画とでは、時間帯や告知の届け方の前提が変わると考えています。',
      },
      {
        id: 'non-participation',
        eyebrow: 'Experience',
        heading: '過去1年、参加していない人は約8割',
        headingSegments: ['過去1年、', '参加していない人は', '約8割'],
        priority: 'recommended',
        lead: [
          '過去1年間に、材料や道具を使って自分で何かをつくるワークショップ・体験イベントに参加していない人は、816/1,023名（79.8%）でした。',
          '参加しなかった理由では、「作品づくり自体に興味がなかった」に続いて、「開催されていることを知らなかった」が196/816名（24.0%）、「身近な場所で開催されていなかった」が105/816名（12.9%）でした。',
        ],
        figures: [
          {
            kind: 'stacked',
            title: '過去1年間の参加状況',
            note: `設問「過去1年間に、材料や道具を使って自分で何かを作るワークショップ・体験イベントに参加しましたか？」`,
            legend: [
              '商業施設で開催されたものに参加した',
              '商業施設以外で開催されたものに参加した',
              '両方で開催されたものに参加した',
              '参加していない',
            ],
            positive: { segments: 3, label: '参加した' },
            rows: [
              { label: '全体', n: 1023, counts: [127, 57, 23, 816] },
              { label: '子どもがいる', n: 311, counts: [87, 34, 13, 177] },
              { label: '子どもがいない', n: 712, counts: [40, 23, 10, 639] },
            ],
          },
          {
            kind: 'bars',
            title: '参加しなかった理由（複数回答・上位7項目）',
            note: '過去1年間に参加していない816名が回答',
            items: [
              { label: '作品づくり自体に興味がなかった', count: 454, n: 816 },
              { label: '開催されていることを知らなかった', count: 196, n: 816 },
              { label: '身近な場所で開催されていなかった', count: 105, n: 816 },
              { label: '興味のある内容がなかった', count: 83, n: 816 },
              { label: '一人では参加しにくかった', count: 62, n: 816 },
              { label: '開催日時が希望と合わなかった', count: 37, n: 816 },
              { label: '参加費が高いと感じた', count: 33, n: 816 },
            ],
          },
        ],
        reading:
          '参加意向を示す人がいる一方で、実際に参加した人は限られています。「知らなかった」「近くで開かれていなかった」は、開催する場所と伝え方に関わる理由です。',
      },
      {
        id: 'facility',
        eyebrow: 'Facility',
        heading: '参加のついでに、買い物や食事も',
        priority: 'core',
        lead: [
          '商業施設で開催されるワークショップ・体験イベントについて、3つの考えにどの程度あてはまるかを尋ねました。「参加するために商業施設を訪れたら、その前後に買い物や飲食もしたいと思う」に「とても」「やや」そう思うと答えた人は604/1,023名（59.0%）で、3つの中で最も多くなりました。',
        ],
        figures: [
          {
            kind: 'stacked',
            title: '商業施設でのワークショップ・体験イベントについての考え',
            titleSegments: ['商業施設での', 'ワークショップ・', '体験イベントについての考え'],
            note: `設問「商業施設で開催されるワークショップ・体験イベントについて、あなたの考えに近いものをそれぞれ答えてください」`,
            legend: ['とてもそう思う', 'ややそう思う', 'あまりそう思わない', '全くそう思わない'],
            positive: { segments: 2, label: 'そう思う' },
            rows: [
              {
                label: '参加するために訪れたら、その前後に買い物や飲食もしたい',
                labelSegments: ['参加するために訪れたら、', 'その前後に', '買い物や飲食もしたい'],
                n: 1023,
                counts: [198, 406, 245, 174],
              },
              {
                label: '開催されている商業施設は、魅力的だと思う',
                labelSegments: ['開催されている', '商業施設は、', '魅力的だと思う'],
                n: 1023,
                counts: [156, 411, 263, 193],
              },
              {
                label: '興味のあるものがあれば、その商業施設を訪れたい',
                labelSegments: ['興味のあるものがあれば、', 'その商業施設を', '訪れたい'],
                n: 1023,
                counts: [147, 375, 302, 199],
              },
            ],
          },
        ],
      },
      {
        id: 'interests',
        eyebrow: 'Interests',
        heading: '関心のある作品とテーマ',
        priority: 'supplementary',
        lead: [
          'どのような作品に興味があるかは、「作品づくり自体に興味がなかった」と答えた人を除く569名に尋ねました。最も多かったのは「日常生活で使える・身につけられる作品」の214/569名（37.6%）です。魅力を感じる季節・テーマでは、「季節のイベントには関係なく参加したい」が352/1,023名（34.4%）で最も多くなりました。',
        ],
        figures: [
          {
            kind: 'bars',
            title: '興味のある作品（複数回答・上位6項目）',
            note: '「作品づくり自体に興味がなかった」と答えた人を除く569名が回答',
            items: [
              { label: '日常生活で使える・身につけられる作品', count: 214, n: 569 },
              { label: '自宅に飾れる作品', count: 177, n: 569 },
              { label: '北海道産・地域の素材を使った作品', count: 129, n: 569 },
              { label: '季節の行事に合わせた作品', count: 117, n: 569 },
              { label: '短時間で完成し、その場で持ち帰れる作品', count: 107, n: 569 },
              { label: '子どもの学びや自由研究につながる作品', count: 76, n: 569 },
            ],
          },
          {
            kind: 'bars',
            title: '魅力を感じる季節・テーマ（複数回答・上位6項目）',
            note: '設問「ワークショップや体験イベントに参加するとしたら、魅力を感じる季節・イベントのテーマを教えてください」',
            items: [
              { label: '季節のイベントには関係なく参加したい', count: 352, n: 1023 },
              { label: 'クリスマス', count: 251, n: 1023 },
              { label: 'ハロウィン', count: 161, n: 1023 },
              { label: 'お正月・冬休み', count: 159, n: 1023 },
              { label: '夏休み・自由研究', count: 157, n: 1023 },
              { label: '秋の行楽シーズン', count: 148, n: 1023 },
            ],
          },
        ],
      },
    ],
    readingNotes: [
      '所要時間・参加費・一緒に参加したい人は参加に前向きだった427名、関心のある作品は569名、参加しなかった理由は816名に尋ねています。図ごとに対象人数を示しています。',
    ],
    relatedEventSlugs: [
      'ario-sapporo-harvest-court-2026-09',
      'the-big-atsubetsu-2026',
      'ario-sapporo-harvest-court-2026',
    ],
    ogImage: '/research/hokkaido-mall-workshop-demand-2026/og.png',
  },
]
