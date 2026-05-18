import { expect, test } from "vitest"
import { dominantMood } from "./dominantMood"

test("dominantMood picks the most frequent mood", () => {
  expect(dominantMood(["serene", "serene", "wild"], [])).toBe("serene")
})
test("dominantMood falls back to cluster lead when moods empty", () => {
  expect(dominantMood([], ["calm_reflective"])).toBe("calm")
})
test("dominantMood maps all cluster ids to a lead mood", () => {
  expect(dominantMood([], ["energetic_social"])).toBe("energetic")
  expect(dominantMood([], ["adventurous_wild"])).toBe("adventurous")
  expect(dominantMood([], ["aesthetic_atmospheric"])).toBe("atmospheric")
})
test("dominantMood returns a safe default when both empty", () => {
  expect(dominantMood([], [])).toBe("authentic")
})
