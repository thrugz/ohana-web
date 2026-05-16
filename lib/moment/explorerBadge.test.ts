import { expect, test } from "vitest"
import { explorerBadge } from "./explorerBadge"

test("explorerBadge maps country count to tier", () => {
  expect(explorerBadge(0)).toBe("The Curious")
  expect(explorerBadge(3)).toBe("The Curious")
  expect(explorerBadge(9)).toBe("Explorer")
  expect(explorerBadge(20)).toBe("Adventurer")
  expect(explorerBadge(40)).toBe("Wanderer")
  expect(explorerBadge(60)).toBe("Nomad")
  expect(explorerBadge(99)).toBe("Legend")
})
