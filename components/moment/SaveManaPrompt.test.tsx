import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, test, vi, beforeEach } from "vitest"
import { SaveManaPrompt } from "./SaveManaPrompt"

// Mock the passkey-client module so tests don't hit WebAuthn or the network.
vi.mock("@/lib/auth/passkey-client", () => ({
  passkeyRegister: vi.fn(),
}))

import { passkeyRegister } from "@/lib/auth/passkey-client"
const mockPasskeyRegister = vi.mocked(passkeyRegister)

beforeEach(() => {
  // Simulate a browser that supports passkeys.
  Object.defineProperty(window, "PublicKeyCredential", {
    value: class {},
    writable: true,
    configurable: true,
  })
  mockPasskeyRegister.mockReset()
})

test("Skip dismisses the prompt and calls onSkip", async () => {
  const onSkip = vi.fn()
  render(<SaveManaPrompt onSkip={onSkip} />)
  await userEvent.click(screen.getByRole("button", { name: /skip/i }))
  expect(onSkip).toHaveBeenCalled()
})

test("Save it is disabled until email is entered", () => {
  render(<SaveManaPrompt onSkip={vi.fn()} />)
  expect(screen.getByRole("button", { name: /save it/i })).toBeDisabled()
})

test("Save it calls onSave after successful passkey registration", async () => {
  const onSkip = vi.fn()
  const onSave = vi.fn()
  mockPasskeyRegister.mockResolvedValue(true)

  render(<SaveManaPrompt onSkip={onSkip} onSave={onSave} />)

  await userEvent.type(screen.getByPlaceholderText(/your@email/i), "traveller@ohana.world")
  await userEvent.click(screen.getByRole("button", { name: /save it/i }))

  await waitFor(() => expect(onSave).toHaveBeenCalled())
  expect(onSkip).not.toHaveBeenCalled()
})

test("Save it falls back to onSkip when onSave is not provided and registration succeeds", async () => {
  const onSkip = vi.fn()
  mockPasskeyRegister.mockResolvedValue(true)

  render(<SaveManaPrompt onSkip={onSkip} />)

  await userEvent.type(screen.getByPlaceholderText(/your@email/i), "traveller@ohana.world")
  await userEvent.click(screen.getByRole("button", { name: /save it/i }))

  await waitFor(() => expect(onSkip).toHaveBeenCalled())
})

test("Save it shows error state when registration fails", async () => {
  mockPasskeyRegister.mockResolvedValue(false)

  render(<SaveManaPrompt onSkip={vi.fn()} onSave={vi.fn()} />)

  await userEvent.type(screen.getByPlaceholderText(/your@email/i), "traveller@ohana.world")
  await userEvent.click(screen.getByRole("button", { name: /save it/i }))

  await waitFor(() =>
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  )
})

test("Save it shows unsupported message when passkeys unavailable", async () => {
  // Remove PublicKeyCredential to simulate unsupported browser.
  Object.defineProperty(window, "PublicKeyCredential", {
    value: undefined,
    writable: true,
    configurable: true,
  })

  render(<SaveManaPrompt onSkip={vi.fn()} onSave={vi.fn()} />)

  await userEvent.type(screen.getByPlaceholderText(/your@email/i), "traveller@ohana.world")
  await userEvent.click(screen.getByRole("button", { name: /save it/i }))

  await waitFor(() =>
    expect(screen.getByText(/not supported in this browser/i)).toBeInTheDocument()
  )
})

test("User cancelling the passkey dialog resets to idle, does not call onSave", async () => {
  const onSave = vi.fn()
  const cancelError = new DOMException("User cancelled", "NotAllowedError")
  mockPasskeyRegister.mockRejectedValue(cancelError)

  render(<SaveManaPrompt onSkip={vi.fn()} onSave={onSave} />)

  await userEvent.type(screen.getByPlaceholderText(/your@email/i), "traveller@ohana.world")
  await userEvent.click(screen.getByRole("button", { name: /save it/i }))

  await waitFor(() => expect(onSave).not.toHaveBeenCalled())
  // Button should be re-enabled (idle state, not pending or error)
  expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument()
})
