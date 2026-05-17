"use client"

import { useCallback, useEffect, useState } from "react"
import { dominantMood } from "@/lib/discover/dominantMood"
import type { DiscoverState, Wej } from "@/lib/discover/types"

interface UseDiscoverSession {
  state: DiscoverState | null
  loading: boolean
  loadWej: (theme: string) => Promise<void>
  toggleSave: (poiId: string, saved: boolean) => Promise<void>
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

// Loads the anonymous session on mount, derives the dominant mood from the
// Mana, and drives Wej loading + POI saving for the Discover flow.
export function useDiscoverSession(): UseDiscoverSession {
  const [state, setState] = useState<DiscoverState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch("/api/moment/session")
      .then((res) => res.json())
      .then((data: SessionResponse) => {
        if (cancelled) return
        const mood = dominantMood(
          data.signal?.moods ?? [],
          data.signal?.resonatedClusters ?? [],
        )
        setState({
          sessionId: data.sessionId,
          mood,
          currentWej: null,
          seenThemes: [],
          savedPoiIds: data.savedPoiIds ?? [],
        })
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const loadWej = useCallback(
    async (theme: string) => {
      if (!state) return
      const params = new URLSearchParams({ mood: state.mood, theme })
      try {
        const res = await fetch(`/api/discover/wej?${params}`)
        if (!res.ok) return
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
      setState((prev) => {
        if (!prev) return prev
        const next = saved
          ? prev.savedPoiIds.includes(poiId)
            ? prev.savedPoiIds
            : [...prev.savedPoiIds, poiId]
          : prev.savedPoiIds.filter((id) => id !== poiId)
        return { ...prev, savedPoiIds: next }
      })
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

  return { state, loading, loadWej, toggleSave }
}
