import type { ManaSignal, MomentStage } from "./types"

export function advance(stage: MomentStage): MomentStage {
  return (stage < 5 ? stage + 1 : 5) as MomentStage
}

export function canAdvance(stage: MomentStage, signal: ManaSignal): boolean {
  switch (stage) {
    case 1: return signal.visitedCountries.length > 0
    case 2: return signal.moods.length > 0
    case 3: return signal.resonatedClusters.length > 0
    case 4: return signal.manaSummary !== null
    case 5: return true
  }
}

export function isComplete(stage: MomentStage, signal: ManaSignal): boolean {
  return stage === 5 && signal.manaSummary !== null
}
