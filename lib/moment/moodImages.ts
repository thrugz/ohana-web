// Founder's canonical "Act 0" image set. Each scene maps to mood slugs
// from the canonical 47-mood registry. Demo images keyed by slug.
export interface MoodImage {
  slug: string
  label: string
  moods: string[]
}

export const MOOD_IMAGES: MoodImage[] = [
  { slug: "empty_street",     label: "An empty street at dawn",   moods: ["serene", "reflective", "slow_paced"] },
  { slug: "solo_bar",         label: "A quiet bar, on your own",  moods: ["relaxed", "intimate", "local"] },
  { slug: "mountain_view",    label: "A view from a summit",      moods: ["epic", "scenic", "reflective"] },
  { slug: "crowded_market",   label: "A crowded market",          moods: ["vibrant", "authentic", "chaotic"] },
  { slug: "stranger_friends", label: "Strangers who became friends", moods: ["social", "joyful", "intimate"] },
  { slug: "child_guide",      label: "A child showing you around", moods: ["authentic", "local", "emotional"] },
]

// Deduped union of mood slugs across the given selected image slugs,
// preserving MOOD_IMAGES order.
export function moodsForImages(selected: string[]): string[] {
  const set = new Set(selected)
  const union: string[] = []
  for (const image of MOOD_IMAGES) {
    if (!set.has(image.slug)) continue
    for (const mood of image.moods) {
      if (!union.includes(mood)) union.push(mood)
    }
  }
  return union
}
