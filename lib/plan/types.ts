export interface ItineraryItem {
  id: string
  poiId: string
  dayIndex: number
  sortOrder: number
  name: string
  shortDescription: string | null
  photoUrl: string | null
  cityName: string | null
  poiType: string | null
}

export interface ItineraryDay {
  dayIndex: number
  items: ItineraryItem[]
}

export interface Itinerary {
  id: string
  title: string
  status: string
  ownerUserId: string
  createdAt: string
  days: ItineraryDay[]
}

export interface ItinerarySummary {
  id: string
  title: string
  status: string
  createdAt: string
  itemCount: number
}
