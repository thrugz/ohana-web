"use client"

import type { WejCard } from "@/lib/discover/types"

interface SavedTrayProps {
  cards: WejCard[]
}

// A persistent "♥ N saved" indicator. Tapping it expands a list of the saved
// cards. Always mounted by DiscoverFlow so the growing collection stays in
// view across the whole session.
export function SavedTray({ cards }: SavedTrayProps) {
  return (
    <details
      data-testid="saved-tray"
      className="border-line bg-surface fixed bottom-4 left-1/2 z-20 w-[min(36rem,calc(100%-2rem))] -translate-x-1/2 rounded-2xl border shadow-lg"
    >
      <summary className="text-ink flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm">
        <span className="text-clay">
          <span aria-hidden="true">♥</span> {cards.length} saved
        </span>
        <span className="text-muted text-xs">tap to view</span>
      </summary>

      {cards.length > 0 ? (
        <ul className="border-line max-h-64 overflow-y-auto border-t">
          {cards.map((card) => (
            <li
              key={card.poiId}
              className="border-line text-ink border-b px-4 py-2 text-sm last:border-b-0"
            >
              <span
                className="font-serif text-base"
                style={{ fontWeight: 400 }}
              >
                {card.name}
              </span>
              {card.city && (
                <span className="text-muted ml-2 text-xs">{card.city}</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="border-line text-muted border-t px-4 py-3 text-sm">
          Nothing saved yet — tap ♡ on a place you like.
        </p>
      )}
    </details>
  )
}
