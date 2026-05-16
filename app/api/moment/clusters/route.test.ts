import { expect, test, vi } from "vitest"

const SESSION = "11111111-1111-4111-8111-111111111111"

// Mock only the pool; keep the real isUuid validator.
vi.mock("@/lib/moment/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/moment/db")>()
  return {
    ...actual,
    getPool: () => ({
      query: vi.fn(async (sql: string) => {
        if (sql.includes("anonymous_session")) return { rows: [{ moods: ["serene"] }] }
        // poi_final query: thin data — zero matching destinations.
        return { rows: [] }
      }),
    }),
  }
})

const { GET } = await import("./route")

test("returns cluster cards even when poi_final has zero matching rows", async () => {
  const res = await GET(new Request(`http://localhost/api/moment/clusters?session=${SESSION}`))
  expect(res.status).toBe(200)
  const cards: { id: string; title: string; image: string }[] = await res.json()
  expect(cards.length).toBeGreaterThan(0)
  // The "serene" mood lands the traveller in the Calm & Reflective cluster.
  expect(cards.some((c) => c.id === "calm_reflective")).toBe(true)
  // Every card has an image despite the empty poi_final.
  for (const card of cards) expect(card.image).toBeTruthy()
})

test("rejects an invalid session id", async () => {
  const res = await GET(new Request("http://localhost/api/moment/clusters?session=not-a-uuid"))
  expect(res.status).toBe(400)
})
