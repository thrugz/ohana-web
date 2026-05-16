"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"
import { HokuMessage } from "../HokuMessage"
import { explorerBadge } from "@/lib/moment/explorerBadge"
import type { StageProps } from "@/lib/moment/types"

// Pre-authored portrait used when the hoku_agent call returns nothing —
// Stage 4 must never block on a failed LLM call (spec §3.3).
const GENERIC_PORTRAIT =
  "You travel with an open heart — curious, unhurried, and ready to be moved by " +
  "wherever you find yourself. Places don't just pass you by; they leave a mark."

// Stage 4 — "Moods Atlas." A computed Explorer Badge tier (deterministic,
// no LLM) plus a Hoku-generated mood portrait.
export function Stage4Atlas({ signal, commit, advanceStage }: StageProps) {
  // Computed synchronously — instant, always real.
  const badge = explorerBadge(signal.visitedCountries.length)
  const [portrait, setPortrait] = useState<string | null>(null)
  const requested = useRef(false)

  useEffect(() => {
    if (requested.current) return
    requested.current = true
    let cancelled = false

    async function generatePortrait() {
      let text = ""
      try {
        const res = await fetch("/api/moment/hoku", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "portrait",
            payload: {
              visitedCountries: signal.visitedCountries,
              moods: signal.moods,
              resonatedClusters: signal.resonatedClusters,
              freeText: signal.freeText,
            },
          }),
        })
        if (res.ok) {
          const data: { portrait?: string; reply?: string } = await res.json()
          text = (data.portrait ?? data.reply ?? "").trim()
        }
      } catch {
        // Network failure falls through to the pre-authored portrait.
      }
      if (cancelled) return
      const final = text || GENERIC_PORTRAIT
      setPortrait(final)
      commit({ manaSummary: { explorerBadge: badge, portrait: final } })
    }

    generatePortrait()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div data-testid="stage-4" className="flex min-h-dvh flex-col gap-6 px-4 py-8">
      <HokuMessage from="hoku">
        I&apos;ve been reading your Mana. I&apos;m Hoku, by the way — I&apos;ll be
        with you from here. Here&apos;s what I see.
      </HokuMessage>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
        className="rounded-3xl border border-line bg-surface p-6"
      >
        <p className="text-sm uppercase tracking-wide text-muted">Your traveller tier</p>
        <p className="mt-1 font-serif text-3xl text-ink" style={{ fontWeight: 400 }}>
          {badge}
        </p>

        <div className="mt-5 border-t border-line pt-5">
          {portrait === null ? (
            <p className="text-muted" aria-live="polite">
              Hoku is reading your Mana…
            </p>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="leading-relaxed text-ink"
            >
              {portrait}
            </motion.p>
          )}
        </div>
      </motion.div>

      <div className="mt-auto flex justify-end pt-4">
        <button
          type="button"
          disabled={portrait === null}
          onClick={() => advanceStage()}
          className="rounded-full bg-clay px-6 py-2.5 font-medium text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
