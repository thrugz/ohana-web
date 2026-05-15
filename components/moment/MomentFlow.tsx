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
  const { state, loading } = useMomentSession()

  if (loading || !state) {
    return <div className="flex min-h-dvh items-center justify-center text-muted">Loading…</div>
  }

  const Stage = STAGES[state.currentStage]
  return <Stage />
}
