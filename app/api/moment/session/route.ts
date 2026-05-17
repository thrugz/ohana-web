// GET /api/moment/session — returns the current anonymous Moment session,
// creating one (and setting the httpOnly cookie) if none exists.
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getPool, isUuid } from "@/lib/moment/db"
import { rowToState, type SessionRow } from "@/lib/moment/session"

const COOKIE = "moment_session"
// saved_pois is selected so the Discover flow can rehydrate a traveller's
// saved POIs on reload; it is attached to the response, not to MomentState.
const SELECT_COLS =
  "id, current_stage, visited_countries, moods, free_text, resonated_clusters, mana_summary, completed_at, saved_pois"

type SessionRowWithSaved = SessionRow & { saved_pois: string[] | null }

export async function GET() {
  const pool = getPool()
  const jar = await cookies()
  const existing = jar.get(COOKIE)?.value

  if (isUuid(existing)) {
    const found = await pool.query<SessionRowWithSaved>(
      `SELECT ${SELECT_COLS} FROM anonymous_session WHERE id = $1`,
      [existing],
    )
    if (found.rows[0]) {
      return NextResponse.json({
        ...rowToState(found.rows[0]),
        savedPoiIds: found.rows[0].saved_pois ?? [],
      })
    }
  }

  const created = await pool.query<SessionRowWithSaved>(
    `INSERT INTO anonymous_session DEFAULT VALUES RETURNING ${SELECT_COLS}`,
  )
  const state = { ...rowToState(created.rows[0]), savedPoiIds: created.rows[0].saved_pois ?? [] }
  const res = NextResponse.json(state)
  res.cookies.set(COOKIE, state.sessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
  return res
}
