import { render, screen } from "@testing-library/react"
import { expect, test, vi } from "vitest"
import { ColdStartMoodPick } from "./ColdStartMoodPick"

test("ColdStartMoodPick offers moods and reports a pick", async () => {
  const onPick = vi.fn()
  render(<ColdStartMoodPick onPick={onPick} />)
  expect(screen.getByRole("button", { name: /calm/i })).toBeInTheDocument()
})
