"use client"

import { useCallback, useEffect, useState } from "react"
import { advance } from "@/lib/moment/momentMachine"
import type { CommitPatch, MomentState } from "@/lib/moment/types"

export type { CommitPatch }

interface UseMomentSession {
  state: MomentState | null
  commit: (patch: CommitPatch) => Promise<void>
  advanceStage: () => Promise<void>
  loading: boolean
}

// Loads the anonymous session on mount and persists stage signals. commit
// optimistically updates local state, then POSTs to /api/moment/commit.
export function useMomentSession(): UseMomentSession {
  const [state, setState] = useState<MomentState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch("/api/moment/session")
      .then((res) => res.json())
      .then((data: MomentState) => {
        if (!cancelled) setState(data)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const commit = useCallback(
    async (patch: CommitPatch) => {
      if (!state) return
      const next: MomentState = {
        ...state,
        currentStage: (patch.currentStage as MomentState["currentStage"]) ?? state.currentStage,
        completedAt: patch.completedAt ?? state.completedAt,
        signal: {
          ...state.signal,
          ...("visitedCountries" in patch ? { visitedCountries: patch.visitedCountries! } : {}),
          ...("moods" in patch ? { moods: patch.moods! } : {}),
          ...("freeText" in patch ? { freeText: patch.freeText! } : {}),
          ...("resonatedClusters" in patch ? { resonatedClusters: patch.resonatedClusters! } : {}),
          ...("manaSummary" in patch ? { manaSummary: patch.manaSummary! } : {}),
        },
      }
      setState(next)
      try {
        const res = await fetch("/api/moment/commit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: state.sessionId, patch }),
        })
        if (res.ok) {
          const persisted: MomentState = await res.json()
          setState(persisted)
        }
      } catch {
        // Optimistic state stands; a later commit will reconcile.
      }
    },
    [state],
  )

  const advanceStage = useCallback(async () => {
    if (!state) return
    await commit({ currentStage: advance(state.currentStage) })
  }, [state, commit])

  return { state, commit, advanceStage, loading }
}
