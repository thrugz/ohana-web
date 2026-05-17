// Title-case a slug, e.g. "slow_food" / "slow-food" -> "Slow Food".
export function titleCaseSlug(slug: string): string {
  return slug
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}
