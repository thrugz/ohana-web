import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Discover — Ohana",
  description: "Explore places that match your mood, guided by Hoku.",
}

// Minimal full-height layout for the Discover flow.
export default function DiscoverLayout({ children }: { children: ReactNode }) {
  return <main className="min-h-dvh bg-canvas text-ink">{children}</main>
}
