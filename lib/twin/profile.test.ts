import { describe, it, expect, vi, beforeEach } from "vitest"

const mockQuery = vi.fn()
vi.mock("@/lib/moment/db", () => ({ getPool: () => ({ query: mockQuery }) }))

describe("getProfile", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns null when no row exists", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    const { getProfile } = await import("./profile")
    expect(await getProfile("00000000-0000-0000-0000-000000000001")).toBeNull()
  })

  it("maps row columns to camelCase fields", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{
        visited_countries: ["japan", "france"],
        preferred_moods: ["serene"],
        preferred_themes: ["food"],
      }],
    })
    const { getProfile } = await import("./profile")
    const result = await getProfile("00000000-0000-0000-0000-000000000001")
    expect(result).toEqual({
      visitedCountries: ["japan", "france"],
      preferredMoods: ["serene"],
      preferredThemes: ["food"],
    })
  })
})

describe("upsertProfile", () => {
  beforeEach(() => vi.clearAllMocks())

  it("sends an upsert query with the provided patch fields", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    const { upsertProfile } = await import("./profile")
    await upsertProfile("00000000-0000-0000-0000-000000000001", {
      visitedCountries: ["brazil"],
    })
    expect(mockQuery).toHaveBeenCalledOnce()
    const [sql, params] = mockQuery.mock.calls[0]
    expect(sql).toMatch(/INSERT INTO traveller_profile/i)
    expect(sql).toMatch(/ON CONFLICT \(user_id\)/i)
    expect(params[0]).toBe("00000000-0000-0000-0000-000000000001")
    expect(params[1]).toEqual(["brazil"])
  })
})
