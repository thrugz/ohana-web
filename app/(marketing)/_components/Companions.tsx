const testimonials = [
  {
    name: "Maya",
    age: 29,
    city: "Berlin",
    quote:
      "I asked for a slow week in Oaxaca and got an itinerary that knew about my ceramics obsession before I even mentioned it. It felt like someone had been paying attention.",
    emoji: "🌿",
  },
  {
    name: "Scott",
    age: 54,
    city: "Toronto",
    quote:
      "After 30 years of travel, I was tired of planning. Ohana gave me back the feeling of discovery without the spreadsheets. Two trips in, it already knows me better than I know myself.",
    emoji: "✈️",
  },
  {
    name: "Yesenia",
    age: 32,
    city: "Mexico City",
    quote:
      "The companion matching feature is what surprised me most. I traveled solo to Seoul and met the most interesting people — not tourists, people who actually live there.",
    emoji: "☀️",
  },
]

export function Companions() {
  return (
    <section className="border-b border-[var(--color-line)] px-8 py-20 md:px-20">
      <p className="mb-3 text-[11px] uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
        Travelers
      </p>
      <h2
        className="mb-14"
        style={{
          fontFamily: "var(--font-serif)",
          fontVariationSettings: '"opsz" 72',
          fontWeight: 400,
          fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
          color: "var(--color-ink)",
        }}
      >
        What travelers say.
      </h2>

      <div className="grid gap-6 md:grid-cols-3" data-stagger>
        {testimonials.map((t) => (
          <div
            key={t.name}
            data-reveal
            className="rounded-2xl border border-[var(--color-line)] p-7"
            style={{ background: "var(--color-surface)" }}
          >
            <div className="mb-5 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                style={{ background: "var(--color-clay-soft)" }}
              >
                {t.emoji}
              </div>
              <div>
                <p className="text-[14px] font-medium" style={{ color: "var(--color-ink)" }}>
                  {t.name}, {t.age}
                </p>
                <p className="text-[12px]" style={{ color: "var(--color-muted)" }}>
                  {t.city}
                </p>
              </div>
            </div>
            <blockquote
              className="leading-relaxed"
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontVariationSettings: '"opsz" 20',
                fontWeight: 300,
                fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)",
                color: "var(--color-ink)",
                lineHeight: 1.65,
              }}
            >
              "{t.quote}"
            </blockquote>
          </div>
        ))}
      </div>
    </section>
  )
}
