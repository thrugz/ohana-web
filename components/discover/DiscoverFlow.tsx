"use client"

import { HokuMessage } from "@/components/moment/HokuMessage"
import { HokuThread } from "@/components/moment/HokuThread"
import { useDiscoverSession } from "./useDiscoverSession"

// Client host for the Discover flow. Reuses the Moment Site's Hoku chat shell
// and drives the discover session hook. The Wej feed, cards, theme steering,
// and saved tray land in later phases — this is the shell that hosts them.
export function DiscoverFlow() {
  const { state, loading, error, retry } = useDiscoverSession()

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
    <div data-testid="discover-flow">
      <HokuThread>
        <HokuMessage from="hoku">
          Let&apos;s find places that match how you want to feel.
        </HokuMessage>
        {state.currentWej ? (
          // Phase 3: WejFeed renders state.currentWej here.
          <div data-testid="wej-area" className="text-muted text-sm">
            Wej: {state.currentWej.title}
          </div>
        ) : (
          // Phase 4: ThemeSteer / theme picker renders here.
          <div data-testid="theme-picker" className="text-muted text-sm">
            Choosing a theme…
          </div>
        )}
      </HokuThread>
    </div>
  )
}
