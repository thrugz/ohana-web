// Founder's Traveller Twin Explorer Badge ladder. Deterministic from
// countries-visited count. Thresholds are canonical — do not change.
export function explorerBadge(countryCount: number): string {
  if (countryCount >= 75) return "Legend"
  if (countryCount >= 50) return "Nomad"
  if (countryCount >= 30) return "Wanderer"
  if (countryCount >= 15) return "Adventurer"
  if (countryCount >= 5)  return "Explorer"
  return "The Curious"
}
