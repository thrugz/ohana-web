// app/plan/layout.tsx
import type { Metadata } from "next"
import { requireTwin } from "@/lib/auth/session"
import { HomeNav } from "@/app/home/_components/HomeNav"

export const metadata: Metadata = {
  title: "Plan — Ohana",
  robots: { index: false },
}

export default async function PlanLayout({ children }: { children: React.ReactNode }) {
  const user = await requireTwin()
  return (
    <>
      <HomeNav userName={user.name} />
      <main className="min-h-dvh bg-canvas text-ink">{children}</main>
    </>
  )
}
