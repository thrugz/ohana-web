import { expect, test, vi } from "vitest"
import { askHoku } from "./client"

test("askHoku returns reply text on success", async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ choices: [{ message: { content: "A backstreet in Lisbon — you like slow places." } }] }),
  }) as unknown as typeof fetch
  const reply = await askHoku("reflect", { text: "Lisbon" })
  expect(reply).toContain("Lisbon")
})

test("askHoku returns fallback on failure", async () => {
  global.fetch = vi.fn().mockResolvedValue({ ok: false }) as unknown as typeof fetch
  const reply = await askHoku("reflect", { text: "Lisbon" })
  expect(reply).toBe("")  // empty => caller uses pre-authored fallback
})
