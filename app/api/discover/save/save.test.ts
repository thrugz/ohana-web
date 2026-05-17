import { expect, test } from "vitest"
import { applySave } from "./route"

test("applySave adds a new poiId", () => {
  expect(applySave(["a"], "b", true)).toEqual(["a", "b"])
})
test("applySave removes on unsave", () => {
  expect(applySave(["a", "b"], "b", false)).toEqual(["a"])
})
test("applySave is idempotent on double-add", () => {
  expect(applySave(["a"], "a", true)).toEqual(["a"])
})
