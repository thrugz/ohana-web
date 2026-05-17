import { render, screen } from "@testing-library/react"
import { expect, test, vi } from "vitest"
import { DiscoverFlow } from "./DiscoverFlow"

vi.mock("./useDiscoverSession", () => ({
  useDiscoverSession: () => ({
    state: { sessionId: "s1", mood: "serene", currentWej: null, seenThemes: [], savedPoiIds: [] },
    loading: false, error: false, hasMana: true,
    retry: vi.fn(), loadWej: vi.fn(), toggleSave: vi.fn(), seedMood: vi.fn(),
  }),
}))

test("DiscoverFlow renders the discover session", () => {
  render(<DiscoverFlow />)
  expect(screen.getByTestId("discover-flow")).toBeInTheDocument()
})
