// POST /api/moment/commit — persists a stage's captured signal to the
// anonymous_session row. Body: { sessionId, patch }.
import { NextResponse } from "next/server"
import { getPool, isUuid } from "@/lib/moment/db"
import { rowToState, type SessionRow } from "@/lib/moment/session"

const SELECT_COLS =
  "id, current_stage, visited_countries, moods, free_text, resonated_clusters, mana_summary, completed_at"

// Maps a patch key to its DB column. Only these keys are accepted.
const COLUMN: Record<string, string> = {
  currentStage: "current_stage",
  visitedCountries: "visited_countries",
  moods: "moods",
  freeText: "free_text",
  resonatedClusters: "resonated_clusters",
  manaSummary: "mana_summary",
  completedAt: "completed_at",
}

const JSON_COLS = new Set(["free_text", "mana_summary"])

export async function POST(req: Request) {
  let body: { sessionId?: unknown; patch?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { sessionId, patch } = body
  if (!isUuid(sessionId)) {
    return NextResponse.json({ error: "Invalid sessionId" }, { status: 400 })
  }
  if (!patch || typeof patch !== "object") {
    return NextResponse.json({ error: "Missing patch" }, { status: 400 })
  }

  const sets: string[] = []
  const values: unknown[] = []
  for (const [key, value] of Object.entries(patch as Record<string, unknown>)) {
    const col = COLUMN[key]
    if (!col) continue
    values.push(JSON_COLS.has(col) ? JSON.stringify(value) : value)
    sets.push(`${col} = $${values.length}`)
  }

  if (sets.length === 0) {
    return NextResponse.json({ error: "No valid fields in patch" }, { status: 400 })
  }

  sets.push("updated_at = NOW()")
  values.push(sessionId)

  const pool = getPool()
  const updated = await pool.query<SessionRow>(
    `UPDATE anonymous_session SET ${sets.join(", ")} WHERE id = $${values.length} RETURNING ${SELECT_COLS}`,
    values,
  )

  if (!updated.rows[0]) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  return NextResponse.json(rowToState(updated.rows[0]))
}
