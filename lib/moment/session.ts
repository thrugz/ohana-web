// Maps an anonymous_session DB row to the MomentState shape used client-side.
import type { ManaSummary, MomentStage, MomentState } from "./types"

export interface SessionRow {
  id: string
  current_stage: number
  visited_countries: string[]
  moods: string[]
  free_text: Record<string, string>
  resonated_clusters: string[]
  mana_summary: ManaSummary | null
  completed_at: Date | string | null
}

export function rowToState(row: SessionRow): MomentState {
  return {
    sessionId: row.id,
    currentStage: clampStage(row.current_stage),
    signal: {
      visitedCountries: row.visited_countries ?? [],
      moods: row.moods ?? [],
      freeText: row.free_text ?? {},
      resonatedClusters: row.resonated_clusters ?? [],
      manaSummary: row.mana_summary ?? null,
    },
    completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : null,
  }
}

function clampStage(stage: number): MomentStage {
  if (stage < 1) return 1
  if (stage > 5) return 5
  return stage as MomentStage
}
