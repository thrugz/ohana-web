import { getPool, isUuid } from "@/lib/moment/db"
import type { Itinerary, ItineraryItem, ItinerarySummary } from "./types"

interface PoiRow {
  id: string
  name: string
  short_description: string | null
  photos: unknown
  city_name: string | null
  poi_type: string | null
  confidence_score: number | null
}

interface ItineraryRow {
  id: string
  title: string
  status: string
  owner_user_id: string
  created_at: string
}

interface ItineraryItemRow {
  id: string
  poi_id: string
  day_index: number
  sort_order: number
  name: string
  short_description: string | null
  photos: unknown
  city_name: string | null
  poi_type: string | null
}

function extractFirstPhoto(photos: unknown): string | null {
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

export async function createItinerary(
  ownerUserId: string,
  title: string,
  poiIds: string[],
  days: number,
): Promise<string> {
  if (!isUuid(ownerUserId)) throw new Error("invalid UUID: ownerUserId")

  const pool = getPool()

  // Fetch POIs from poi_final to get city and confidence info (read-only, outside transaction)
  const poiResult = await pool.query<PoiRow>(
    `SELECT id, name, short_description, photos, city_name, poi_type, confidence_score
     FROM poi_final
     WHERE id = ANY($1) AND operational_status = 'active'`,
    [poiIds],
  )

  // Sort: city_name ASC (keeps same-city POIs together), confidence_score DESC within city
  const pois = poiResult.rows.sort((a, b) => {
    const cityA = a.city_name ?? ""
    const cityB = b.city_name ?? ""
    if (cityA !== cityB) return cityA.localeCompare(cityB)
    return (b.confidence_score ?? 0) - (a.confidence_score ?? 0)
  })

  const poisPerDay = Math.max(1, Math.ceil(pois.length / days))

  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    const itinResult = await client.query<{ id: string }>(
      `INSERT INTO itinerary (owner_user_id, title, status)
       VALUES ($1, $2, 'draft')
       RETURNING id`,
      [ownerUserId, title],
    )
    const itineraryId = itinResult.rows[0].id

    if (pois.length > 0) {
      const COL_COUNT = 4 // itinerary_id, poi_id, day_index, sort_order
      const placeholders: string[] = []
      const vals: unknown[] = []
      pois.forEach((poi, i) => {
        const dayIndex = Math.floor(i / poisPerDay)
        const base = i * COL_COUNT
        placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`)
        vals.push(itineraryId, poi.id, dayIndex, i)
      })
      await client.query(
        `INSERT INTO itinerary_item (itinerary_id, poi_id, day_index, sort_order) VALUES ${placeholders.join(", ")}`,
        vals,
      )
    }

    await client.query("COMMIT")
    return itineraryId
  } catch (e) {
    await client.query("ROLLBACK")
    throw e
  } finally {
    client.release()
  }
}

export async function getItinerary(id: string, ownerUserId: string): Promise<Itinerary | null> {
  if (!isUuid(id)) throw new Error("invalid UUID: id")
  if (!isUuid(ownerUserId)) throw new Error("invalid UUID: ownerUserId")

  const pool = getPool()

  const itinResult = await pool.query<ItineraryRow>(
    `SELECT id, title, status, owner_user_id, created_at
     FROM itinerary
     WHERE id = $1 AND owner_user_id = $2`,
    [id, ownerUserId],
  )
  if (!itinResult.rows[0]) return null
  const row = itinResult.rows[0]

  const itemsResult = await pool.query<ItineraryItemRow>(
    `SELECT ii.id, ii.poi_id, ii.day_index, ii.sort_order,
            pf.name, pf.short_description, pf.photos, pf.city_name, pf.poi_type
     FROM itinerary_item ii
     JOIN poi_final pf ON pf.id = ii.poi_id
     WHERE ii.itinerary_id = $1
     ORDER BY ii.day_index ASC, ii.sort_order ASC`,
    [id],
  )

  const itemsByDay = new Map<number, ItineraryItem[]>()
  for (const item of itemsResult.rows) {
    const dayItems = itemsByDay.get(item.day_index) ?? []
    dayItems.push({
      id: item.id,
      poiId: item.poi_id,
      dayIndex: item.day_index,
      sortOrder: item.sort_order,
      name: item.name,
      shortDescription: item.short_description,
      photoUrl: extractFirstPhoto(item.photos),
      cityName: item.city_name,
      poiType: item.poi_type,
    })
    itemsByDay.set(item.day_index, dayItems)
  }

  const days = Array.from(itemsByDay.entries())
    .sort(([a], [b]) => a - b)
    .map(([dayIndex, items]) => ({ dayIndex, items }))

  return {
    id: row.id,
    title: row.title,
    status: row.status,
    ownerUserId: row.owner_user_id,
    createdAt: row.created_at,
    days,
  }
}

export async function listItineraries(userId: string): Promise<ItinerarySummary[]> {
  if (!isUuid(userId)) throw new Error("invalid UUID: userId")

  const result = await getPool().query<{
    id: string
    title: string
    status: string
    created_at: string
    item_count: string
  }>(
    `SELECT i.id, i.title, i.status, i.created_at,
            COUNT(ii.id) AS item_count
     FROM itinerary i
     LEFT JOIN itinerary_item ii ON ii.itinerary_id = i.id
     WHERE i.owner_user_id = $1
     GROUP BY i.id
     ORDER BY i.created_at DESC`,
    [userId],
  )
  return result.rows.map((r) => ({
    id: r.id,
    title: r.title,
    status: r.status,
    createdAt: r.created_at,
    itemCount: parseInt(r.item_count, 10),
  }))
}
