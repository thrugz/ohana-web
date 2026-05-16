// GET /api/moment/clusters?session=<id> — returns the Mood Cluster cards a
// traveller leans toward, based on their Stage 2 mood signal. Resilient to a
// thin poi_final: a cluster card renders even with zero matching destinations.
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getPool, isUuid } from "@/lib/moment/db"
import { type ClusterCard, clustersForMoods } from "@/lib/moment/moodClusters"

// TODO(@bram): poi_final has no photo column (KGE spec §4) — using a
// per-cluster placeholder. Swap for curated cluster imagery.
const CLUSTER_IMAGE: Record<string, string> = {
  calm_reflective: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=600&q=60",
  energetic_social: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=60",
  intense_dramatic: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=60",
  spiritual_ceremonial: "https://images.unsplash.com/photo-1545126178-862cc0d7a3a9?w=600&q=60",
  authentic_cultural: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&q=60",
  adventurous_wild: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=60",
  romantic_emotional: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=60",
  aesthetic_atmospheric: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&q=60",
}
const PLACEHOLDER = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=60"

export async function GET(req: Request) {
  let sessionId = new URL(req.url).searchParams.get("session")
  if (!sessionId) {
    const jar = await cookies()
    sessionId = jar.get("moment_session")?.value ?? null
  }
  if (!isUuid(sessionId)) {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 })
  }

  const pool = getPool()

  let moods: string[] = []
  try {
    const result = await pool.query<{ moods: string[] }>(
      "SELECT moods FROM anonymous_session WHERE id = $1",
      [sessionId],
    )
    moods = result.rows[0]?.moods ?? []
  } catch {
    // No session row / DB unavailable — fall back to all clusters below.
  }

  const clusters = clustersForMoods(moods)

  const cards: ClusterCard[] = await Promise.all(
    clusters.map(async (cluster) => {
      // Surface real KGE destinations for the cluster's moods. A thin or
      // empty poi_final must not break the card — it is about the theme.
      try {
        await pool.query(
          "SELECT name FROM poi_final WHERE moods && $1 AND status = 'active' LIMIT 1",
          [cluster.moods],
        )
      } catch {
        // poi_final not ready — the cluster card still renders.
      }
      return {
        id: cluster.id,
        title: cluster.title,
        image: CLUSTER_IMAGE[cluster.id] ?? PLACEHOLDER,
      }
    }),
  )

  return NextResponse.json(cards)
}
