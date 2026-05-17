"use client"

import { useCallback, useEffect, useState } from "react"
import { dominantMood } from "@/lib/discover/dominantMood"
import type { DiscoverState, Wej } from "@/lib/discover/types"

interface UseDiscoverSession {
  state: DiscoverState | null
  loading: boolean
  error: boolean
  // False when the session arrived with no Mana (no moods, no clusters) — the
  // dominant mood was a silent default. DiscoverFlow uses this to ask the
  // traveller via ColdStartMoodPick instead of running with the default.
  hasMana: boolean
  retry: () => void
  loadWej: (theme: string) => Promise<void>
  toggleSave: (poiId: string, saved: boolean) => Promise<void>
  // Seeds the dominant mood directly (used by the cold-start mood pick).
  seedMood: (mood: string) => void
}

// Shape of GET /api/moment/session, plus saved_pois for reload-persistence.
interface SessionResponse {
  sessionId: string
  signal?: {
    moods?: string[]
    resonatedClusters?: string[]
  }
  savedPoiIds?: string[]
}

/**
 * Pure save/unsave list merge. When `saved` is true, append `poiId` deduped;
 * when false, remove it. Never mutates input. Mirrors `applySave` in the save
 * route so the optimistic update matches what the server will persist.
 */
export function applySaveToList(current: string[], poiId: string, saved: boolean): string[] {
  if (saved) {
    if (current.includes(poiId)) return [...current]
    return [...current, poiId]
  }
  return current.filter((id) => id !== poiId)
}

// Loads the anonymous session on mount, derives the dominant mood from the
// Mana, and drives Wej loading + POI saving for the Discover flow.
export function useDiscoverSession(): UseDiscoverSession {
  const [state, setState] = useState<DiscoverState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  // Whether the mounted session carried any Mana to derive a mood from.
  const [hasMana, setHasMana] = useState(false)
  // Bumped by retry() to re-trigger the mount fetch effect.
  const [attempt, setAttempt] = useState(0)

  const retry = useCallback(() => {
    setAttempt((n) => n + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    fetch("/api/moment/session")
      .then(async (res) => {
        if (!res.ok) throw new Error(`session fetch failed: ${res.status}`)
        const data: SessionResponse = await res.json()
        if (cancelled) return
        const moods = data.signal?.moods ?? []
        const clusters = data.signal?.resonatedClusters ?? []
        const mood = dominantMood(moods, clusters)
        setHasMana(moods.length > 0 || clusters.length > 0)
        setState({
          sessionId: data.sessionId,
          mood,
          currentWej: null,
          seenThemes: [],
          savedPoiIds: data.savedPoiIds ?? [],
        })
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  const loadWej = useCallback(
    async (theme: string) => {
      if (!state) return
      const params = new URLSearchParams({ mood: state.mood, theme })
      try {
        const res = await fetch(`/api/discover/wej?${params}`)
        if (!res.ok) return
        // The wej route may return { thin: true } when the depth guard trips;
        // preserve it so Phase 3/4 components can branch on a thin feed.
        const wej: Wej = await res.json()
        setState((prev) =>
          prev
            ? {
                ...prev,
                currentWej: wej,
                seenThemes: prev.seenThemes.includes(theme)
                  ? prev.seenThemes
                  : [...prev.seenThemes, theme],
              }
            : prev,
        )
      } catch {
        // Leave current Wej in place; the traveller can retry.
      }
    },
    [state],
  )

  const toggleSave = useCallback(
    async (poiId: string, saved: boolean) => {
      if (!state) return
      const sessionId = state.sessionId
      // Optimistic: reflect the save immediately.
      setState((prev) =>
        prev
          ? { ...prev, savedPoiIds: applySaveToList(prev.savedPoiIds, poiId, saved) }
          : prev,
      )
      try {
        const res = await fetch("/api/discover/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, poiId, saved }),
        })
        if (res.ok) {
          const { savedPoiIds }: { savedPoiIds: string[] } = await res.json()
          setState((prev) => (prev ? { ...prev, savedPoiIds } : prev))
        }
      } catch {
        // Optimistic state stands; a later toggle will reconcile.
      }
    },
    [state],
  )

  // Seed the dominant mood from a cold-start pick. Marks the session as
  // having Mana so DiscoverFlow proceeds past the mood-pick branch.
  const seedMood = useCallback((mood: string) => {
    setState((prev) => (prev ? { ...prev, mood } : prev))
    setHasMana(true)
  }, [])

  return { state, loading, error, hasMana, retry, loadWej, toggleSave, seedMood }
}
