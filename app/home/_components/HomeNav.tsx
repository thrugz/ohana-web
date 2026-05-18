"use client"

import Link from "next/link"
import { authClient } from "@/lib/auth/client"
import { useRouter } from "next/navigation"

export function HomeNav({ userName }: { userName?: string | null }) {
  const router = useRouter()

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/sign-in")
  }

  return (
    <nav className="border-b border-line bg-surface px-6 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/home" className="font-serif text-lg text-ink" style={{ fontWeight: 400 }}>
          Ohana
        </Link>
        <div className="flex items-center gap-4">
          {userName && (
            <span className="text-sm text-muted hidden sm:block">{userName}</span>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="text-sm text-muted hover:text-ink transition-colors bg-transparent border-none cursor-pointer p-0"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
