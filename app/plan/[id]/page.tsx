// app/plan/[id]/page.tsx
import { requireTwin } from "@/lib/auth/session"
import { getItinerary } from "@/lib/plan/db"
import { notFound } from "next/navigation"
import { SendEmailButton } from "./_components/SendEmailButton"

export default async function ItineraryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireTwin()
  const { id } = await params
  const itinerary = await getItinerary(id, user.id)
  if (!itinerary) notFound()

  const totalPlaces = itinerary.days.reduce((sum, d) => sum + d.items.length, 0)

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
        {itinerary.title}
      </h1>
      <p className="mt-1 mb-10 text-sm" style={{ color: "var(--color-muted)" }}>
        {itinerary.days.length} {itinerary.days.length === 1 ? "day" : "days"} &middot; {totalPlaces}{" "}
        {totalPlaces === 1 ? "place" : "places"}
      </p>

      <div className="flex flex-col gap-10">
        {itinerary.days.map((day) => (
          <section key={day.dayIndex}>
            <h2
              className="text-[11px] uppercase tracking-widest mb-4"
              style={{ color: "var(--color-muted)" }}
            >
              Day {day.dayIndex + 1}
              {day.items[0]?.cityName && (
                <span
                  className="ml-2 capitalize"
                  style={{ textTransform: "capitalize", letterSpacing: "normal" }}
                >
                  — {day.items[0].cityName}
                </span>
              )}
            </h2>
            <div className="flex flex-col gap-3">
              {day.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 rounded-xl border border-line p-4"
                  style={{ background: "var(--color-surface)" }}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-ink text-[15px] leading-snug">{item.name}</p>
                    {item.poiType && (
                      <p
                        className="text-[11px] uppercase tracking-wide mt-0.5"
                        style={{ color: "var(--color-muted)" }}
                      >
                        {item.poiType}
                      </p>
                    )}
                    {item.shortDescription && (
                      <p
                        className="text-[13px] mt-1 leading-snug line-clamp-2"
                        style={{ color: "var(--color-muted)" }}
                      >
                        {item.shortDescription}
                      </p>
                    )}
                    {item.cityName && (
                      <p
                        className="text-[11px] mt-1 capitalize"
                        style={{ color: "var(--color-muted)" }}
                      >
                        {item.cityName}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10">
        <SendEmailButton itineraryId={id} />
      </div>
    </div>
  )
}
