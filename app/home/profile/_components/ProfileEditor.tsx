"use client"

import { useState, useCallback, useRef } from "react"

interface Props {
  initialCountries: string[]
  initialMoods: string[]
  initialThemes: string[]
  availableMoods: string[]
  availableThemes: string[]
}

async function savePatch(patch: {
  visitedCountries?: string[]
  preferredMoods?: string[]
  preferredThemes?: string[]
}) {
  await fetch("/api/twin/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  })
}

export function ProfileEditor({
  initialCountries,
  initialMoods,
  initialThemes,
  availableMoods,
  availableThemes,
}: Props) {
  const [countries, setCountries] = useState(initialCountries)
  const [moods, setMoods] = useState(new Set(initialMoods))
  const [themes, setThemes] = useState(new Set(initialThemes))
  const [countryInput, setCountryInput] = useState("")
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle")
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleSave = useCallback(
    (patch: Parameters<typeof savePatch>[0]) => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      setSaveState("saving")
      saveTimer.current = setTimeout(async () => {
        await savePatch(patch)
        setSaveState("saved")
        setTimeout(() => setSaveState("idle"), 2000)
      }, 500)
    },
    [],
  )

  function addCountry() {
    const trimmed = countryInput.trim().toLowerCase()
    if (!trimmed || countries.includes(trimmed)) return
    const next = [...countries, trimmed]
    setCountries(next)
    setCountryInput("")
    scheduleSave({ visitedCountries: next })
  }

  function removeCountry(c: string) {
    const next = countries.filter((x) => x !== c)
    setCountries(next)
    scheduleSave({ visitedCountries: next })
  }

  function toggleMood(mood: string) {
    const next = new Set(moods)
    next.has(mood) ? next.delete(mood) : next.add(mood)
    setMoods(next)
    scheduleSave({ preferredMoods: Array.from(next) })
  }

  function toggleTheme(theme: string) {
    const next = new Set(themes)
    next.has(theme) ? next.delete(theme) : next.add(theme)
    setThemes(next)
    scheduleSave({ preferredThemes: Array.from(next) })
  }

  return (
    <div className="mt-8 space-y-10">
      {/* Save indicator */}
      <div className="h-4">
        {saveState === "saving" && (
          <span className="text-[11px] uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
            Saving…
          </span>
        )}
        {saveState === "saved" && (
          <span className="text-[11px] uppercase tracking-widest" style={{ color: "var(--color-clay)" }}>
            Saved
          </span>
        )}
      </div>

      {/* Countries visited */}
      <section>
        <h2 className="text-[11px] uppercase tracking-widest mb-3" style={{ color: "var(--color-muted)" }}>
          Countries visited
        </h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {countries.map((c) => (
            <span
              key={c}
              className="flex items-center gap-1 rounded-full px-3 py-1 text-sm border border-line"
              style={{ background: "var(--color-surface)", color: "var(--color-ink)" }}
            >
              <span className="capitalize">{c}</span>
              <button
                type="button"
                onClick={() => removeCountry(c)}
                className="text-muted hover:text-ink transition-colors ml-1"
                aria-label={`Remove ${c}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={countryInput}
            onChange={(e) => setCountryInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCountry()}
            placeholder="Add a country…"
            className="flex-1 rounded-lg border border-line px-3 py-2 text-sm bg-surface text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-clay/30"
          />
          <button
            type="button"
            onClick={addCountry}
            className="rounded-lg px-4 py-2 text-sm border border-line bg-surface text-ink hover:bg-canvas transition-colors"
          >
            Add
          </button>
        </div>
      </section>

      {/* Mood preferences */}
      <section>
        <h2 className="text-[11px] uppercase tracking-widest mb-3" style={{ color: "var(--color-muted)" }}>
          Travel moods
        </h2>
        <div className="flex flex-wrap gap-2">
          {availableMoods.map((mood) => (
            <button
              key={mood}
              type="button"
              onClick={() => toggleMood(mood)}
              className="rounded-full px-3 py-1 text-sm border transition-colors capitalize"
              style={
                moods.has(mood)
                  ? { background: "var(--color-clay)", color: "var(--color-canvas)", borderColor: "var(--color-clay)" }
                  : { background: "var(--color-surface)", color: "var(--color-ink)", borderColor: "var(--color-line)" }
              }
            >
              {mood.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </section>

      {/* Theme preferences */}
      <section>
        <h2 className="text-[11px] uppercase tracking-widest mb-3" style={{ color: "var(--color-muted)" }}>
          Travel themes
        </h2>
        <div className="flex flex-wrap gap-2">
          {availableThemes.map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => toggleTheme(theme)}
              className="rounded-full px-3 py-1 text-sm border transition-colors capitalize"
              style={
                themes.has(theme)
                  ? { background: "var(--color-clay)", color: "var(--color-canvas)", borderColor: "var(--color-clay)" }
                  : { background: "var(--color-surface)", color: "var(--color-ink)", borderColor: "var(--color-line)" }
              }
            >
              {theme.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
