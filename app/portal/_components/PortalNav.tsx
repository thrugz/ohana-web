import Link from "next/link"

export function PortalNav() {
  return (
    <nav className="border-b border-line bg-surface px-6 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/portal" className="font-serif text-lg text-ink" style={{ fontWeight: 400 }}>
          Ohana Portal
        </Link>
        <Link href="/sign-in" className="text-sm text-muted hover:text-ink transition-colors">
          Sign out
        </Link>
      </div>
    </nav>
  )
}
