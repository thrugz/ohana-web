import { render, screen } from "@testing-library/react"
import { expect, test, vi } from "vitest"
import { MomentFlow } from "./MomentFlow"

vi.mock("./useMomentSession", () => ({
  useMomentSession: () => ({
    state: { sessionId: "s1", currentStage: 1, signal: { visitedCountries: [], moods: [], freeText: {}, resonatedClusters: [], manaSummary: null }, completedAt: null },
    commit: vi.fn(), advanceStage: vi.fn(), loading: false,
  }),
}))

test("MomentFlow renders stage 1 at start", () => {
  render(<MomentFlow />)
  expect(screen.getByTestId("stage-1")).toBeInTheDocument()
})
