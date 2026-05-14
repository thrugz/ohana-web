"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"

const steps = [
  {
    num: "01",
    title: "Tell Ohana your vibe",
    body: "How you like to travel, who you travel with, what matters most. Takes about three minutes.",
  },
  {
    num: "02",
    title: "Get a real plan, not a list",
    body: "Ask anything naturally. Ohana builds an itinerary shaped around you — not a template with your name on it.",
  },
  {
    num: "03",
    title: "Travel with people who get it",
    body: "Find companions, local insiders, and guides who match your style. The trip, and the people.",
  },
]

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-15% 0px" })

  return (
    <section
      ref={ref}
      className="border-b border-[var(--color-line)] px-8 py-20 md:px-20"
    >
      <p className="mb-3 text-[11px] uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
        How it works
      </p>
      <h2
        className="mb-16"
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
        Three steps to a trip<br />that feels like you.
      </h2>

      <div className="relative grid gap-0 md:grid-cols-3">
        {/* Connecting hairline */}
        <motion.div
          className="absolute hidden md:block"
          style={{
            top: 36,
            left: "10%",
            right: "10%",
            height: 1,
            background: "var(--color-line)",
            transformOrigin: "left center",
          }}
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />

        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{
              delay: 0.15 + i * 0.12,
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="group border-t border-[var(--color-line)] pt-8 px-5 pb-2 first:pl-0 last:pr-0 md:border-t-0 md:pt-0"
          >
            <motion.div
              whileHover={{ rotate: -8, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              className="mb-6 cursor-default select-none"
              style={{
                fontFamily: "var(--font-serif)",
                fontVariationSettings: '"opsz" 72',
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "clamp(3.5rem, 6vw, 5rem)",
                lineHeight: 1,
                color: "var(--color-clay)",
                opacity: 0.65,
              }}
            >
              {step.num}
            </motion.div>
            <h3
              className="mb-3 text-[20px]"
              style={{
                fontFamily: "var(--font-serif)",
                fontVariationSettings: '"opsz" 40',
                fontWeight: 400,
                letterSpacing: "-0.01em",
                color: "var(--color-ink)",
              }}
            >
              {step.title}
            </h3>
            <p className="text-[14px] leading-[1.75]" style={{ color: "var(--color-muted)" }}>
              {step.body}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
