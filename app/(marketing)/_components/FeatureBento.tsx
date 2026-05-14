"use client"

import { useRef } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"

const tiles = [
  {
    id: "hero",
    tag: "Featured",
    title: "Experiences\nworth the detour.",
    body: "Cooking classes, local markets, rooftop sunsets — the things that make a trip yours, not anyone else's.",
    span: "md:col-span-2 md:row-span-2",
    bg: "var(--color-clay-soft)",
    accent: "var(--color-clay)",
    delay: 0,
    float: "4s",
  },
  {
    id: "neighborhoods",
    tag: "Discovery",
    title: "Neighborhoods,\nnot just landmarks.",
    body: "The streets between the sights. Where you'll actually want to spend your time.",
    span: "md:col-span-2",
    bg: "var(--color-surface)",
    accent: "var(--color-sage)",
    delay: 0.07,
    float: "5.5s",
  },
  {
    id: "companions",
    tag: "Community",
    title: "Companions\nwho get it.",
    body: "Find travelers who match your style — for the whole trip or just one evening.",
    span: "",
    bg: "var(--color-surface)",
    accent: "var(--color-clay)",
    delay: 0.14,
    float: "6s",
  },
  {
    id: "itinerary",
    tag: "Mobile",
    title: "Your itinerary,\nalways with you.",
    body: "Syncs across devices. Works where the signal doesn't.",
    span: "md:row-span-2",
    bg: "var(--color-ink)",
    accent: "rgba(255,255,255,0.6)",
    dark: true,
    delay: 0.21,
    float: "4.5s",
  },
  {
    id: "offline",
    tag: "Offline",
    title: "Works offline.",
    body: "",
    icon: "✈️",
    span: "",
    bg: "var(--color-sage)",
    accent: "white",
    dark: true,
    delay: 0.28,
    float: "7s",
  },
]

export function FeatureBento() {
  return (
    <section className="border-b border-[var(--color-line)] px-8 py-20 md:px-20">
      <div className="mb-10">
        <p className="mb-3 text-[11px] uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
          What Ohana does
        </p>
        <h2
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
          Built around you,<br />not around destinations.
        </h2>
      </div>

      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
        data-stagger
      >
        {tiles.map((tile) => (
          <BentoTile key={tile.id} tile={tile} />
        ))}
      </div>
    </section>
  )
}

function BentoTile({ tile }: { tile: (typeof tiles)[0] }) {
  const ref = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(50)
  const mouseY = useMotionValue(50)

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set(((e.clientX - rect.left) / rect.width) * 100)
    mouseY.set(((e.clientY - rect.top) / rect.height) * 100)
  }

  const gradX = useSpring(mouseX, { stiffness: 120, damping: 20 })
  const gradY = useSpring(mouseY, { stiffness: 120, damping: 20 })

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      data-reveal="pop"
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 380, damping: 20 }}
      className={`relative overflow-hidden rounded-[24px] p-8 ${tile.span}`}
      style={{
        background: tile.bg,
        border: tile.dark ? "none" : "1px solid var(--color-line)",
        animation: `tile-float ${tile.float} ease-in-out ${tile.delay * 1000}ms infinite`,
      }}
    >
      {/* Mouse-tracking spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${gradX.get()}% ${gradY.get()}%, ${tile.dark ? "rgba(255,255,255,0.07)" : "var(--color-clay-soft)"} 0%, transparent 55%)`,
        }}
      />

      <div
        className="mb-3 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest"
        style={{
          background: tile.dark ? "rgba(255,255,255,0.1)" : "var(--color-clay-soft)",
          color: tile.dark ? "rgba(255,255,255,0.55)" : "var(--color-clay)",
        }}
      >
        {tile.tag}
      </div>

      {tile.icon && <div className="mb-4 text-3xl">{tile.icon}</div>}

      <h3
        className="mb-2 whitespace-pre-line"
        style={{
          fontFamily: "var(--font-serif)",
          fontVariationSettings: '"opsz" 40',
          fontWeight: 400,
          fontSize: "clamp(1rem, 1.8vw, 1.25rem)",
          lineHeight: 1.3,
          letterSpacing: "-0.01em",
          color: tile.dark ? "rgba(255,255,255,0.9)" : "var(--color-ink)",
        }}
      >
        {tile.title}
      </h3>

      {tile.body && (
        <p
          className="mt-auto pt-3 text-[13px] leading-relaxed"
          style={{ color: tile.dark ? "rgba(255,255,255,0.45)" : "var(--color-muted)" }}
        >
          {tile.body}
        </p>
      )}
    </motion.div>
  )
}
