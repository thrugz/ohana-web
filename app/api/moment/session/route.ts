// GET /api/moment/session — returns the current anonymous Moment session,
// creating one (and setting the httpOnly cookie) if none exists.
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getPool, isUuid } from "@/lib/moment/db"
import { rowToState, type SessionRow } from "@/lib/moment/session"

const COOKIE = "moment_session"
const SELECT_COLS =
  "id, current_stage, visited_countries, moods, free_text, resonated_clusters, mana_summary, completed_at"

export async function GET() {
  const pool = getPool()
  const jar = await cookies()
  const existing = jar.get(COOKIE)?.value

  if (isUuid(existing)) {
    const found = await pool.query<SessionRow>(
      `SELECT ${SELECT_COLS} FROM anonymous_session WHERE id = $1`,
      [existing],
    )
    if (found.rows[0]) {
      return NextResponse.json(rowToState(found.rows[0]))
    }
  }

  const created = await pool.query<SessionRow>(
    `INSERT INTO anonymous_session DEFAULT VALUES RETURNING ${SELECT_COLS}`,
  )
  const state = rowToState(created.rows[0])
  const res = NextResponse.json(state)
  res.cookies.set(COOKIE, state.sessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
  return res
}
