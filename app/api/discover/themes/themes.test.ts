import { expect, test } from "vitest"
import { parseSeen, resolveMood } from "./route"

test("parseSeen reads repeated seen params", () => {
  const params = new URLSearchParams("seen=food&seen=nature")
  expect(parseSeen(params)).toEqual(new Set(["food", "nature"]))
})

test("parseSeen splits a comma-separated seen value", () => {
  const params = new URLSearchParams("seen=food,nature,art")
  expect(parseSeen(params)).toEqual(new Set(["food", "nature", "art"]))
})

test("parseSeen combines repeated and comma-separated forms", () => {
  const params = new URLSearchParams("seen=food,nature&seen=art")
  expect(parseSeen(params)).toEqual(new Set(["food", "nature", "art"]))
})

test("parseSeen trims whitespace and dedupes", () => {
  const params = new URLSearchParams("seen= food , nature &seen=food")
  expect(parseSeen(params)).toEqual(new Set(["food", "nature"]))
})

test("parseSeen returns an empty set when no seen param is present", () => {
  expect(parseSeen(new URLSearchParams(""))).toEqual(new Set())
})

test("parseSeen ignores empty entries from stray commas", () => {
  const params = new URLSearchParams("seen=food,,nature,")
  expect(parseSeen(params)).toEqual(new Set(["food", "nature"]))
})

test("resolveMood uses a non-empty mood override directly", () => {
  expect(resolveMood("energetic", [], [])).toBe("energetic")
  // The override wins even when the session row would derive something else.
  expect(resolveMood("energetic", ["calm", "calm"], [])).toBe("energetic")
})

test("resolveMood trims the override before using it", () => {
  expect(resolveMood("  romantic  ", [], [])).toBe("romantic")
})

test("resolveMood falls back to dominantMood when override is absent or blank", () => {
  // No override: derive from the session row (warm flow, unchanged).
  expect(resolveMood(null, ["calm", "calm"], [])).toBe("calm")
  expect(resolveMood("", ["calm"], [])).toBe("calm")
  expect(resolveMood("   ", [], [])).toBe("authentic")
  // Empty session row with no override: the safe default.
  expect(resolveMood(null, [], [])).toBe("authentic")
})
