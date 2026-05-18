import type { Metadata } from "next"
import { requireTwin } from "@/lib/auth/session"
import { HomeNav } from "./_components/HomeNav"

export const metadata: Metadata = {
  title: "Home — Ohana",
  robots: { index: false },
}

export default async function HomeLayout({ children }: { children: React.ReactNode }) {
  const user = await requireTwin()
  return (
    <>
      <HomeNav userName={user.name} />
      <main className="min-h-dvh bg-canvas text-ink">{children}</main>
    </>
  )
}
