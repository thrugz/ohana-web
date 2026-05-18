import { describe, it, expect, vi, beforeEach } from "vitest"

const mockQuery = vi.fn()
vi.mock("@/lib/moment/db", () => ({
  getPool: () => ({ query: mockQuery }),
  isUuid: (v: unknown) => typeof v === "string" && /^[0-9a-f-]{36}$/.test(v),
}))

const POI_ID_1 = "aaaaaaaa-0000-0000-0000-000000000001"
const POI_ID_2 = "bbbbbbbb-0000-0000-0000-000000000002"
const ITIN_ID = "cccccccc-0000-0000-0000-000000000003"
const USER_ID = "dddddddd-0000-0000-0000-000000000004"

describe("createItinerary", () => {
  beforeEach(() => vi.clearAllMocks())

  it("inserts itinerary row and items, returns id", async () => {
    mockQuery
      // 1. poi_final fetch
      .mockResolvedValueOnce({
        rows: [
          { id: POI_ID_1, name: "Senso-ji", short_description: "Temple", photos: [], city_name: "tokyo", poi_type: "temple", confidence_score: 0.9 },
          { id: POI_ID_2, name: "Fushimi Inari", short_description: "Shrine", photos: [], city_name: "kyoto", poi_type: "shrine", confidence_score: 0.8 },
        ],
      })
      // 2. INSERT itinerary RETURNING id
      .mockResolvedValueOnce({ rows: [{ id: ITIN_ID }] })
      // 3. INSERT itinerary_item (bulk)
      .mockResolvedValueOnce({ rows: [] })

    const { createItinerary } = await import("./db")
    const id = await createItinerary(USER_ID, "2-day trip", [POI_ID_1, POI_ID_2], 2)

    expect(id).toBe(ITIN_ID)
    expect(mockQuery).toHaveBeenCalledTimes(3)
    // Verify the itinerary INSERT used the right owner
    const itinCall = mockQuery.mock.calls[1]
    expect(itinCall[1]).toEqual([USER_ID, "2-day trip"])
  })

  it("skips itinerary_item insert when no POIs match in poi_final", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] }) // poi_final returns nothing
      .mockResolvedValueOnce({ rows: [{ id: ITIN_ID }] }) // itinerary INSERT

    const { createItinerary } = await import("./db")
    const id = await createItinerary(USER_ID, "empty trip", [], 1)

    expect(id).toBe(ITIN_ID)
    expect(mockQuery).toHaveBeenCalledTimes(2) // no 3rd call for items
  })
})

describe("getItinerary", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns null when itinerary not found", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] }) // itinerary select
    const { getItinerary } = await import("./db")
    const result = await getItinerary(ITIN_ID, USER_ID)
    expect(result).toBeNull()
  })

  it("returns structured Itinerary with days", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [{ id: ITIN_ID, title: "2-day trip", status: "draft", owner_user_id: USER_ID, created_at: "2026-05-18T00:00:00Z" }],
      })
      .mockResolvedValueOnce({
        rows: [
          { id: "item-1", poi_id: POI_ID_1, day_index: 0, sort_order: 0, name: "Senso-ji", short_description: "Temple", photos: [], city_name: "tokyo", poi_type: "temple" },
          { id: "item-2", poi_id: POI_ID_2, day_index: 1, sort_order: 0, name: "Fushimi Inari", short_description: "Shrine", photos: [], city_name: "kyoto", poi_type: "shrine" },
        ],
      })

    const { getItinerary } = await import("./db")
    const result = await getItinerary(ITIN_ID, USER_ID)

    expect(result).not.toBeNull()
    expect(result!.id).toBe(ITIN_ID)
    expect(result!.days).toHaveLength(2)
    expect(result!.days[0].dayIndex).toBe(0)
    expect(result!.days[0].items[0].name).toBe("Senso-ji")
    expect(result!.days[1].items[0].name).toBe("Fushimi Inari")
  })
})

describe("listItineraries", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns an empty array when no itineraries exist", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    const { listItineraries } = await import("./db")
    const result = await listItineraries(USER_ID)
    expect(result).toEqual([])
  })

  it("returns summary array ordered by created_at desc", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: ITIN_ID, title: "2-day trip", status: "draft", created_at: "2026-05-18T00:00:00Z", item_count: "4" },
      ],
    })
    const { listItineraries } = await import("./db")
    const result = await listItineraries(USER_ID)

    expect(result).toHaveLength(1)
    expect(result[0].itemCount).toBe(4)
    expect(result[0].title).toBe("2-day trip")
  })
})
