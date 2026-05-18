// Cluster title -> representative lead mood. Used by ColdStartMoodPick to
// display button labels and seed a mood from a cold-start pick.
export const CLUSTER_LEAD: Record<string, string> = {
  "Calm & Reflective": "calm",
  "Energetic & Social": "energetic",
  "Intense & Dramatic": "dramatic",
  "Spiritual & Ceremonial": "spiritual",
  "Authentic & Cultural": "authentic",
  "Adventurous & Wild": "adventurous",
  "Romantic & Emotional": "romantic",
  "Aesthetic & Atmospheric": "atmospheric",
}

// Cluster machine id -> representative lead mood. resonatedClusters stores
// ids (e.g. "calm_reflective"), not titles, so dominantMood needs this map.
const CLUSTER_ID_LEAD: Record<string, string> = {
  calm_reflective:       "calm",
  energetic_social:      "energetic",
  intense_dramatic:      "dramatic",
  spiritual_ceremonial:  "spiritual",
  authentic_cultural:    "authentic",
  adventurous_wild:      "adventurous",
  romantic_emotional:    "romantic",
  aesthetic_atmospheric: "atmospheric",
}

export function dominantMood(moods: string[], clusters: string[]): string {
  if (moods.length > 0) {
    const counts = new Map<string, number>()
    for (const m of moods) counts.set(m, (counts.get(m) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]
  }
  if (clusters.length > 0 && CLUSTER_ID_LEAD[clusters[0]]) return CLUSTER_ID_LEAD[clusters[0]]
  return "authentic"  // safe, broad default
}
