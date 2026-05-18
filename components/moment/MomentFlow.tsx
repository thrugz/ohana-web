"use client"

import { useMomentSession } from "./useMomentSession"
import { Stage1World } from "./stages/Stage1World"
import { Stage2Mood } from "./stages/Stage2Mood"
import { Stage3Feel } from "./stages/Stage3Feel"
import { Stage4Atlas } from "./stages/Stage4Atlas"
import { Stage5Moments } from "./stages/Stage5Moments"

const STAGES = {
  1: Stage1World,
  2: Stage2Mood,
  3: Stage3Feel,
  4: Stage4Atlas,
  5: Stage5Moments,
} as const

// Client host for the Moment flow: drives the session machine and renders
// the stage component matching the current stage.
export function MomentFlow() {
  const { state, commit, advanceStage, loading, error, retry } = useMomentSession()

  if (error) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 text-muted">
        <p>We couldn&apos;t start your session.</p>
        <button
          type="button"
          onClick={retry}
          className="rounded-full bg-clay px-5 py-2 text-sm text-primary-foreground"
        >
          Try again
        </button>
      </div>
    )
  }

  if (loading || !state) {
    return <div className="flex min-h-dvh items-center justify-center text-muted">Loading…</div>
  }

  const Stage = STAGES[state.currentStage]
  return <Stage signal={state.signal} commit={commit} advanceStage={advanceStage} />
}
