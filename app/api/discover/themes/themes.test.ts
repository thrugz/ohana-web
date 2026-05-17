import { expect, test } from "vitest"
import { parseSeen } from "./route"

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
