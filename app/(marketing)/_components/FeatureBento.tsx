"use client"

import { useRef } from "react"
import { motion, useMotionValue, useSpring } from "motion/react"
import { TossReveal } from "@/components/TossReveal"

const tiles = [
  {
    id: "hero",
    tag: "Featured",
    title: "Experiences\nworth the detour.",
    body: "Cooking classes, local markets, rooftop sunsets — the things that make a trip yours, not anyone else's.",
    span: "md:col-span-2 md:row-span-2",
    bg: "var(--color-clay-soft)",
    dark: false,
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
    dark: false,
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
    dark: false,
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
    dark: true,
    delay: 0.21,
    float: "4.5s",
  },
  {
    id: "offline",
    tag: "Offline",
    title: "Works offline.",
    body: "",
    span: "",
    bg: "var(--color-sage)",
    dark: true,
    delay: 0.28,
    float: "7s",
  },
]

/* ── Per-tile illustrations ─────────────────────────────── */

function ExperienceCard() {
  return (
    <div
      className="absolute bottom-6 right-6 w-44 rounded-xl shadow-lg overflow-hidden"
      style={{ background: "white", border: "1px solid oklch(0.92 0.01 80)" }}
    >
      <div
        className="h-16 w-full"
        style={{
          background: "linear-gradient(135deg, oklch(0.62 0.14 45 / 0.18) 0%, oklch(0.74 0.04 145 / 0.22) 100%)",
        }}
      >
        <div className="flex h-full items-end px-3 pb-2">
          <span
            className="rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider"
            style={{ background: "var(--color-clay)", color: "white" }}
          >
            Local pick
          </span>
        </div>
      </div>
      <div className="p-3">
        <p className="mb-1 text-[11px] font-medium leading-tight" style={{ color: "var(--color-ink)" }}>
          Pottery class in Alfama
        </p>
        <div className="flex items-center gap-2 text-[9px]" style={{ color: "var(--color-muted)" }}>
          <span>⏱ 2.5h</span>
          <span>·</span>
          <span>€35</span>
          <span>·</span>
          <span style={{ color: "var(--color-clay)" }}>★ 4.9</span>
        </div>
      </div>
    </div>
  )
}

function NeighborhoodPins() {
  const pins = [
    { name: "Alfama", x: "18%", y: "38%" },
    { name: "Príncipe Real", x: "48%", y: "52%" },
    { name: "LX Factory", x: "72%", y: "34%" },
  ]
  return (
    <div className="absolute inset-0 overflow-hidden opacity-60">
      {/* Grid lines */}
      <svg className="absolute inset-0 h-full w-full" style={{ opacity: 0.12 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={`h${i}`} x1="0" y1={`${20 + i * 20}%`} x2="100%" y2={`${20 + i * 20}%`}
            stroke="var(--color-clay)" strokeWidth="0.5" />
        ))}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={`v${i}`} x1={`${15 + i * 15}%`} y1="0" x2={`${15 + i * 15}%`} y2="100%"
            stroke="var(--color-clay)" strokeWidth="0.5" />
        ))}
      </svg>
      {pins.map((pin) => (
        <div key={pin.name} className="absolute flex items-center gap-1.5" style={{ left: pin.x, top: pin.y }}>
          <div className="relative">
            <div className="h-2 w-2 rounded-full" style={{ background: "var(--color-clay)" }} />
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: "var(--color-clay)", animation: "tile-float 2s ease-in-out infinite", opacity: 0.4, transform: "scale(2)" }}
            />
          </div>
          <span
            className="rounded-full px-2 py-0.5 text-[9px] font-medium shadow-sm"
            style={{ background: "white", color: "var(--color-ink)", border: "1px solid oklch(0.92 0.01 80)" }}
          >
            {pin.name}
          </span>
        </div>
      ))}
    </div>
  )
}

