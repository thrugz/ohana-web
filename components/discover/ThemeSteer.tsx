"use client"

import { useState } from "react"

interface ThemeOption {
  slug: string
  label: string
}

interface ThemeSteerProps {
  themes: ThemeOption[]
  onPick: (slug: string) => void
}

// Hoku's next-angle steering: a row of theme chips plus a free-text input.
// Mirrors the Moment Site's chip styling (Stage 3) and free-text submit
// pattern (Stage 2). Picking a chip or submitting text both call `onPick`.
export function ThemeSteer({ themes, onPick }: ThemeSteerProps) {
  const [text, setText] = useState("")

  function submitText() {
    const trimmed = text.trim()
    if (!trimmed) return
    setText("")
    onPick(trimmed)
  }

  return (
    <section data-testid="theme-steer" className="flex flex-col gap-3">
      {themes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {themes.map((theme) => (
            <button
              key={theme.slug}
              type="button"
              onClick={() => onPick(theme.slug)}
              className="border-line text-ink hover:border-clay rounded-full border px-4 py-2 text-sm transition-colors"
            >
              {theme.label}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          submitText()
        }}
        className="flex gap-2"
      >
        <label htmlFor="theme-steer-input" className="sr-only">
          Tell Hoku what you're in the mood for
        </label>
        <input
          id="theme-steer-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Or tell me what you're after…"
          className="border-line bg-surface text-ink flex-1 rounded-full border px-4 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={text.trim().length === 0}
          className="border-clay text-clay rounded-full border px-4 py-2 text-sm transition-opacity disabled:opacity-40"
        >
          Ask
        </button>
      </form>
    </section>
  )
}
