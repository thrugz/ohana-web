import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

const mockGetTwinSession = vi.fn()
vi.mock("@/lib/auth/session", () => ({ getTwinSession: () => mockGetTwinSession() }))

const mockCreateItinerary = vi.fn()
vi.mock("@/lib/plan/db", () => ({ createItinerary: (...args: unknown[]) => mockCreateItinerary(...args) }))

vi.mock("@/lib/moment/db", () => ({
  isUuid: (v: unknown) => typeof v === "string" && /^[0-9a-f-]{36}$/.test(v),
}))

const USER_ID = "dddddddd-0000-0000-0000-000000000004"
const ITIN_ID = "cccccccc-0000-0000-0000-000000000003"
const POI_ID_1 = "aaaaaaaa-0000-0000-0000-000000000001"

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/plan/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("POST /api/plan/generate", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns 401 when not authenticated", async () => {
    mockGetTwinSession.mockResolvedValue(null)
    const { POST } = await import("./route")
    const res = await POST(makeRequest({ savedPoiIds: [POI_ID_1], days: 3 }))
    expect(res.status).toBe(401)
  })

  it("returns 400 when body is missing savedPoiIds", async () => {
    mockGetTwinSession.mockResolvedValue({ user: { id: USER_ID } })
    const { POST } = await import("./route")
    const res = await POST(makeRequest({ days: 3 }))
    expect(res.status).toBe(400)
  })

  it("returns 400 when savedPoiIds contains no valid UUIDs", async () => {
    mockGetTwinSession.mockResolvedValue({ user: { id: USER_ID } })
    const { POST } = await import("./route")
    const res = await POST(makeRequest({ savedPoiIds: ["not-a-uuid"], days: 2 }))
    expect(res.status).toBe(400)
  })

  it("returns itineraryId on success", async () => {
    mockGetTwinSession.mockResolvedValue({ user: { id: USER_ID } })
    mockCreateItinerary.mockResolvedValue(ITIN_ID)
    const { POST } = await import("./route")
    const res = await POST(makeRequest({ savedPoiIds: [POI_ID_1], days: 2 }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.itineraryId).toBe(ITIN_ID)
    expect(mockCreateItinerary).toHaveBeenCalledWith(USER_ID, "2-day trip", [POI_ID_1], 2)
  })
})
