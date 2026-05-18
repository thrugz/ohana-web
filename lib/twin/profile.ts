import { getPool } from "@/lib/moment/db"

export interface TravellerProfile {
  visitedCountries: string[]
  preferredMoods: string[]
  preferredThemes: string[]
}

export interface ProfilePatch {
  visitedCountries?: string[]
  preferredMoods?: string[]
  preferredThemes?: string[]
}

export async function getProfile(userId: string): Promise<TravellerProfile | null> {
  const result = await getPool().query<{
    visited_countries: string[]
    preferred_moods: string[]
    preferred_themes: string[]
  }>(
    `SELECT visited_countries, preferred_moods, preferred_themes
     FROM traveller_profile
     WHERE user_id = $1`,
    [userId],
  )
  const row = result.rows[0]
  if (!row) return null
  return {
    visitedCountries: row.visited_countries,
    preferredMoods: row.preferred_moods,
    preferredThemes: row.preferred_themes,
  }
}

export async function upsertProfile(userId: string, patch: ProfilePatch): Promise<void> {
  await getPool().query(
    `INSERT INTO traveller_profile (user_id, visited_countries, preferred_moods, preferred_themes, updated_at)
     VALUES ($1, $2, $3, $4, now())
     ON CONFLICT (user_id) DO UPDATE SET
       visited_countries = COALESCE(EXCLUDED.visited_countries, traveller_profile.visited_countries),
       preferred_moods   = COALESCE(EXCLUDED.preferred_moods,   traveller_profile.preferred_moods),
       preferred_themes  = COALESCE(EXCLUDED.preferred_themes,  traveller_profile.preferred_themes),
       updated_at        = now()`,
    [
      userId,
      patch.visitedCountries ?? null,
      patch.preferredMoods ?? null,
      patch.preferredThemes ?? null,
    ],
  )
}
