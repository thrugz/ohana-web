import { expect, test } from "vitest"
import { titleCaseSlug } from "./slug"

test("titleCaseSlug title-cases underscore and hyphen slugs", () => {
  expect(titleCaseSlug("slow_food")).toBe("Slow Food")
  expect(titleCaseSlug("slow-food")).toBe("Slow Food")
})

test("titleCaseSlug handles a single word and mixed separators", () => {
  expect(titleCaseSlug("food")).toBe("Food")
  expect(titleCaseSlug("art_and-culture")).toBe("Art And Culture")
})

test("titleCaseSlug drops empty segments from stray separators", () => {
  expect(titleCaseSlug("__nature--trails__")).toBe("Nature Trails")
  expect(titleCaseSlug("")).toBe("")
})
