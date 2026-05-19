"use client"

import { useState } from "react"
import { Fingerprint } from "lucide-react"
import { passkeyRegister } from "@/lib/auth/passkey-client"

interface SaveManaPromptProps {
  // Dismiss without signing up — the prompt is skippable by design.
  onSkip: () => void
  // Called after a successful account creation. Falls back to onSkip if omitted.
  onSave?: () => void
}

type SaveState = "idle" | "pending" | "error" | "unsupported"

// Soft "Save your Mana" signup prompt shown at the Stage 4 emotional peak.
// The hard signup wall is deferred to the itinerary (spec §5, layered signup).
// "Save it" triggers an inline passkey registration that links the current
// anonymous_session row to the new traveller_users account via the
// moment_session cookie. On failure the user can always skip and continue.
export function SaveManaPrompt({ onSkip, onSave }: SaveManaPromptProps) {
  const [email, setEmail] = useState("")
  const [saveState, setSaveState] = useState<SaveState>("idle")

  const emailTrimmed = email.trim()
  const saveDisabled = saveState === "pending" || emailTrimmed === ""

  async function handleSave() {
    if (!window.PublicKeyCredential) {
      setSaveState("unsupported")
      return
    }
    setSaveState("pending")
    try {
      const ok = await passkeyRegister(emailTrimmed, emailTrimmed.split("@")[0])
      if (ok) {
        ;(onSave ?? onSkip)()
      } else {
        setSaveState("error")
      }
    } catch (err) {
      // User cancelled the passkey dialog — treat as idle, not an error.
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setSaveState("idle")
      } else {
        setSaveState("error")
      }
    }
  }

  return (
    <div className="rounded-3xl border border-clay/40 bg-clay-soft p-6 text-center">
      <h2 className="font-serif text-2xl text-ink" style={{ fontWeight: 400 }}>
        Save your Mana
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
        Keep your traveller signal so Hoku remembers you. Enter your email and
        create a passkey — no password to invent.
      </p>

      <div className="mx-auto mt-5 w-full max-w-xs">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setSaveState("idle") }}
          placeholder="your@email.com"
          autoComplete="email"
          className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-clay"
          disabled={saveState === "pending"}
        />
      </div>

      {saveState === "unsupported" && (
        <p className="mt-3 text-xs" style={{ color: "oklch(0.62 0.18 25)" }}>
          Passkeys are not supported in this browser. Use the{" "}
          <a href="/sign-in" className="underline">sign-in page</a> to create an account.
        </p>
      )}
      {saveState === "error" && (
        <p className="mt-3 text-xs" style={{ color: "oklch(0.62 0.18 25)" }}>
          Something went wrong. Try again or skip for now.
        </p>
      )}

      <div className="mt-4 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saveDisabled}
          className="flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-clay px-6 py-2.5 font-medium text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50 hover:opacity-90"
        >
          {saveState === "pending" ? (
            <>
              <span
                className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2"
                style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }}
              />
              Creating passkey…
            </>
          ) : (
            <>
              <Fingerprint size={14} />
              Save it
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-muted underline-offset-4 hover:underline"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
