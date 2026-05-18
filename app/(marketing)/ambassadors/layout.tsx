import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Ambassador Programme — Ohana",
  description: "Contribute POIs to Ohana's travel engine and earn every time your recommendations power a paid itinerary. €750 guaranteed for Anchor Ambassadors.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
