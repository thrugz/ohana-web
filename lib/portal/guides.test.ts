import { describe, it, expect, vi, beforeEach } from "vitest"

const mockQuery = vi.fn()
vi.mock("@/lib/moment/db", () => ({
  getPool: () => ({ query: mockQuery }),
}))

describe("getSubmittedGuides", () => {
  beforeEach(() => { mockQuery.mockReset() })

  it("returns rows from raw_pois for the creator slug", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: "abc", poi_name: "Café", address: "Rua 1", city_raw: "Lisbon", country_raw: "Portugal", latitude: null, longitude: null, ai_status: "staged", created_at: new Date() },
      ],
    })
    const { getSubmittedGuides } = await import("./guides")
    const result = await getSubmittedGuides("ada")
    expect(result).toHaveLength(1)
    expect(result[0].poi_name).toBe("Café")
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("ANY(creators)"),
      expect.arrayContaining(["ada"]),
    )
  })

  it("returns empty array when no rows", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    const { getSubmittedGuides } = await import("./guides")
    expect(await getSubmittedGuides("ada")).toHaveLength(0)
  })
})

describe("stageImport", () => {
  beforeEach(() => { mockQuery.mockReset() })

  it("inserts valid rows and returns inserted count", async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 2 })
    const { stageImport } = await import("./guides")
    const places = [
      { name: "Café", address: "Rua 1", city: null, country: "Portugal", latitude: null, longitude: null, notes: null, website: null },
      { name: "Park", address: "Av. 2", city: "Lisbon", country: "Portugal", latitude: null, longitude: null, notes: null, website: null },
    ]
    const result = await stageImport("ada", places)
    expect(result.inserted).toBe(2)
    expect(mockQuery).toHaveBeenCalledTimes(1)
  })

  it("returns inserted=0 when places array is empty", async () => {
    const { stageImport } = await import("./guides")
    const result = await stageImport("ada", [])
    expect(result.inserted).toBe(0)
    expect(mockQuery).not.toHaveBeenCalled()
  })
})
