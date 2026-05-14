import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing — Ohana",
  description: "Free to start. Always. Simple, honest pricing with no tricks, no dark patterns, and no sudden upsell when you're mid-trip.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
