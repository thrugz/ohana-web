import { describe, it, expect, vi, beforeEach } from "vitest"

const mockGetTwinSession = vi.fn()
const mockGetTwinData = vi.fn()
const mockGetProfile = vi.fn()

vi.mock("@/lib/auth/session", () => ({ getTwinSession: () => mockGetTwinSession() }))
vi.mock("@/lib/twin/data", () => ({ getTwinData: () => mockGetTwinData() }))
vi.mock("@/lib/twin/profile", () => ({ getProfile: (...args: unknown[]) => mockGetProfile(...args) }))

async function callGet() {
  const { GET } = await import("./route")
  return GET()
}

describe("GET /api/twin/export", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns 401 when not authenticated", async () => {
    mockGetTwinSession.mockResolvedValue(null)
    const res = await callGet()
    expect(res.status).toBe(401)
  })

  it("sets Content-Disposition attachment header", async () => {
    mockGetTwinSession.mockResolvedValue({ user: { id: "u1", name: "Maya", email: "m@test.com" } })
    mockGetTwinData.mockResolvedValue({
      visitedCountries: ["japan"],
      moods: ["serene"],
      explorerBadge: "The Curious",
      savedPois: [{ id: "p1", name: "Senso-ji", poiType: "temple", slug: "senso-ji", shortDescription: null }],
    })
    mockGetProfile.mockResolvedValue({ visitedCountries: ["japan"], preferredMoods: ["serene"], preferredThemes: ["food"] })
    const res = await callGet()
    expect(res.status).toBe(200)
    expect(res.headers.get("Content-Disposition")).toMatch(/attachment.*twin-report\.json/)
  })

  it("includes name, badge, countries, moods, themes, savedPois in body", async () => {
    mockGetTwinSession.mockResolvedValue({ user: { id: "u1", name: "Maya", email: "m@test.com" } })
    mockGetTwinData.mockResolvedValue({
      visitedCountries: ["japan"],
      moods: ["serene"],
      explorerBadge: "The Curious",
      savedPois: [{ id: "p1", name: "Senso-ji", poiType: "temple", slug: "s", shortDescription: null }],
    })
    mockGetProfile.mockResolvedValue({ visitedCountries: ["japan", "brazil"], preferredMoods: ["serene"], preferredThemes: ["food"] })
    const res = await callGet()
    const body = await res.json()
    expect(body.name).toBe("Maya")
    expect(body.explorerBadge).toBe("The Curious")
    expect(body.visitedCountries).toEqual(["japan", "brazil"])
    expect(body.preferredMoods).toEqual(["serene"])
    expect(body.preferredThemes).toEqual(["food"])
    expect(body.savedPlaces).toHaveLength(1)
    expect(body.savedPlaces[0]).toEqual({ name: "Senso-ji", type: "temple" })
  })
})
