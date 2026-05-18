import { requireTwin } from "@/lib/auth/session"
import { getProfile } from "@/lib/twin/profile"
import { getTwinData } from "@/lib/twin/data"
import { getPool } from "@/lib/moment/db"
import { ProfileEditor } from "./_components/ProfileEditor"

async function getPoiVocabulary(): Promise<{ moods: string[]; themes: string[] }> {
  const pool = getPool()
  const [moodsResult, themesResult] = await Promise.all([
    pool.query<{ mood: string }>(
      "SELECT DISTINCT unnest(moods) AS mood FROM poi_final WHERE operational_status = 'active' ORDER BY mood",
    ),
    pool.query<{ theme: string }>(
      "SELECT DISTINCT unnest(themes) AS theme FROM poi_final WHERE operational_status = 'active' ORDER BY theme",
    ),
  ])
  return {
    moods: moodsResult.rows.map((r) => r.mood).filter(Boolean),
    themes: themesResult.rows.map((r) => r.theme).filter(Boolean),
  }
}

export default async function ProfilePage() {
  const user = await requireTwin()
  const [profile, twin, vocabulary] = await Promise.all([
    getProfile(user.id),
    getTwinData(),
    getPoiVocabulary(),
  ])

  const initialCountries = profile?.visitedCountries ?? twin?.visitedCountries ?? []
  const initialMoods = profile?.preferredMoods ?? twin?.moods ?? []
  const initialThemes = profile?.preferredThemes ?? []

  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-8">
      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 400,
          fontVariationSettings: '"opsz" 72',
          fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
          color: "var(--color-ink)",
          lineHeight: 1.1,
        }}
      >
        Your Twin
      </h1>
      <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
        Edit how your Twin understands you. Changes save automatically.
      </p>

      <ProfileEditor
        initialCountries={initialCountries}
        initialMoods={initialMoods}
        initialThemes={initialThemes}
        availableMoods={vocabulary.moods}
        availableThemes={vocabulary.themes}
      />
    </div>
  )
}
