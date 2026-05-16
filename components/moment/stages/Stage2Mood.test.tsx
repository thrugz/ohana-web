import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, expect, test, vi } from "vitest"
import { Stage2Mood } from "./Stage2Mood"
import type { ManaSignal } from "@/lib/moment/types"

function signal(over: Partial<ManaSignal> = {}): ManaSignal {
  return { visitedCountries: ["PT"], moods: [], freeText: {}, resonatedClusters: [], manaSummary: null, ...over }
}

afterEach(() => {
  vi.restoreAllMocks()
})

test("picking the empty-street image commits its mood slugs", async () => {
  const commit = vi.fn()
  render(<Stage2Mood signal={signal()} commit={commit} advanceStage={vi.fn()} />)
  await userEvent.click(screen.getByRole("button", { name: /empty street/i }))
  expect(commit).toHaveBeenCalledWith({ moods: ["serene", "reflective", "slow_paced"] })
})

test("selecting two images commits the deduped union of mood slugs", async () => {
  const commit = vi.fn()
  render(<Stage2Mood signal={signal()} commit={commit} advanceStage={vi.fn()} />)
  // empty_street → serene, reflective, slow_paced
  await userEvent.click(screen.getByRole("button", { name: /empty street/i }))
  // mountain_view → epic, scenic, reflective (reflective is a duplicate)
  await userEvent.click(screen.getByRole("button", { name: /summit/i }))
  expect(commit).toHaveBeenLastCalledWith({
    moods: ["serene", "reflective", "slow_paced", "epic", "scenic"],
  })
})

test("Continue gates on at least one image selected", async () => {
  const advanceStage = vi.fn()
  render(<Stage2Mood signal={signal()} commit={vi.fn()} advanceStage={advanceStage} />)
  const cont = screen.getByRole("button", { name: /continue/i })
  expect(cont).toBeDisabled()
  await userEvent.click(screen.getByRole("button", { name: /crowded market/i }))
  expect(cont).toBeEnabled()
  await userEvent.click(cont)
  expect(advanceStage).toHaveBeenCalled()
})

test("empty Hoku reply falls back to a pre-authored line and never blocks", async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ reply: "" }),
  }) as unknown as typeof fetch
  const commit = vi.fn()
  render(<Stage2Mood signal={signal()} commit={commit} advanceStage={vi.fn()} />)

  await userEvent.click(screen.getByRole("button", { name: /empty street/i }))
  await userEvent.type(screen.getByLabelText(/place that stayed/i), "Lisbon")
  await userEvent.click(screen.getByRole("button", { name: /share/i }))

  // Pre-authored fallback line is shown even though the LLM returned nothing.
  expect(await screen.findByText(/i'll keep that with me/i)).toBeInTheDocument()
  expect(commit).toHaveBeenCalledWith({ freeText: { stayed: "Lisbon" } })
  // The flow is not blocked: Continue is still available.
  expect(screen.getByRole("button", { name: /continue/i })).toBeEnabled()
})
