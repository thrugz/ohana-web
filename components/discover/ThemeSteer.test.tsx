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

test("ThemeSteer slugifies free-text input on submit", async () => {
  const onPick = vi.fn()
  render(<ThemeSteer themes={[]} onPick={onPick} />)
  await userEvent.type(screen.getByRole("textbox"), "Quiet Beaches")
  await userEvent.click(screen.getByRole("button", { name: /ask/i }))
  expect(onPick).toHaveBeenCalledWith("quiet-beaches")
})

test("ThemeSteer ignores a whitespace-only free-text submit", async () => {
  const onPick = vi.fn()
  render(<ThemeSteer themes={[]} onPick={onPick} />)
  await userEvent.type(screen.getByRole("textbox"), "   {Enter}")
  expect(onPick).not.toHaveBeenCalled()
})
