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

// A patch sent to the session: any signal field plus stage/completion.
export type CommitPatch = Partial<ManaSignal> & {
  currentStage?: number
  completedAt?: string
}

// Props every stage scene receives from MomentFlow.
export interface StageProps {
  signal: ManaSignal
  commit: (patch: CommitPatch) => void | Promise<void>
  advanceStage: () => void | Promise<void>
}

export const EMPTY_SIGNAL: ManaSignal = {
  visitedCountries: [],
  moods: [],
  freeText: {},
  resonatedClusters: [],
  manaSummary: null,
}
