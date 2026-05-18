import { getPool } from "@/lib/moment/db"
import { buildSourceId, ParsedPlace } from "./csvParse"

export type GuideRow = {
  id: string
  poi_name: string | null
  address: string | null
  city_raw: string | null
  country_raw: string | null
  latitude: number | null
  longitude: number | null
  ai_status: string
  created_at: Date
}

export type StageResult = {
  inserted: number
}

export async function getSubmittedGuides(creatorSlug: string, limit = 50): Promise<GuideRow[]> {
  const pool = getPool()
  const result = await pool.query<GuideRow>(
    `SELECT id, poi_name, address, city_raw, country_raw,
            latitude, longitude, ai_status, created_at
     FROM raw_pois
     WHERE $1 = ANY(creators) AND source = 'creator'
     ORDER BY created_at DESC
     LIMIT $2`,
    [creatorSlug, limit],
  )
  return result.rows
}

export async function stageImport(creatorSlug: string, places: ParsedPlace[]): Promise<StageResult> {
  if (places.length === 0) return { inserted: 0 }

  const pool = getPool()
  const params: unknown[] = []
  const valueParts: string[] = []

  for (const p of places) {
    const base = params.length
    const addressOrCoords = p.address ?? (p.latitude != null ? `${p.latitude},${p.longitude}` : "")
    const sourceId = buildSourceId(creatorSlug, p.name, addressOrCoords)
    params.push(
      "creator",
      [creatorSlug],
      sourceId,
      p.name,
      p.address,
      p.city,
      p.country,
      p.latitude,
      p.longitude,
      JSON.stringify({
        notes: p.notes,
        website: p.website,
        imported_via: "creator_csv",
      }),
    )
    valueParts.push(
      `($${base+1}, $${base+2}::text[], $${base+3}, $${base+4}, $${base+5}, ` +
      `$${base+6}, $${base+7}, $${base+8}, $${base+9}, $${base+10}::jsonb)`
    )
  }

  const result = await pool.query(
    `INSERT INTO raw_pois
       (source, creators, source_id, poi_name, address, city_raw, country_raw, latitude, longitude, raw_data)
     VALUES ${valueParts.join(", ")}
     ON CONFLICT (source, source_id) DO NOTHING`,
    params,
  )
  return { inserted: result.rowCount ?? 0 }
}
