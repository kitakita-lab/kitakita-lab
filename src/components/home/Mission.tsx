import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'

/** 約束 — 受け取ったものを、次の誰かへ（恩送り）。 */
export function Mission() {
  return (
    // 章1の中の節。面の色は変えず（paper）、章1をひとつの空気として読ませる
    <Section id="mission" tone="paper" spacing="node">
      <div className="mx-auto max-w-4xl text-center">
        <Reveal>
          <span className="eyebrow">Promise</span>
        </Reveal>
        <Reveal delay={80}>
          <p className="mt-6 font-serif text-2xl leading-relaxed text-ink sm:text-3xl">
            受け取ったものを、
            <br />
            <span className="text-clay-600">次の誰かへ。</span>
          </p>
        </Reveal>
        <Reveal delay={160}>
          {/* 3つの文を、それぞれ視覚的にもひとまとまりにする（文ごとに行ブロック）。
              2文目だけ幅によっては1行に入らないため、文節の境目でだけ折れるようにする。
              375/390: 4行、430以上: 3行。文字サイズは変えない。 */}
          <p className="mx-auto mt-8 max-w-xl text-base leading-loose text-ink-muted sm:text-lg">
            <span className="block">応援も、つながりも、経験も。</span>
            <span className="block">
              <span className="whitespace-nowrap">私たちは、</span>
              <span className="whitespace-nowrap">もらってばかりで</span>
              <span className="whitespace-nowrap">ここまで来ました。</span>
            </span>
            <span className="block">これからは、渡していく側です。</span>
          </p>
        </Reveal>
      </div>
    </Section>
  )
}
