import { expect, test } from "vitest"
import { dominantMood } from "./dominantMood"

test("dominantMood picks the most frequent mood", () => {
  expect(dominantMood(["serene", "serene", "wild"], [])).toBe("serene")
})
test("dominantMood falls back to cluster lead when moods empty", () => {
  expect(dominantMood([], ["Calm & Reflective"])).toBe("calm")
})
test("dominantMood returns a safe default when both empty", () => {
  expect(dominantMood([], [])).toBe("authentic")
})
