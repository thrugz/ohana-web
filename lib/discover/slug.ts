// Slugify free text, e.g. "Slow Food" -> "slow-food". Lower-cases and
// collapses runs of whitespace to single hyphens.
export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-")
}

// Title-case a slug, e.g. "slow_food" / "slow-food" -> "Slow Food".
export function titleCaseSlug(slug: string): string {
  return slug
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}
