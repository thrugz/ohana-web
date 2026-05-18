import type { Metadata } from "next"
import type { ReactNode } from "react"
import { requireAmbassador } from "@/lib/portal/ambassador"
import { PortalNav } from "./_components/PortalNav"

export const metadata: Metadata = {
  title: "Portal — Ohana",
  robots: { index: false, follow: false },
}

export default async function PortalLayout({ children }: { children: ReactNode }) {
  await requireAmbassador()
  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <PortalNav />
      <main className="mx-auto max-w-5xl px-6 py-12">{children}</main>
    </div>
  )
}
