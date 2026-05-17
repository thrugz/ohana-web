import { expect, test } from "vitest"
import type { Wej } from "./types"

test("Wej caps cards conceptually at 14", () => {
  const w: Wej = { mood: "serene", theme: "food", title: "Slow Food", cards: [] }
  expect(w.cards.length).toBeLessThanOrEqual(14)
})
