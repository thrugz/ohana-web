export type MomentStage = 1 | 2 | 3 | 4 | 5

export interface ManaSignal {
  visitedCountries: string[]   // ISO-3166 alpha-2
  moods: string[]              // KGE Mood registry slugs
  freeText: Record<string, string>  // keyed by prompt id
  resonatedClusters: string[]  // KGE cluster ids
  manaSummary: ManaSummary | null
}

export interface ManaSummary {
  wandererName: string         // e.g. "The Slow Unfolder"
  portrait: string             // Hoku-generated paragraph
}

export interface MomentState {
  sessionId: string
  currentStage: MomentStage
  signal: ManaSignal
  completedAt: string | null
}

export const EMPTY_SIGNAL: ManaSignal = {
  visitedCountries: [],
  moods: [],
  freeText: {},
  resonatedClusters: [],
  manaSummary: null,
}
