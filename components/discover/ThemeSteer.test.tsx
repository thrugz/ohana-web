import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, test, vi } from "vitest"
import { ThemeSteer } from "./ThemeSteer"

test("ThemeSteer fires onPick with the chosen theme", async () => {
  const onPick = vi.fn()
  render(<ThemeSteer themes={[{ slug: "hiking", label: "Adventurous Hikes" }]} onPick={onPick} />)
  await userEvent.click(screen.getByRole("button", { name: /Adventurous Hikes/i }))
  expect(onPick).toHaveBeenCalledWith("hiking")
})
