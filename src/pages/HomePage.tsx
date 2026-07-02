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
 * トップページ = ブランドストーリーの体験。
 * 出会い(Hero) → 物語(About) → 思想(Philosophy) → 役割(Mission)
 * → 景色(Vision) → 育てている挑戦(Activities) → 仲間(Creators)
 * → いま(News) → 一歩(CTA) の順で読み進む構成。
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
