import { expect, test } from "vitest"
import { slugify, titleCaseSlug } from "./slug"

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

test("slugify lower-cases and hyphenates whitespace", () => {
  expect(slugify("Slow Food")).toBe("slow-food")
  expect(slugify("Art and Culture")).toBe("art-and-culture")
})

test("slugify collapses runs of whitespace to a single hyphen", () => {
  expect(slugify("nature   trails")).toBe("nature-trails")
  expect(slugify("food")).toBe("food")
})
