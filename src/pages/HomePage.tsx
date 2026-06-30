import { Seo } from '@/components/Seo'
import { Hero } from '@/components/home/Hero'
import { About } from '@/components/home/About'
import { Mission } from '@/components/home/Mission'
import { Vision } from '@/components/home/Vision'
import { Activities } from '@/components/home/Activities'
import { CreatorsCallout } from '@/components/home/CreatorsCallout'
import { NewsTeaser } from '@/components/home/NewsTeaser'
import { CtaBand } from '@/components/CtaBand'

export function HomePage() {
  return (
    <>
      <Seo path="/" />
      <Hero />
      <About />
      <Mission />
      <Vision />
      <Activities />
      <CreatorsCallout />
      <NewsTeaser />
      <CtaBand />
    </>
  )
}
