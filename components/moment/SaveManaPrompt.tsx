"use client"

interface SaveManaPromptProps {
  // Dismiss without signing up — the prompt is skippable by design.
  onSkip: () => void
  // Proceed after recording save intent. Falls back to onSkip if omitted.
  onSave?: () => void
}

// Soft "Save your Mana" signup prompt shown at the Stage 4 emotional peak.
// The hard signup wall is deferred to the itinerary (spec §5, layered signup).
export function SaveManaPrompt({ onSkip, onSave }: SaveManaPromptProps) {
  function handleSave() {
    ;(onSave ?? onSkip)()
  }

  return (
    <div className="rounded-3xl border border-clay/40 bg-clay-soft p-6 text-center">
      <h2 className="font-serif text-2xl text-ink" style={{ fontWeight: 400 }}>
        Save your Mana
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
        Keep your traveller signal so Hoku remembers you. A magic link or a
        passkey — no password to invent.
      </p>
      <div className="mt-5 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="w-full max-w-xs rounded-full bg-clay px-6 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Save it
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
