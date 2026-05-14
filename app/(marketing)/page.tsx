import type { Metadata } from "next"
import { Hero } from "./_components/Hero"
import { MarqueeTicker } from "./_components/MarqueeTicker"
import { DemoStrip } from "./_components/DemoStrip"
import { FeatureBento } from "./_components/FeatureBento"
import { HowItWorks } from "./_components/HowItWorks"
import { DiscoverScroll } from "./_components/DiscoverScroll"
import { Companions } from "./_components/Companions"
import { PressStrip } from "./_components/PressStrip"
import { FAQ } from "./_components/FAQ"
import { FinalCTA } from "./_components/FinalCTA"
import { SiteFooter } from "./_components/SiteFooter"

export const metadata: Metadata = {
  title: "Ohana — Your kind of place, found for you",
  description: "Ohana finds the neighbourhoods, experiences, and people that match how you actually want to travel. Not sold to you — found for you.",
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <MarqueeTicker />
      <DemoStrip />
      <FeatureBento />
      <HowItWorks />
      <DiscoverScroll />
      <Companions />
      <PressStrip />
      <FAQ />
      <FinalCTA />
      <SiteFooter />
    </>
  )
}
