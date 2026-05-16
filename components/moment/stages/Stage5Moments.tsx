"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { HokuMessage } from "../HokuMessage"
import type { StageProps } from "@/lib/moment/types"

// Stage 5 — "Moments." A light bridge: Hoku's forward-looking line, a
// completion screen, and a single CTA into Discovery. Marks the session
// complete on mount.
export function Stage5Moments({ commit }: StageProps) {
  const marked = useRef(false)

  useEffect(() => {
    if (marked.current) return
    marked.current = true
    commit({ completedAt: new Date().toISOString() })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      data-testid="stage-5"
      className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-8 text-center"
    >
      <HokuMessage from="hoku">
        That&apos;s your Mana taking shape. From here, every place I show you is
        chosen for you — let&apos;s go find your moments.
      </HokuMessage>

      <h1 className="font-serif text-4xl text-ink" style={{ fontWeight: 400 }}>
        Your Mana is ready
      </h1>
      <p className="max-w-sm text-muted">
        Your traveller signal is saved. Discovery is where it comes to life.
      </p>

      <Link
        href="/discover"
        className="rounded-full bg-clay px-7 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Take me to Discovery →
      </Link>
    </div>
  )
}
