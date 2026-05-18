// app/plan/_components/PlanForm.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { SavedPoi } from "@/lib/twin/data"

export function PlanForm({ savedPois }: { savedPois: SavedPoi[] }) {
  const [days, setDays] = useState(3)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savedPoiIds: savedPois.map((p) => p.id), days }),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error ?? "Failed to generate itinerary")
      }
      const { itineraryId } = (await res.json()) as { itineraryId: string }
      router.push(`/plan/${itineraryId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <section>
        <h2
          className="text-[11px] uppercase tracking-widest mb-4"
          style={{ color: "var(--color-muted)" }}
        >
          Your saved places ({savedPois.length})
        </h2>
        <div className="flex flex-col gap-3 mb-8">
          {savedPois.map((poi) => (
            <div
              key={poi.id}
              className="flex items-start gap-4 rounded-xl border border-line p-4"
              style={{ background: "var(--color-surface)" }}
            >
              <div className="min-w-0">
                <p className="font-medium text-ink text-[15px] leading-snug">{poi.name}</p>
                {poi.poiType && (
                  <p
                    className="text-[11px] uppercase tracking-wide mt-0.5"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {poi.poiType}
                  </p>
                )}
                {poi.shortDescription && (
                  <p
                    className="text-[13px] mt-1 leading-snug line-clamp-2"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {poi.shortDescription}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mb-6">
          <label
            htmlFor="days"
            className="text-[11px] uppercase tracking-widest"
            style={{ color: "var(--color-muted)" }}
          >
            Days
          </label>
          <input
            id="days"
            type="number"
            min={1}
            max={30}
            value={days}
            onChange={(e) =>
              setDays(Math.max(1, Math.min(30, parseInt(e.target.value, 10) || 1)))
            }
            className="w-20 rounded-lg border border-line px-3 py-2 text-sm"
            style={{ background: "var(--color-surface)", color: "var(--color-ink)" }}
          />
        </div>

        {error && (
          <p className="text-sm mb-4" style={{ color: "oklch(0.5 0.2 27)" }}>
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-xl px-6 py-3 text-sm font-medium transition-opacity disabled:opacity-50"
          style={{ background: "var(--color-clay)", color: "var(--color-canvas)" }}
        >
          {loading ? "Generating…" : "Generate itinerary"}
        </button>
      </section>
    </div>
  )
}
