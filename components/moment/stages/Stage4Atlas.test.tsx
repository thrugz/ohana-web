import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, expect, test, vi } from "vitest"
import { Stage4Atlas } from "./Stage4Atlas"
import type { ManaSignal } from "@/lib/moment/types"

function signal(over: Partial<ManaSignal> = {}): ManaSignal {
  return {
    visitedCountries: ["PT", "ES", "FR", "IT", "DE", "NL"],
    moods: ["serene"],
    freeText: {},
    resonatedClusters: ["calm_reflective"],
    manaSummary: null,
    ...over,
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

test("Atlas shows the computed Explorer Badge and the generated portrait", async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ portrait: "You travel to be changed, not to tick boxes." }),
  }) as unknown as typeof fetch

  const commit = vi.fn()
  // 6 visited countries -> "Explorer" tier
  render(<Stage4Atlas signal={signal()} commit={commit} advanceStage={vi.fn()} />)
  expect(await screen.findByText(/Explorer/)).toBeInTheDocument()
  expect(await screen.findByText(/travel to be changed/)).toBeInTheDocument()
})

test("empty Hoku reply still renders a portrait and the real badge, flow advances", async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ portrait: "" }),
  }) as unknown as typeof fetch

  const commit = vi.fn()
  const advanceStage = vi.fn()
  // 2 visited countries -> "The Curious" tier
  render(
    <Stage4Atlas
      signal={signal({ visitedCountries: ["PT", "ES"] })}
      commit={commit}
      advanceStage={advanceStage}
    />,
  )

  // Badge tier is computed, always real even with no LLM reply.
  expect(await screen.findByText(/The Curious/)).toBeInTheDocument()
  // Pre-authored generic portrait fills in for the empty reply.
  expect(await screen.findByText(/open heart/i)).toBeInTheDocument()

  const cont = await screen.findByRole("button", { name: /continue/i })
  await userEvent.click(cont)
  expect(advanceStage).toHaveBeenCalled()
  expect(commit).toHaveBeenCalledWith({
    manaSummary: { explorerBadge: "The Curious", portrait: expect.stringMatching(/open heart/i) },
  })
})
