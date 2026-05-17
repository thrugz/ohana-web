// Cluster -> representative lead mood (the 8 KGE Mood Clusters).
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

export function dominantMood(moods: string[], clusters: string[]): string {
  if (moods.length > 0) {
    const counts = new Map<string, number>()
    for (const m of moods) counts.set(m, (counts.get(m) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]
  }
  if (clusters.length > 0 && CLUSTER_LEAD[clusters[0]]) return CLUSTER_LEAD[clusters[0]]
  return "authentic"  // safe, broad default
}
