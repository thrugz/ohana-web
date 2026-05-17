"use client"

import { useState } from "react"
import type { WejCard as WejCardData } from "@/lib/discover/types"

interface WejCardProps {
  card: WejCardData
  saved: boolean
  onToggleSave: (poiId: string, saved: boolean) => void
}

// One POI card in a Wej. Pure presentational — owns only its expand state.
// Source attribution ("via Sergio") is always visible: the brand promise is
// "nothing invented, every fact sourced".
export function WejCard({ card, saved, onToggleSave }: WejCardProps) {
  const [expanded, setExpanded] = useState(false)
  // POI photos come from public data sources and often 404; fall back gracefully.
  const [photoBroken, setPhotoBroken] = useState(false)
  const showPhoto = card.photoUrl !== null && !photoBroken

  function handleSave(e: React.MouseEvent) {
    // Keep the heart independent of the card-body expand toggle.
    e.stopPropagation()
    onToggleSave(card.poiId, !saved)
  }

  return (
    <article
      className="border-line bg-surface overflow-hidden rounded-3xl border transition-shadow"
      style={{ boxShadow: "0 1px 2px var(--color-clay-glow)" }}
    >
      {/* Media: real photo, or an intentional text-forward fallback. */}
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary external POI URLs, no loader config
        <img
          src={card.photoUrl as string}
          alt={card.name}
          onError={() => setPhotoBroken(true)}
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="bg-clay-soft flex h-40 w-full flex-col items-center justify-center px-6 text-center">
          <span
            className="text-clay font-serif text-lg"
            style={{ fontWeight: 400 }}
          >
            {card.city ?? "Somewhere worth finding"}
          </span>
          <span className="text-muted mt-1 text-xs uppercase tracking-wide">
            {card.theme}
          </span>
        </div>
      )}

      {/* Body — tapping toggles expansion. Not a <button> so the save
          control can nest as a real button without invalid HTML. */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setExpanded((v) => !v)
          }
        }}
        aria-expanded={expanded}
        className="block w-full cursor-pointer px-5 pb-4 pt-4 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <h3
            className="text-ink font-serif text-lg leading-snug"
            style={{ fontWeight: 400 }}
          >
            {card.name}
          </h3>
          <button
            type="button"
            onClick={handleSave}
            aria-label={saved ? "unsave" : "save"}
            aria-pressed={saved}
            className="text-clay -mr-1 -mt-1 shrink-0 rounded-full p-1.5 text-xl leading-none transition-transform hover:scale-110"
          >
            <span aria-hidden="true">{saved ? "♥" : "♡"}</span>
          </button>
        </div>

        <p className="text-muted mt-1 text-xs">
          <span className="capitalize">{card.mood}</span>
          {" · "}
          <span className="capitalize">{card.theme}</span>
        </p>

        {expanded && (
          <div className="mt-3 space-y-2">
            <p className="text-ink text-sm leading-relaxed">
              {card.shortDescription}
            </p>
            {card.city && (
              <p className="text-muted text-xs">{card.city}</p>
            )}
          </div>
        )}

        {/* Always visible — collapsed or expanded. */}
        <p className="text-muted mt-3 text-xs italic">via {card.source}</p>
      </div>
    </article>
  )
}
