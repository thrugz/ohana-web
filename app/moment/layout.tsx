import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Your Moment — Ohana",
  description: "A short, guided moment with Hoku to shape your travel Mana.",
}

// Minimal full-height layout for the Moment flow.
export default function MomentLayout({ children }: { children: ReactNode }) {
  return <main className="min-h-dvh bg-canvas text-ink">{children}</main>
}
