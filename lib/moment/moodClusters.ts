// The founder's 8 canonical Mood Clusters (from the Mood Tags registry).
// Stage 3 surfaces the clusters a traveller leans toward, based on the
// mood slugs captured in Stage 2.
export interface MoodCluster {
  id: string
  title: string
  moods: string[]
}

// A cluster card as returned by /api/moment/clusters and rendered by Stage 3.
export interface ClusterCard {
  id: string
  title: string
  image: string
}

// The full mood-slug -> cluster mapping should be derived from the canonical
// 47-mood registry. The slugs below cover the Stage 2 image set plus
// representative slugs for the remaining clusters. Tracked as A-07 in the
// 2026-05-19 audit (no Linear ticket yet — low urgency, cosmetic only).
export const MOOD_CLUSTERS: MoodCluster[] = [
  { id: "calm_reflective",      title: "Calm & Reflective",      moods: ["serene", "reflective", "slow_paced", "relaxed"] },
  { id: "energetic_social",     title: "Energetic & Social",     moods: ["social", "joyful", "vibrant"] },
  { id: "intense_dramatic",     title: "Intense & Dramatic",     moods: ["epic", "chaotic"] },
  { id: "spiritual_ceremonial", title: "Spiritual & Ceremonial", moods: ["ceremonial", "sacred", "spiritual"] },
  { id: "authentic_cultural",   title: "Authentic & Cultural",   moods: ["authentic", "local", "cultural"] },
  { id: "adventurous_wild",     title: "Adventurous & Wild",     moods: ["adventurous", "wild", "rugged"] },
  { id: "romantic_emotional",   title: "Romantic & Emotional",   moods: ["intimate", "emotional", "romantic"] },
  { id: "aesthetic_atmospheric", title: "Aesthetic & Atmospheric", moods: ["scenic", "atmospheric", "aesthetic"] },
]

// Clusters whose mood set intersects the traveller's selected moods. Falls
// back to all 8 clusters so Stage 3 never renders empty.
export function clustersForMoods(moods: string[]): MoodCluster[] {
  const matched = MOOD_CLUSTERS.filter((c) => c.moods.some((m) => moods.includes(m)))
  return matched.length > 0 ? matched : MOOD_CLUSTERS
}
