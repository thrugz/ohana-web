import { cache } from "react"
import { getTwinSession } from "@/lib/auth/session"
import { getPool } from "@/lib/moment/db"
import { explorerBadge } from "@/lib/moment/explorerBadge"
import { getProfile } from "@/lib/twin/profile"

export interface SavedPoi {
  id: string
  name: string
  slug: string
  shortDescription: string | null
  poiType: string | null
}

export interface TwinData {
  userId: string
  visitedCountries: string[]
  moods: string[]
  portrait: string | null
  explorerBadge: string
  savedPois: SavedPoi[]
  preferredMoods: string[]
  preferredThemes: string[]
}

export const getTwinData = cache(async (): Promise<TwinData | null> => {
  const session = await getTwinSession()
  if (!session?.user?.id) return null

  const pool = getPool()

  const [sessionRow, profile] = await Promise.all([
    pool.query<{
      visited_countries: string[]
      moods: string[]
      mana_summary: { explorerBadge?: string; portrait?: string } | null
      saved_pois: string[] | null
    }>(
      `SELECT visited_countries, moods, mana_summary, saved_pois
       FROM anonymous_session
       WHERE linked_user_id = $1
       ORDER BY completed_at DESC NULLS LAST
       LIMIT 1`,
      [session.user.id],
    ),
    getProfile(session.user.id),
  ])

  const row = sessionRow.rows[0]
  const visitedCountries = profile?.visitedCountries ?? row?.visited_countries ?? []
  const moods = row?.moods ?? []
  const portrait = row?.mana_summary?.portrait ?? null
  const rawSavedPoiIds = row?.saved_pois ?? []

  let savedPois: SavedPoi[] = []
  if (rawSavedPoiIds.length > 0) {
    const poiRows = await pool.query<{
      id: string
      name: string
      slug: string
      short_description: string | null
      poi_type: string | null
    }>(
      `SELECT id, name, slug, short_description, poi_type
       FROM poi_final
       WHERE id = ANY($1)`,
      [rawSavedPoiIds],
    )
    savedPois = poiRows.rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      shortDescription: r.short_description,
      poiType: r.poi_type,
    }))
  }

  return {
    userId: session.user.id,
    visitedCountries,
    moods,
    portrait,
    explorerBadge: explorerBadge(visitedCountries.length),
    savedPois,
    preferredMoods: profile?.preferredMoods ?? moods,
    preferredThemes: profile?.preferredThemes ?? [],
  }
})
