"use client"

import { HokuMessage } from "@/components/moment/HokuMessage"
import { CLUSTER_LEAD } from "@/lib/discover/dominantMood"

interface ColdStartMoodPickProps {
  onPick: (mood: string) => void
}

// A ~20-second mini mood-pick shown when a traveller lands on /discover with
// no Mana — no moods or clusters to derive a dominant mood from. Rather than
// silently defaulting, Hoku asks. Each button is one of the 8 KGE Mood
// Clusters; picking it seeds the session with that cluster's lead mood.
export function ColdStartMoodPick({ onPick }: ColdStartMoodPickProps) {
  return (
    <section data-testid="cold-start-mood-pick" className="flex flex-col gap-4">
      <HokuMessage from="hoku">
        We haven&apos;t met yet — tell me how you&apos;d like to feel, and
        I&apos;ll find places to match.
      </HokuMessage>

      <div className="flex flex-wrap gap-2">
        {Object.entries(CLUSTER_LEAD).map(([cluster, lead]) => (
          <button
            key={cluster}
            type="button"
            onClick={() => onPick(lead)}
            className="border-line text-ink hover:border-clay rounded-full border px-4 py-2 text-sm transition-colors"
          >
            {cluster}
          </button>
        ))}
      </div>
    </section>
  )
}
