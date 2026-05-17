import { expect, test, vi } from "vitest"
import { buildWejQuery } from "./route"

test("buildWejQuery filters poi_final by mood AND theme, caps 14, ranks by confidence", () => {
  const { text, values } = buildWejQuery("serene", "food")
  expect(text).toMatch(/moods @> /i)
  expect(text).toMatch(/themes @> /i)
  expect(text).toMatch(/order by confidence_score desc/i)
  expect(text).toMatch(/limit 14/i)
  expect(values).toEqual([["serene"], ["food"]])
})
