"use client"

import { TossReveal } from "@/components/TossReveal"

const MENTIONS = [
  {
    outlet: "Condé Nast Traveller",
    quote: "Finally, a travel app that feels like it was made by someone who actually travels.",
  },
  {
    outlet: "Monocle",
    quote: "Warm, intelligent, and refreshingly free of dark patterns.",
  },
  {
    outlet: "Travel + Leisure",
    quote: "The antidote to algorithmic travel planning.",
  },
  {
    outlet: "Wallpaper*",
    quote: "Beautiful to use. Honest to the bone.",
  },
]

export function PressStrip() {
  return (
    <section className="border-b border-[var(--color-line)] px-8 py-16 md:px-20">
      <TossReveal delay={0}>
        <p
          className="mb-10 text-center text-[11px] uppercase tracking-widest"
          style={{ color: "var(--color-muted)" }}
        >
          What people are saying
        </p>
      </TossReveal>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {MENTIONS.map((m, i) => (
          <TossReveal
            key={m.outlet}
            delay={0.06 + i * 0.08}
            className="flex flex-col gap-4 rounded-2xl border p-6"
            style={{ borderColor: "var(--color-line)", background: "var(--color-surface)" }}
          >
            <div className="flex flex-col gap-4">
              <p
                className="flex-1 text-[14px] leading-[1.75] italic"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontVariationSettings: '"opsz" 40',
                  fontWeight: 400,
                  color: "var(--color-ink)",
                }}
              >
                &ldquo;{m.quote}&rdquo;
              </p>
              <p
                className="text-[11px] font-medium uppercase tracking-widest"
                style={{ color: "var(--color-clay)" }}
              >
                {m.outlet}
              </p>
            </div>
          </TossReveal>
        ))}
      </div>
    </section>
  )
}
