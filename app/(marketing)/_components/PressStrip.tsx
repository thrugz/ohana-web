"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"

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
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-15% 0px" })

  return (
    <section
      ref={ref}
      className="border-b border-[var(--color-line)] px-8 py-16 md:px-20"
    >
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center text-[11px] uppercase tracking-widest"
        style={{ color: "var(--color-muted)" }}
      >
        What people are saying
      </motion.p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {MENTIONS.map((m, i) => (
          <motion.div
            key={m.outlet}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{
              delay: 0.1 + i * 0.1,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex flex-col gap-4 rounded-2xl border p-6"
            style={{ borderColor: "var(--color-line)", background: "var(--color-surface)" }}
          >
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
          </motion.div>
        ))}
      </div>
    </section>
  )
}
