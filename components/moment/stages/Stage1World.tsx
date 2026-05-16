"use client"

import { GlobePicker } from "../GlobePicker"
import { HokuMessage } from "../HokuMessage"
import { continentCount } from "@/lib/moment/countries"
import type { StageProps } from "@/lib/moment/types"

// Stage 1 — "Your World." Hoku opens the interview; the traveller taps the
// countries they have visited on a full-bleed globe.
export function Stage1World({ signal, commit, advanceStage }: StageProps) {
  const countries = signal.visitedCountries
  const canContinue = countries.length > 0
  const continents = continentCount(countries)

  return (
    <div data-testid="stage-1" className="flex min-h-dvh flex-col">
      <div className="px-4 pt-8">
        <HokuMessage from="hoku">
          Let&apos;s start with where you&apos;ve been. Tap every country you&apos;ve
          set foot in — it&apos;s the first thread of your Mana.
        </HokuMessage>
      </div>

      <div className="relative my-6 min-h-[55dvh] flex-1 overflow-hidden">
        <GlobePicker
          selected={countries}
          onChange={(codes) => commit({ visitedCountries: codes })}
        />
      </div>

      <div className="flex items-center justify-between gap-4 px-4 pb-8">
        <p className="text-sm text-muted" aria-live="polite">
          {countries.length} {countries.length === 1 ? "country" : "countries"} ·{" "}
          {continents} {continents === 1 ? "continent" : "continents"}
        </p>
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => advanceStage()}
          className="rounded-full bg-clay px-6 py-2.5 font-medium text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
