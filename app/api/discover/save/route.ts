// POST /api/discover/save — save or unsave a POI into a traveller's
// collection. The collection lives in the `saved_pois` UUID[] column on
// anonymous_session (migration 056) and feeds the Sprint 6 planner.
import { NextResponse } from "next/server"
import { getPool, isUuid } from "@/lib/moment/db"

/**
 * Pure save/unsave application. When `saved` is true, append `poiId` deduped
 * (unchanged if already present); when false, remove it. Never mutates input.
 */
export function applySave(current: string[], poiId: string, saved: boolean): string[] {
  if (saved) {
    if (current.includes(poiId)) return [...current]
    return [...current, poiId]
  }
  return current.filter((id) => id !== poiId)
}

export async function POST(req: Request) {
  let body: { sessionId?: unknown; poiId?: unknown; saved?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { sessionId, poiId, saved } = body

  if (!isUuid(sessionId)) {
    return NextResponse.json({ error: "Invalid sessionId" }, { status: 400 })
  }
  if (typeof poiId !== "string" || !poiId) {
    return NextResponse.json({ error: "Invalid poiId" }, { status: 400 })
  }

  try {
    const pool = getPool()
    const result = await pool.query<{ saved_pois: string[] | null }>(
      "SELECT saved_pois FROM anonymous_session WHERE id = $1",
      [sessionId],
    )
    const current = result.rows[0]?.saved_pois ?? []
    const savedPoiIds = applySave(current, poiId, Boolean(saved))

    await pool.query("UPDATE anonymous_session SET saved_pois = $1 WHERE id = $2", [
      savedPoiIds,
      sessionId,
    ])

    return NextResponse.json({ savedPoiIds })
  } catch {
    return NextResponse.json({ error: "Failed to update saved POIs" }, { status: 500 })
  }
}
