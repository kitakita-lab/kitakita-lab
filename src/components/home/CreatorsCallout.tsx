import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { Button } from '@/components/ui/Button'

/**
 * 自分事化の入口。「KitaKita Lab が何をしているか」（About / Activities）のあとに、
 * 一度だけ主語を訪問者へ渡し、いまの状態に近い入口（Collaboration / Creators）へ送る。
 *
 * 構造は Intent → Uncertainty → Conversation。
 * 「何かはある」→「その次はまだ決まっていない」→「その段階から話している」。
 * 悩み訴求（Problem → Solution）にはしない。疑問形、チェックリスト、実績数字、
 * 「解決します」「お任せください」、問い合わせボタンは置かない（問い合わせは末尾の CtaBand）。
 * 「ちょっと」「〜してみる」は Hero に任せ、ここでは状態を普通の言葉で書く。
 *
 * 見た目は旧 CreatorsCallout のカード（角丸の面、控えめなにじみ、中央揃え）を引き継ぐ。
 * eyebrow は付けない。旧「Creators」は片側だけを指し、両側を指す既存の語彙がないため。
 * 2 つの導線は同格（どちらも secondary）。片方だけが主導線に見えないようにする。
 */
export function CreatorsCallout() {
  return (
    <Section id="entry" tone="paper" spacing="lg">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-line bg-paper-200 px-6 py-14 sm:px-12 sm:py-20">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-clay-50/70 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-2xl text-center">
            {/* h2 には text-wrap: balance が効くため、文節ごとに nowrap で固定し、
                折り返しを文節の境目に限る（375px: 「まだ、内容が／決まっていなくても。」、PC: 1行）。
                360px 未満は text-2xl だと3行に割れるため、旧 Callout と同じくスマホのみ
                一段小さく（text-xl）して2行に収める。 */}
            <h2 className="text-xl leading-tight min-[360px]:text-2xl sm:text-4xl lg:text-[2.5rem]">
              <span className="whitespace-nowrap">まだ、</span>
              <span className="whitespace-nowrap">内容が</span>
              <span className="whitespace-nowrap">決まって</span>
              <span className="whitespace-nowrap">いなくても。</span>
            </h2>
            {/* 企業・施設側と、作家・つくり手側の状態を一行ずつ。
                狭幅で語中折りしないよう、文単位の nowrap で固定し、文の切れ目でだけ折る。 */}
            <p className="mt-6 text-base leading-loose text-ink-muted sm:text-lg">
              <span className="whitespace-nowrap">場所やイベントの枠はある。</span>
              <span className="whitespace-nowrap">中身はこれから。</span>
              <br />
              <span className="whitespace-nowrap">作品や得意なことはある。</span>
              <span className="whitespace-nowrap">いつもと違う場所で</span>
              <span className="whitespace-nowrap">届けたい。</span>
            </p>
            <p className="mt-5 text-base leading-loose text-ink sm:text-lg">
              <span className="whitespace-nowrap">そんな段階から、</span>
              <span className="whitespace-nowrap">話しています。</span>
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button to="/collaboration" size="lg" variant="secondary">
                場所や企画のこと
              </Button>
              <Button to="/creators" size="lg" variant="secondary">
                作品や活動のこと
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
