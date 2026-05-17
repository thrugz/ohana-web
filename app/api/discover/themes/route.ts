// GET /api/discover/themes?session=<id>&seen=a&seen=b — returns the theme
// options Hoku can offer a traveller next.
//
// The session's dominant mood drives every candidate Wej. A theme is only
// returned if its Wej (dominant mood × theme) clears the >=6-card depth guard
// and the traveller has not already seen it. This means Hoku never steers a
// traveller toward a theme that would surface a near-empty feed.
import { NextResponse } from "next/server"
import { dominantMood } from "@/lib/discover/dominantMood"
import { titleCaseSlug } from "@/lib/discover/slug"
import { getPool, isUuid } from "@/lib/moment/db"

// A Wej needs at least this many cards to be worth offering (the depth guard).
const DEPTH_MIN = 6

interface ThemeOption {
  slug: string
  label: string
}

// Parse ?seen= — supports repeated params (?seen=a&seen=b) and a single
// comma-separated value (?seen=a,b).
export function parseSeen(params: URLSearchParams): Set<string> {
  const seen = new Set<string>()
  for (const raw of params.getAll("seen")) {
    for (const slug of raw.split(",")) {
      const trimmed = slug.trim()
      if (trimmed) seen.add(trimmed)
    }
  }
  return seen
}

// Candidate themes: prefer the canonical `themes` registry (migration 008c /
// 045). If it is empty or unavailable, fall back to the live theme vocabulary
// distinct from poi_final itself.
async function candidateThemes(): Promise<ThemeOption[]> {
  const pool = getPool()
  try {
    const registry = await pool.query<{ slug: string; name: string }>(
      "SELECT slug, name FROM themes WHERE active = TRUE ORDER BY slug",
    )
    if (registry.rows.length > 0) {
      return registry.rows.map((r) => ({ slug: r.slug, label: r.name }))
    }
  } catch {
    // No themes registry — fall through to the poi_final vocabulary.
  }

  try {
    const live = await pool.query<{ theme: string }>(
      "SELECT DISTINCT unnest(themes) AS theme FROM poi_final WHERE operational_status = 'active' ORDER BY theme",
    )
    return live.rows
      .filter((r) => r.theme)
      .map((r) => ({ slug: r.theme, label: titleCaseSlug(r.theme) }))
  } catch {
    return []
  }
}

// One grouped query: for the given mood, the set of theme slugs whose Wej
// clears the depth guard. Replaces an N+1 per-theme count loop.
async function deepThemes(mood: string): Promise<Set<string>> {
  try {
    const result = await getPool().query<{ theme: string }>(
      `SELECT unnest(themes) AS theme
         FROM poi_final
        WHERE moods @> $1
          AND operational_status = 'active'
        GROUP BY 1
       HAVING count(*) >= $2`,
      [[mood], DEPTH_MIN],
    )
    return new Set(result.rows.map((r) => r.theme))
  } catch {
    return new Set()
  }
}

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams
  const sessionId = params.get("session")

  if (!isUuid(sessionId)) {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 })
  }

  // Read the session's dominant mood from anonymous_session.
  let moods: string[] = []
  let clusters: string[] = []
  try {
    const result = await getPool().query<{ moods: string[]; resonated_clusters: string[] }>(
      "SELECT moods, resonated_clusters FROM anonymous_session WHERE id = $1",
      [sessionId],
    )
    moods = result.rows[0]?.moods ?? []
    clusters = result.rows[0]?.resonated_clusters ?? []
  } catch {
    // DB unavailable — dominantMood falls back to a safe default below.
  }

  const mood = dominantMood(moods, clusters)
  const seen = parseSeen(params)

  // Two queries total: the candidate registry and the grouped depth check.
  const [candidates, deep] = await Promise.all([candidateThemes(), deepThemes(mood)])

  const offerable = candidates.filter((t) => deep.has(t.slug) && !seen.has(t.slug))

  return NextResponse.json(offerable)
}
