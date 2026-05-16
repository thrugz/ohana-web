import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, test, vi } from "vitest"
import { Stage3Feel } from "./Stage3Feel"
import type { ManaSignal } from "@/lib/moment/types"

const CLUSTERS = [
  { id: "c1", title: "Calm & Reflective", image: "" },
  { id: "c2", title: "Energetic & Social", image: "" },
]

function signal(over: Partial<ManaSignal> = {}): ManaSignal {
  return { visitedCountries: ["PT"], moods: ["serene"], freeText: {}, resonatedClusters: [], manaSummary: null, ...over }
}

test("tapping resonates commits the cluster id", async () => {
  const commit = vi.fn()
  render(<Stage3Feel clusters={[CLUSTERS[0]]} signal={signal()} commit={commit} advanceStage={vi.fn()} />)
  await userEvent.click(screen.getByRole("button", { name: /resonates/i }))
  expect(commit).toHaveBeenCalledWith({ resonatedClusters: ["c1"] })
})

test("Continue gates until at least one card is reacted to", async () => {
  const advanceStage = vi.fn()
  render(<Stage3Feel clusters={CLUSTERS} signal={signal()} commit={vi.fn()} advanceStage={advanceStage} />)
  const cont = screen.getByRole("button", { name: /continue/i })
  expect(cont).toBeDisabled()
  // "Not for me" still counts as a reaction.
  await userEvent.click(screen.getAllByRole("button", { name: /not for me/i })[0])
  expect(cont).toBeEnabled()
  await userEvent.click(cont)
  expect(advanceStage).toHaveBeenCalled()
})
