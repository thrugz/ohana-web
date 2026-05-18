"use client"

import { WejCard } from "./WejCard"
import type { Wej } from "@/lib/discover/types"

interface WejFeedProps {
  wej: Wej
  savedPoiIds: string[]
  onToggleSave: (poiId: string, saved: boolean) => void
}

// Deterministic one-line Hoku intro for a Wej. The flow never blocks on the
// LLM — and the hoku_agent endpoint only supports the `reflect`/`portrait`
// modes — so the intro is always this template, never a network call.
function introLine(wej: Wej): string {
  return `${wej.title} — for your ${wej.mood} moments`
}

// A Wej rendered as a vertical scroll feed: a Hoku intro line, then every
// card. The traveller scrolls and taps ♡ to save; saved state is owned by
// the session hook and flows back down through `savedPoiIds`.
export function WejFeed({ wej, savedPoiIds, onToggleSave }: WejFeedProps) {
  return (
    <section data-testid="wej-feed" className="flex flex-col gap-4">
      <p
        className="text-ink font-serif text-xl leading-snug"
        style={{ fontWeight: 400 }}
      >
        {introLine(wej)}
      </p>

      {wej.thin && (
        <p className="text-muted text-sm">A small, hand-picked set this time — still worth a look.</p>
      )}

      <div className="flex flex-col gap-4">
        {wej.cards.map((card) => (
          <WejCard
            key={card.poiId}
            card={card}
            saved={savedPoiIds.includes(card.poiId)}
            onToggleSave={onToggleSave}
          />
        ))}
      </div>
    </section>
  )
}
