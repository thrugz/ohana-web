import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock auth session — unauthenticated by default
const mockGetTwinSession = vi.fn()
vi.mock("@/lib/auth/session", () => ({ getTwinSession: () => mockGetTwinSession() }))

// Mock pg pool
const mockQuery = vi.fn()
vi.mock("@/lib/moment/db", () => ({
  getPool: () => ({ query: mockQuery }),
  isUuid: (v: unknown) => typeof v === "string" && /^[0-9a-f-]{36}$/.test(v),
}))

// Mock profile — returns null by default
vi.mock("@/lib/twin/profile", () => ({ getProfile: vi.fn().mockResolvedValue(null) }))

// Clear React cache between tests
vi.mock("react", async (importOriginal) => {
  const mod = await importOriginal<typeof import("react")>()
  return { ...mod, cache: (fn: unknown) => fn }
})

describe("getTwinData", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns null when there is no session", async () => {
    mockGetTwinSession.mockResolvedValue(null)
    const { getTwinData } = await import("./data")
    const result = await getTwinData()
    expect(result).toBeNull()
  })

  it("returns twin data from the anonymous_session row", async () => {
    mockGetTwinSession.mockResolvedValue({ user: { id: "00000000-0000-0000-0000-000000000001", name: "Maya" } })
    mockQuery
      .mockResolvedValueOnce({
        rows: [{
          visited_countries: ["japan", "france"],
          moods: ["calm_reflective"],
          mana_summary: { portrait: "A quiet wanderer.", explorerBadge: "Explorer" },
          saved_pois: [],
        }],
      })
      // no second query (no saved POIs)

    const { getTwinData } = await import("./data")
    const result = await getTwinData()

    expect(result).not.toBeNull()
    expect(result!.visitedCountries).toEqual(["japan", "france"])
    expect(result!.moods).toEqual(["calm_reflective"])
    expect(result!.portrait).toBe("A quiet wanderer.")
    expect(result!.explorerBadge).toBe("The Curious") // 2 countries → "The Curious"
    expect(result!.savedPois).toHaveLength(0)
  })

  it("returns empty arrays when no anonymous session is linked", async () => {
    mockGetTwinSession.mockResolvedValue({ user: { id: "00000000-0000-0000-0000-000000000002" } })
    mockQuery.mockResolvedValueOnce({ rows: [] })

    const { getTwinData } = await import("./data")
    const result = await getTwinData()

    expect(result).not.toBeNull()
    expect(result!.visitedCountries).toEqual([])
    expect(result!.savedPois).toHaveLength(0)
    expect(result!.explorerBadge).toBe("The Curious")
  })

  it("fetches POI details when saved_pois is non-empty", async () => {
    mockGetTwinSession.mockResolvedValue({ user: { id: "00000000-0000-0000-0000-000000000003" } })
    const poiId = "aaaaaaaa-0000-0000-0000-000000000001"
    mockQuery
      .mockResolvedValueOnce({
        rows: [{
          visited_countries: [],
          moods: [],
          mana_summary: null,
          saved_pois: [poiId],
        }],
      })
      .mockResolvedValueOnce({
        rows: [{
          id: poiId,
          name: "Senso-ji Temple",
          slug: "senso-ji-temple",
          short_description: "Tokyo's oldest temple.",
          poi_type: "temple",
        }],
      })

    const { getTwinData } = await import("./data")
    const result = await getTwinData()

    expect(result!.savedPois).toHaveLength(1)
    expect(result!.savedPois[0].name).toBe("Senso-ji Temple")
    expect(result!.savedPois[0].poiType).toBe("temple")
  })
})
