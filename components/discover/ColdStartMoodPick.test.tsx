import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, test, vi } from "vitest"
import { ColdStartMoodPick } from "./ColdStartMoodPick"

test("ColdStartMoodPick offers moods and reports a pick", async () => {
  const onPick = vi.fn()
  render(<ColdStartMoodPick onPick={onPick} />)
  expect(screen.getByRole("button", { name: /calm/i })).toBeInTheDocument()

  // Clicking the "Calm & Reflective" cluster reports its lead mood "calm",
  // verifying the cluster -> lead-mood mapping reused from dominantMood.ts.
  await userEvent.click(screen.getByRole("button", { name: /calm/i }))
  expect(onPick).toHaveBeenCalledWith("calm")
})
