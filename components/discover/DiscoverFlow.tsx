"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { HokuMessage } from "@/components/moment/HokuMessage"
import { HokuThread } from "@/components/moment/HokuThread"
import { SavedTray } from "./SavedTray"
import { ThemeSteer } from "./ThemeSteer"
import { useDiscoverSession } from "./useDiscoverSession"
import { WejFeed } from "./WejFeed"
import type { WejCard } from "@/lib/discover/types"

interface ThemeOption {
  slug: string
  label: string
}

// Client host for the Discover flow. Drives the sequential session loop:
// Hoku presents one Wej, the traveller scrolls + saves, then Hoku steers to
// the next theme and the loop repeats. The SavedTray is always mounted.
export function DiscoverFlow() {
  const { state, loading, error, retry, loadWej, toggleSave } = useDiscoverSession()
  const [themes, setThemes] = useState<ThemeOption[]>([])
  const [themesError, setThemesError] = useState(false)
  // Bumped to re-trigger the themes fetch after a failure.
  const [themesAttempt, setThemesAttempt] = useState(0)

  const sessionId = state?.sessionId
  const seenKey = state?.seenThemes.join(",") ?? ""

  const retryThemes = useCallback(() => {
    setThemesAttempt((n) => n + 1)
  }, [])

  // Fetch the offerable themes whenever the session or the seen-set changes.
  // The route returns a bare ThemeOption[] array. A failed fetch sets
  // `themesError` so the steer area can surface a retry, distinct from a
  // genuine empty offerable set.
  useEffect(() => {
    if (!sessionId) return
    let cancelled = false
    setThemesError(false)
    const params = new URLSearchParams({ session: sessionId })
    if (seenKey) params.set("seen", seenKey)
    fetch(`/api/discover/themes?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error(`themes fetch failed: ${res.status}`)
        return res.json()
      })
      .then((data: ThemeOption[]) => {
        if (!cancelled) setThemes(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) {
          setThemes([])
          setThemesError(true)
        }
      })
    return () => {
      cancelled = true
    }
  }, [sessionId, seenKey, themesAttempt])

  // Accumulate every card Hoku has shown, so the SavedTray can resolve saved
  // POI ids back to full cards even after the Wej moves on.
  const [seenCards, setSeenCards] = useState<Record<string, WejCard>>({})
  const currentWej = state?.currentWej
  useEffect(() => {
    if (!currentWej) return
    setSeenCards((prev) => {
      const next = { ...prev }
      for (const card of currentWej.cards) next[card.poiId] = card
      return next
    })
  }, [currentWej])

  const savedCards = useMemo(
    () =>
      (state?.savedPoiIds ?? [])
        .map((id) => seenCards[id])
        .filter((card): card is WejCard => card !== undefined),
    [state?.savedPoiIds, seenCards],
  )

  const handlePick = useCallback(
    (theme: string) => {
      void loadWej(theme)
    },
    [loadWej],
  )

  // The steer area: chips + free-text input, plus an inline retry when the
  // themes fetch failed (so a collapsed chip row is never mistaken for a
  // genuine empty offerable set).
  const steerArea = (
    <>
      <ThemeSteer themes={themes} onPick={handlePick} />
      {themesError && (
        <p className="text-muted flex items-center gap-2 text-sm">
          <span>We couldn&apos;t load theme suggestions.</span>
          <button
            type="button"
            onClick={retryThemes}
            className="border-clay text-clay rounded-full border px-3 py-1 text-xs"
          >
            Retry
          </button>
        </p>
      )}
    </>
  )

  if (error) {
    return (
      <div
        data-testid="discover-flow"
        className="flex min-h-dvh flex-col items-center justify-center gap-4 text-muted"
      >
        <p>We couldn&apos;t start your discovery session.</p>
        <button
          type="button"
          onClick={retry}
          className="bg-clay text-primary-foreground rounded-full px-5 py-2 text-sm"
        >
          Try again
        </button>
      </div>
    )
  }

  if (loading || !state) {
    return (
      <div
        data-testid="discover-flow"
        className="flex min-h-dvh items-center justify-center text-muted"
      >
        Loading…
      </div>
    )
  }

  return (
    <div data-testid="discover-flow" className="pb-24">
      <HokuThread>
        <HokuMessage from="hoku">
          Let&apos;s find places that match how you want to feel.
        </HokuMessage>

        {state.currentWej ? (
          <>
            <WejFeed
              wej={state.currentWej}
              savedPoiIds={state.savedPoiIds}
              onToggleSave={toggleSave}
            />
            <HokuMessage from="hoku">
              Where shall we wander next?
            </HokuMessage>
            {steerArea}
          </>
        ) : (
          <>
            <HokuMessage from="hoku">
              What kind of places are you in the mood for?
            </HokuMessage>
            {steerArea}
          </>
        )}
      </HokuThread>

      <SavedTray cards={savedCards} />
    </div>
  )
}
