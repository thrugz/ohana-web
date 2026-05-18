// TODO(@bram): replace Unsplash placeholders with curated destination photography.
// Country codes follow ISO 3166-1 alpha-2 (lowercase) or full names as stored in
// anonymous_session.visited_countries.

const COUNTRY_IMAGES: Record<string, string> = {
  // Tier 1 — most common destinations
  japan:        "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=60",
  indonesia:    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=60",
  thailand:     "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=60",
  france:       "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=60",
  italy:        "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&q=60",
  spain:        "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&q=60",
  portugal:     "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&q=60",
  greece:       "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&q=60",
  mexico:       "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=600&q=60",
  peru:         "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=600&q=60",
  colombia:     "https://images.unsplash.com/photo-1616781701630-85e4f26a0e3b?w=600&q=60",
  brazil:       "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&q=60",
  india:        "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=60",
  vietnam:      "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&q=60",
  morocco:      "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=600&q=60",
  egypt:        "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=600&q=60",
  kenya:        "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=60",
  iceland:      "https://images.unsplash.com/photo-1529963183134-61a90db47eaf?w=600&q=60",
  norway:       "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=60",
  australia:    "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=600&q=60",
  "new zealand":"https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=600&q=60",
  "united states": "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=600&q=60",
  canada:       "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=60",
  argentina:    "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=600&q=60",
  turkey:       "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=600&q=60",
  nepal:        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&q=60",
  "south africa": "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=60",
}

export const COUNTRY_PLACEHOLDER =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=60"

export function countryImage(country: string): string {
  return COUNTRY_IMAGES[country.toLowerCase()] ?? COUNTRY_PLACEHOLDER
}
