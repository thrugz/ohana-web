import Link from "next/link"
import { OhanaLogo } from "@/components/OhanaLogo"

export function PortalNav() {
  return (
    <nav className="border-b border-line bg-surface px-6 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/portal" className="no-underline">
          <OhanaLogo variant="light" />
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/portal/payments" className="text-sm text-muted hover:text-ink transition-colors">
            Payments
          </Link>
          <Link href="/sign-in" className="text-sm text-muted hover:text-ink transition-colors">
            Sign out
          </Link>
        </div>
      </div>
    </nav>
  )
}
