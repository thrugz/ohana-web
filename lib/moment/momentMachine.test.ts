import { expect, test } from "vitest"
import { advance, canAdvance, isComplete } from "./momentMachine"
import { EMPTY_SIGNAL } from "./types"

test("advance moves stage 1 -> 2", () => {
  expect(advance(1)).toBe(2)
})
test("advance past 5 stays at 5", () => {
  expect(advance(5)).toBe(5)
})
test("canAdvance requires stage-1 countries", () => {
  expect(canAdvance(1, EMPTY_SIGNAL)).toBe(false)
  expect(canAdvance(1, { ...EMPTY_SIGNAL, visitedCountries: ["PT"] })).toBe(true)
})
test("isComplete only when stage 5 done", () => {
  expect(isComplete(5, { ...EMPTY_SIGNAL, manaSummary: { explorerBadge: "x", portrait: "y" } })).toBe(true)
})
