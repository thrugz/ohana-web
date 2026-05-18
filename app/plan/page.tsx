// app/plan/page.tsx
import { getTwinData } from "@/lib/twin/data"
import { PlanForm } from "./_components/PlanForm"

export default async function PlanPage() {
  const twin = await getTwinData()
  const savedPois = twin?.savedPois ?? []

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-8">
      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontVariationSettings: '"opsz" 144',
          fontWeight: 400,
          fontSize: "clamp(2rem, 5vw, 3rem)",
          color: "var(--color-ink)",
          lineHeight: 1,
        }}
      >
        Plan your trip
      </h1>
      <p className="mt-2 mb-8 text-sm" style={{ color: "var(--color-muted)" }}>
        Build a day-by-day itinerary from your saved places.
      </p>

      {savedPois.length === 0 ? (
        <div
          className="rounded-xl border border-line p-8 text-center"
          style={{ background: "var(--color-surface)" }}
        >
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 400,
              fontVariationSettings: '"opsz" 72',
              fontSize: "1.25rem",
              color: "var(--color-ink)",
            }}
          >
            No saved places yet.
          </p>
          <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
            <a
              href="/discover"
              className="underline underline-offset-2 hover:text-ink transition-colors"
            >
              Discover places
            </a>{" "}
            to add them here.
          </p>
        </div>
      ) : (
        <PlanForm savedPois={savedPois} />
      )}
    </div>
  )
}