function CompanionAvatars() {
  const companions = [
    { initials: "MY", color: "oklch(0.82 0.08 45)", label: "Maya · Berlin" },
    { initials: "SC", color: "oklch(0.74 0.04 145)", label: "Scott · Toronto" },
    { initials: "YV", color: "oklch(0.78 0.06 280)", label: "Yesenia · CDMX" },
  ]
  return (
    <div className="absolute bottom-6 right-6 flex flex-col items-end gap-2">
      <div className="flex -space-x-2">
        {companions.map((c) => (
          <div
            key={c.initials}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] font-semibold text-white"
            style={{ background: c.color, borderColor: "var(--color-surface)" }}
          >
            {c.initials}
          </div>
        ))}
      </div>
      <div
        className="rounded-full px-3 py-1 text-[10px] font-medium"
        style={{ background: "var(--color-clay-soft)", color: "var(--color-clay)" }}
      >
        3 matches nearby
      </div>
    </div>
  )
}

function ItineraryList() {
  const days = [
    {
      label: "Day 1",
      items: ["Alfama morning walk", "Pastéis de Belém", "Fado show, 9pm"],
    },
    {
      label: "Day 2",
      items: ["Príncipe Real market", "LX Factory afternoon"],
    },
  ]
  return (
    <div className="absolute bottom-6 left-6 right-6 rounded-xl p-4" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
      {days.map((day, di) => (
        <div key={day.label} className={di > 0 ? "mt-3 border-t pt-3" : ""} style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
            {day.label}
          </p>
          <div className="space-y-1">
            {day.items.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full shrink-0" style={{ background: "var(--color-clay)" }} />
                <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.65)" }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function OfflineBadge() {
  return (
    <div className="absolute bottom-6 right-6 flex flex-col items-end gap-2">
      <div className="text-3xl">✈️</div>
      <div
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-medium"
        style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
        Downloaded
      </div>
    </div>
  )
}

function TileIllustration({ id }: { id: string }) {
  if (id === "hero") return <ExperienceCard />
  if (id === "neighborhoods") return <NeighborhoodPins />
  if (id === "companions") return <CompanionAvatars />
  if (id === "itinerary") return <ItineraryList />
  if (id === "offline") return <OfflineBadge />
  return null
}

/* ── Spotlight ──────────────────────────────────────────── */

function BentoTile({ tile }: { tile: (typeof tiles)[0] }) {
  const ref = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(50)
  const mouseY = useMotionValue(50)

  const springX = useSpring(mouseX, { stiffness: 120, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 120, damping: 20 })

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set(((e.clientX - rect.left) / rect.width) * 100)
    mouseY.set(((e.clientY - rect.top) / rect.height) * 100)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 380, damping: 20 }}
      className="relative overflow-hidden rounded-[24px] p-8 h-full"
      style={{
        background: tile.bg,
        border: tile.dark ? "none" : "1px solid var(--color-line)",
        minHeight: tile.id === "hero" ? 340 : tile.id === "itinerary" ? 300 : 200,
        animation: `tile-float ${tile.float} ease-in-out ${tile.delay * 1000}ms infinite`,
      }}
    >
      {/* Mouse-tracking spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${springX.get()}% ${springY.get()}%, ${tile.dark ? "rgba(255,255,255,0.06)" : "oklch(0.97 0.012 80 / 0.8)"} 0%, transparent 60%)`,
        }}
      />

      {/* Tag */}
      <div
        className="mb-3 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest"
        style={{
          background: tile.dark ? "rgba(255,255,255,0.1)" : "var(--color-clay-soft)",
          color: tile.dark ? "rgba(255,255,255,0.55)" : "var(--color-clay)",
        }}
      >
        {tile.tag}
      </div>

      {/* Title */}
      <h3
        className="whitespace-pre-line"
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

      {/* Body — shown only on hero tile to avoid overlap with illustrations */}
      {tile.body && tile.id === "hero" && (
        <p className="mt-3 text-[13px] leading-relaxed" style={{ color: "var(--color-muted)" }}>
          {tile.body}
        </p>
      )}

      {/* Illustration */}
      <TileIllustration id={tile.id} />
    </motion.div>
  )
}

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

      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {tiles.map((tile, index) => (
          <TossReveal key={tile.id} className={tile.span} delay={index * 0.06}>
            <BentoTile tile={tile} />
          </TossReveal>
        ))}
      </div>
    </section>
  )
}
