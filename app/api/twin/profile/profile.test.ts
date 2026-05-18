import { describe, it, expect, vi, beforeEach } from "vitest"

const mockGetTwinSession = vi.fn()
const mockUpsertProfile = vi.fn()

vi.mock("@/lib/auth/session", () => ({ getTwinSession: () => mockGetTwinSession() }))
vi.mock("@/lib/twin/profile", () => ({ upsertProfile: (...args: unknown[]) => mockUpsertProfile(...args) }))

async function callPatch(body: unknown, sessionUser: { id: string } | null) {
  mockGetTwinSession.mockResolvedValue(sessionUser ? { user: sessionUser } : null)
  mockUpsertProfile.mockResolvedValue(undefined)
  const { PATCH } = await import("./route")
  const req = new Request("http://localhost/api/twin/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return PATCH(req)
}

describe("PATCH /api/twin/profile", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns 401 when not authenticated", async () => {
    const res = await callPatch({ visitedCountries: ["japan"] }, null)
    expect(res.status).toBe(401)
    expect(mockUpsertProfile).not.toHaveBeenCalled()
  })

  it("calls upsertProfile with userId and patch", async () => {
    const userId = "00000000-0000-0000-0000-000000000001"
    const res = await callPatch(
      { visitedCountries: ["japan", "france"], preferredMoods: ["serene"] },
      { id: userId },
    )
    expect(res.status).toBe(200)
    expect(mockUpsertProfile).toHaveBeenCalledWith(userId, {
      visitedCountries: ["japan", "france"],
      preferredMoods: ["serene"],
    })
  })

  it("returns 400 for a non-object body", async () => {
    const res = await callPatch("bad", { id: "00000000-0000-0000-0000-000000000001" })
    expect(res.status).toBe(400)
  })
})
