"use client"

import { useState } from "react"
import { HokuMessage } from "../HokuMessage"
import { MOOD_IMAGES, moodsForImages } from "@/lib/moment/moodImages"
import type { StageProps } from "@/lib/moment/types"

// TODO(@bram): swap demo Unsplash images for founder-curated Act 0 imagery.
const DEMO_IMAGES: Record<string, string> = {
  empty_street: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&q=60",
  solo_bar: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&q=60",
  mountain_view: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=60",
  crowded_market: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&q=60",
  stranger_friends: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=60",
  child_guide: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=60",
}

// Shown when the hoku_agent reflection call returns nothing — Stage 2 must
// never block on a failed LLM call (spec §3.3 graceful degradation).
const FALLBACK_REFLECTION = "Thank you for telling me. I'll keep that with me."

// Stage 2 — "Mood Match." The traveller picks the scenes that feel like
// them; each image contributes mood slugs to the Mana.
export function Stage2Mood({ signal, commit, advanceStage }: StageProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [answer, setAnswer] = useState("")
  const [reflecting, setReflecting] = useState(false)
  const [reflection, setReflection] = useState<string | null>(null)

  const canContinue = selectedImages.length > 0

  function toggleImage(slug: string) {
    const next = selectedImages.includes(slug)
      ? selectedImages.filter((s) => s !== slug)
      : [...selectedImages, slug]
    setSelectedImages(next)
    commit({ moods: moodsForImages(next) })
  }

  async function submitReflection() {
    const text = answer.trim()
    if (!text || reflecting) return
    setReflecting(true)
    let reply = ""
    try {
      const res = await fetch("/api/moment/hoku", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "reflect", payload: { text } }),
      })
      if (res.ok) {
        const data: { reply?: string } = await res.json()
        reply = data.reply ?? ""
      }
    } catch {
      // Network failure falls through to the pre-authored line.
    }
    setReflection(reply.trim() || FALLBACK_REFLECTION)
    commit({ freeText: { stayed: text } })
    setReflecting(false)
  }

  return (
    <div data-testid="stage-2" className="flex min-h-dvh flex-col gap-6 px-4 py-8">
      <HokuMessage from="hoku">Which of these feels like you?</HokuMessage>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {MOOD_IMAGES.map((image) => {
          const isOn = selectedImages.includes(image.slug)
          return (
            <button
              key={image.slug}
              type="button"
              onClick={() => toggleImage(image.slug)}
              aria-pressed={isOn}
              className={[
                "group relative aspect-[4/5] overflow-hidden rounded-2xl border-2 text-left transition-all",
                isOn ? "border-clay ring-2 ring-clay-glow" : "border-line hover:border-clay",
              ].join(" ")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={DEMO_IMAGES[image.slug]}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <span
                className={[
                  "absolute inset-0 transition-opacity",
                  isOn ? "bg-clay/25" : "bg-ink/30 group-hover:bg-ink/20",
                ].join(" ")}
              />
              <span className="absolute bottom-0 left-0 right-0 p-3 text-sm font-medium text-surface">
                {image.label}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-3">
        <HokuMessage from="hoku">
          Tell me about one place that stayed with you.
        </HokuMessage>
        <label htmlFor="stayed" className="sr-only">
          Tell me about one place that stayed with you
        </label>
        <textarea
          id="stayed"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={3}
          placeholder="A street, a meal, a morning…"
          className="rounded-xl border border-line bg-surface px-3 py-2 text-ink"
        />
        <button
          type="button"
          onClick={submitReflection}
          disabled={reflecting || answer.trim().length === 0}
          className="self-start rounded-full border border-clay px-5 py-2 text-sm text-clay transition-opacity disabled:opacity-40"
        >
          {reflecting ? "Hoku is reading…" : "Share with Hoku"}
        </button>
        {reflection && <HokuMessage from="hoku">{reflection}</HokuMessage>}
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
