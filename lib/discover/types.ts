export interface WejCard {
  poiId: string
  name: string
  shortDescription: string
  photoUrl: string | null
  mood: string
  theme: string
  source: string          // "Sergio", "Wikidata", etc. — always shown
  city: string | null
}

export interface Wej {
  mood: string
  theme: string
  title: string           // e.g. "Slow Food"
  cards: WejCard[]        // up to 14
}

export interface DiscoverState {
  sessionId: string
  mood: string             // seeded from the Mana
  currentWej: Wej | null
  seenThemes: string[]
  savedPoiIds: string[]
}
