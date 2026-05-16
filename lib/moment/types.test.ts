import { expect, test } from "vitest"
import { EMPTY_SIGNAL } from "./types"

test("EMPTY_SIGNAL has all collections empty", () => {
  expect(EMPTY_SIGNAL.visitedCountries).toEqual([])
  expect(EMPTY_SIGNAL.moods).toEqual([])
  expect(EMPTY_SIGNAL.manaSummary).toBeNull()
})
