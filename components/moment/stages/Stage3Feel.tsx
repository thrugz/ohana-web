"use client"

import { useEffect, useState } from "react"
import { HokuMessage } from "../HokuMessage"
import type { ClusterCard } from "@/lib/moment/moodClusters"
import type { StageProps } from "@/lib/moment/types"

interface Stage3Props extends StageProps {
  // Cluster cards. Optional: when absent the stage fetches them itself.
  clusters?: ClusterCard[]
}

type Reaction = "resonates" | "not"

// Stage 3 — "Let It Make You Feel Something." Hoku shows themed destination
// cluster cards matched to the traveller's Stage 1+2 signal; they react to each.
export function Stage3Feel({ clusters, signal, commit, advanceStage }: Stage3Props) {
  const [fetched, setFetched] = useState<ClusterCard[]>([])
  const [reactions, setReactions] = useState<Record<string, Reaction>>({})

  // Fetch cluster cards only when they were not supplied as a prop.
  useEffect(() => {
    if (clusters) return
    let cancelled = false
    fetch("/api/moment/clusters")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ClusterCard[]) => {
        if (!cancelled) setFetched(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [clusters])

  const cards = clusters ?? fetched
  const canContinue = Object.keys(reactions).length > 0

  function react(id: string, reaction: Reaction) {
    setReactions((prev) => ({ ...prev, [id]: reaction }))
    if (reaction === "resonates" && !signal.resonatedClusters.includes(id)) {
      commit({ resonatedClusters: [...signal.resonatedClusters, id] })
    }
  }

  return (
    <div data-testid="stage-3" className="flex min-h-dvh flex-col gap-6 px-4 py-8">
      <HokuMessage from="hoku">
        Here&apos;s what places like yours feel like. Tell me which ones land.
      </HokuMessage>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => {
          const reaction = reactions[card.id]
          return (
            <div
              key={card.id}
              className="overflow-hidden rounded-2xl border border-line bg-surface"
            >
              <div className="relative aspect-[16/10]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="absolute inset-0 bg-ink/25" />
                <h3 className="absolute bottom-0 left-0 right-0 p-3 font-serif text-lg text-surface">
                  {card.title}
                </h3>
              </div>
              <div className="flex gap-2 p-3">
                <button
                  type="button"
                  onClick={() => react(card.id, "resonates")}
                  aria-pressed={reaction === "resonates"}
                  className={[
                    "flex-1 rounded-full border px-4 py-2 text-sm transition-colors",
                    reaction === "resonates"
                      ? "border-clay bg-clay text-primary-foreground"
                      : "border-line text-ink hover:border-clay",
                  ].join(" ")}
                >
                  Resonates
                </button>
                <button
                  type="button"
                  onClick={() => react(card.id, "not")}
                  aria-pressed={reaction === "not"}
                  className={[
                    "flex-1 rounded-full border px-4 py-2 text-sm transition-colors",
                    reaction === "not"
                      ? "border-muted bg-canvas text-muted"
                      : "border-line text-ink hover:border-muted",
                  ].join(" ")}
                >
                  Not for me
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-auto flex justify-end pt-4">
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
