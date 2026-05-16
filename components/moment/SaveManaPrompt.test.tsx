import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, test, vi } from "vitest"
import { SaveManaPrompt } from "./SaveManaPrompt"

test("Skip dismisses the prompt and calls onSkip", async () => {
  const onSkip = vi.fn()
  render(<SaveManaPrompt onSkip={onSkip} />)
  await userEvent.click(screen.getByRole("button", { name: /skip/i }))
  expect(onSkip).toHaveBeenCalled()
})

test("Save it records intent and proceeds via onSave", async () => {
  const onSkip = vi.fn()
  const onSave = vi.fn()
  render(<SaveManaPrompt onSkip={onSkip} onSave={onSave} />)
  await userEvent.click(screen.getByRole("button", { name: /save it/i }))
  expect(onSave).toHaveBeenCalled()
})
