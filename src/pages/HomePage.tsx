import { Seo } from '@/components/Seo'
import { Hero } from '@/components/home/Hero'
import { About } from '@/components/home/About'
import { Philosophy } from '@/components/home/Philosophy'
import { Mission } from '@/components/home/Mission'
import { Vision } from '@/components/home/Vision'
import { Activities } from '@/components/home/Activities'
import { CreatorsCallout } from '@/components/home/CreatorsCallout'
import { NewsTeaser } from '@/components/home/NewsTeaser'
import { CtaBand } from '@/components/CtaBand'

/**
 * トップページ = 人格と出会う体験。
 * 哲学(Hero) → 自己紹介(About) → 誠実さ(Philosophy) → 約束(Promise)
 * → 景色(Vision) → つくっている流れ(Activities) → 隣の席(Creators)
 * → いま(News) → 会話(CTA) の順で読み進む構成。
 */
export function HomePage() {
  return (
    <>
      <Seo path="/" />
      <Hero />
      <About />
      <Philosophy />
      <Mission />
      <Vision />
      <Activities />
      <CreatorsCallout />
      <NewsTeaser />
      <CtaBand />
    </>
  )
}
