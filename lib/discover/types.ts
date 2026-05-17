// Target card count for a full Wej. The Wej engine caps at this many cards;
// WejFeed treats a Wej below it as thin and frames it honestly.
export const WEJ_CARD_TARGET = 14

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
  cards: WejCard[]        // up to WEJ_CARD_TARGET
  thin?: boolean          // true when the depth guard tripped (<6 cards)
}

export interface DiscoverState {
  sessionId: string
  mood: string             // seeded from the Mana
  currentWej: Wej | null
  seenThemes: string[]
  savedPoiIds: string[]
}
