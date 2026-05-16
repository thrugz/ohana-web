import { render, screen } from "@testing-library/react"
import { expect, test, vi } from "vitest"
import { Stage5Moments } from "./Stage5Moments"

test("Stage 5 shows the completion line and Discovery CTA", () => {
  render(<Stage5Moments signal={{ visitedCountries: ["PT"], moods: ["food"], freeText: {}, resonatedClusters: ["c1"], manaSummary: { explorerBadge: "Explorer", portrait: "Y" } }} commit={vi.fn()} advanceStage={vi.fn()} />)
  expect(screen.getByText(/your mana is ready/i)).toBeInTheDocument()
  expect(screen.getByRole("link", { name: /discovery/i })).toBeInTheDocument()
})

test("Stage 5 marks the session complete on mount", () => {
  const commit = vi.fn()
  render(<Stage5Moments signal={{ visitedCountries: ["PT"], moods: ["food"], freeText: {}, resonatedClusters: ["c1"], manaSummary: { explorerBadge: "Explorer", portrait: "Y" } }} commit={commit} advanceStage={vi.fn()} />)
  expect(commit).toHaveBeenCalledTimes(1)
  const patch = commit.mock.calls[0][0]
  expect(typeof patch.completedAt).toBe("string")
  expect(Number.isNaN(Date.parse(patch.completedAt))).toBe(false)
})
