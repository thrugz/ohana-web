// GET /api/discover/wej?mood=&theme= — returns a "Wej": the POIs tagged with
// both a mood and a theme, ranked by enrichment confidence, capped at 14.
//
// Depth guard: a Wej with fewer than 6 cards is returned as { thin: true } so
// the caller (Hoku) never offers a theme whose result set is near-empty. This
// structurally absorbs a thin demo poi_final.
import { NextResponse } from "next/server"
import { getPool } from "@/lib/moment/db"
import type { WejCard } from "@/lib/discover/types"

const DEPTH_MIN = 6
const WEJ_CAP = 14

// A poi_final row, as far as the Wej query selects it.
interface PoiFinalRow {
  id: string
  name: string
  short_description: string | null
  photos: unknown
  source_id: string | null
  city_name: string | null
}

/**
 * Pure, parameterised SQL select for a Wej. `poi_final.moods` and
 * `poi_final.themes` are TEXT[] columns (GIN-indexed); `@>` is array
 * containment, so each param is itself a single-element array.
 *
 * `operational_status` is the real lifecycle column on poi_final — there is
 * no `status` column (the OHA-24 reconciliation, migration 043, exposes
 * operational_status as-is). 'active' is a SQL literal so $1/$2 map cleanly
 * to the two array params.
 */
export function buildWejQuery(mood: string, theme: string): { text: string; values: string[][] } {
  const text = `
    SELECT id, name, short_description, photos, source_id, city_name
    FROM poi_final
    WHERE moods @> $1
      AND themes @> $2
      AND operational_status = 'active'
    ORDER BY confidence_score DESC NULLS LAST
    LIMIT ${WEJ_CAP}
  `
  return { text, values: [[mood], [theme]] }
}

// poi_final.photos is JSONB defaulting to '[]'. The element shape is not
// pinned by a migration; handle a bare URL string or an object with a url/src
// key, and fall back to null. See route concern note in the task report.
function firstPhotoUrl(photos: unknown): string | null {
  if (!Array.isArray(photos) || photos.length === 0) return null
  const first = photos[0]
  if (typeof first === "string") return first
  if (first && typeof first === "object") {
    const obj = first as Record<string, unknown>
    const candidate = obj.url ?? obj.src ?? obj.href
    if (typeof candidate === "string") return candidate
  }
  return null
}

function rowToCard(row: PoiFinalRow, mood: string, theme: string): WejCard {
  return {
    poiId: row.id,
    name: row.name,
    shortDescription: row.short_description ?? "",
    photoUrl: firstPhotoUrl(row.photos),
    mood,
    theme,
    source: row.source_id ?? "unknown",
    city: row.city_name ?? null,
  }
}

// Title-case a theme slug, e.g. "slow_food" / "slow-food" -> "Slow Food".
export function themeTitle(theme: string): string {
  return theme
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams
  const mood = params.get("mood")?.trim()
  const theme = params.get("theme")?.trim()

  if (!mood || !theme) {
    return NextResponse.json({ error: "mood and theme are required" }, { status: 400 })
  }

  const { text, values } = buildWejQuery(mood, theme)

  let cards: WejCard[] = []
  try {
    const result = await getPool().query<PoiFinalRow>(text, values)
    cards = result.rows.map((row) => rowToCard(row, mood, theme))
  } catch {
    // poi_final unavailable — treat as an empty (thin) Wej rather than 500ing.
    cards = []
  }

  const title = themeTitle(theme)

  // Depth guard: too few cards to make a worthwhile Wej.
  if (cards.length < DEPTH_MIN) {
    return NextResponse.json({ mood, theme, title, thin: true, cards })
  }

  return NextResponse.json({ mood, theme, title, cards })
}
