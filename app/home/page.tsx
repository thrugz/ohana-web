import Image from "next/image"
import { getTwinData } from "@/lib/twin/data"
import { greeting } from "@/lib/twin/greeting"
import { countryImage, COUNTRY_PLACEHOLDER } from "@/lib/twin/countryImages"
import { getTwinSession } from "@/lib/auth/session"
import { HokuMessage } from "@/components/moment/HokuMessage"
import { HokuThread } from "@/components/moment/HokuThread"

export default async function HomePage() {
  const session = await getTwinSession()
  const twin = await getTwinData()
  const userName = session?.user?.name ?? null

  const greetingText = greeting(new Date(), userName?.split(" ")[0])

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-8">

      {/* ── Hoku greeting ── */}
      <HokuThread>
        <HokuMessage from="hoku">
          <span style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "1.1rem" }}>
            {greetingText}
          </span>
          {twin?.portrait && (
            <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "var(--color-muted)" }}>
              {twin.portrait}
            </p>
          )}
        </HokuMessage>
      </HokuThread>

      {/* ── Explorer badge ── */}
      {twin && (
        <section className="mt-6 px-4">
          <p className="text-[11px] uppercase tracking-widest text-muted mb-1">Your level</p>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontVariationSettings: '"opsz" 144',
              fontWeight: 400,
              fontSize: "clamp(2rem, 5vw, 3rem)",
              color: "var(--color-clay)",
              lineHeight: 1,
            }}
          >
            {twin.explorerBadge}
          </p>
          <p className="mt-1 text-sm text-muted">
            {twin.visitedCountries.length} {twin.visitedCountries.length === 1 ? "country" : "countries"} explored
          </p>
        </section>
      )}

      {/* ── Where you've been ── */}
      {twin && twin.visitedCountries.length > 0 && (
        <section className="mt-10 px-4">
          <h2 className="text-[11px] uppercase tracking-widest text-muted mb-4">Where you&apos;ve been</h2>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {twin.visitedCountries.slice(0, 12).map((country) => (
              <div
                key={country}
                className="relative flex-none rounded-xl overflow-hidden"
                style={{ width: 140, height: 100 }}
              >
                <Image
                  src={countryImage(country)}
                  alt={country}
                  fill
                  className="object-cover"
                  style={{ filter: "saturate(0.85)" }}
                />
                <div
                  className="absolute inset-0 flex items-end p-2"
                  style={{
                    background: "linear-gradient(to top, oklch(0.15 0.02 55 / 0.7) 0%, transparent 60%)",
                  }}
                >
                  <span className="text-[11px] text-white capitalize leading-tight">{country}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Saved places ── */}
      {twin && twin.savedPois.length > 0 && (
        <section className="mt-10 px-4">
          <h2 className="text-[11px] uppercase tracking-widest text-muted mb-4">Saved places</h2>
          <div className="flex flex-col gap-3">
            {twin.savedPois.map((poi) => (
              <div
                key={poi.id}
                className="flex items-start gap-4 rounded-xl border border-line bg-surface p-4"
              >
                <Image
                  src={COUNTRY_PLACEHOLDER}
                  alt={poi.name}
                  width={72}
                  height={72}
                  className="rounded-lg object-cover flex-none"
                />
                <div className="min-w-0">
                  <p className="font-medium text-ink text-[15px] leading-snug">{poi.name}</p>
                  {poi.poiType && (
                    <p className="text-[11px] uppercase tracking-wide text-muted mt-0.5">{poi.poiType}</p>
                  )}
                  {poi.shortDescription && (
                    <p className="text-[13px] text-muted mt-1 leading-snug line-clamp-2">
                      {poi.shortDescription}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Your journeys (stub) ── */}
      <section className="mt-10 px-4">
        <h2 className="text-[11px] uppercase tracking-widest text-muted mb-4">Your journeys</h2>
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
            Your adventures are being woven together.
          </p>
          <p className="mt-2 text-sm text-muted">
            Full trip archives and day-by-day itineraries are coming in a future update.
          </p>
        </div>
      </section>

    </div>
  )
}
