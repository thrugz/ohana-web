"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "motion/react"
import { TossReveal } from "@/components/TossReveal"
import Image from "next/image"

const NEIGHBORHOODS = [
  { name: "Alfama", city: "Lisbon", line: "Fado echoes and hilltop views at dusk.", img: "/alentejo.jpg", tilt: 1.5 },
  { name: "Shimokitazawa", city: "Tokyo", line: "Vintage shops and jazz bars, no tourists.", img: "/kyoto.jpg", tilt: -2 },
  { name: "Roma Norte", city: "Mexico City", line: "Street murals, mezcal, all-day brunches.", img: "/marrakech.jpg", tilt: 1 },
  { name: "Croix-Rousse", city: "Lyon", line: "Silk weavers' quarter, the best bouchon in France.", img: "/bali.jpg", tilt: -1.5 },
  { name: "Sacred Valley", city: "Peru", line: "Andean villages untouched by package tours.", img: "/sacred-valley.jpg", tilt: 2 },
  { name: "Yeonnam-dong", city: "Seoul", line: "Coffee, art, and the quiet Seoul locals love.", img: "/alentejo.jpg", tilt: -1 },
]

export function DiscoverScroll() {
  const trackRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, scrollLeft: 0 })

  const onMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return
    isDragging.current = true
    dragStart.current = { x: e.pageX, scrollLeft: trackRef.current.scrollLeft }
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !trackRef.current) return
    const dx = e.pageX - dragStart.current.x
    trackRef.current.scrollLeft = dragStart.current.scrollLeft - dx
  }

  const onMouseUp = () => { isDragging.current = false }

  return (
    <section className="border-b border-[var(--color-line)] py-20">
      <div className="mb-10 px-8 md:px-20">
        <p className="mb-3 text-[11px] uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
          Explore
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
          The neighborhoods<br />worth the detour.
        </h2>
      </div>

      <div
        ref={trackRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        className="flex gap-4 overflow-x-auto px-8 pb-4 md:px-20 select-none"
        style={{
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          cursor: "grab",
        }}
        data-cursor="drag"
      >
        {NEIGHBORHOODS.map((n, i) => (
          <NeighborhoodCard key={n.name} neighborhood={n} index={i} />
        ))}
      </div>
    </section>
  )
}

function NeighborhoodCard({
  neighborhood,
  index,
}: {
  neighborhood: (typeof NEIGHBORHOODS)[0]
  index: number
}) {
  return (
    <TossReveal
      delay={index * 0.07}
      style={{ width: 280, height: 380, flexShrink: 0, scrollSnapAlign: "start" }}
    >
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        "--tilt": `${neighborhood.tilt}deg`,
        width: "100%",
        height: "100%",
        position: "relative",
      } as React.CSSProperties}
      data-cursor="photo"
    >
      <Image
        src={neighborhood.img}
        alt={`${neighborhood.name}, ${neighborhood.city}`}
        fill
        sizes="280px"
        className="object-cover"
        style={{ filter: "saturate(0.85) brightness(0.92)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top, rgba(42,36,31,0.82) 0%, rgba(42,36,31,0.2) 50%, transparent 80%)",
        }}
      />
      <div className="absolute bottom-0 left-0 p-5">
        <p className="text-[11px] uppercase tracking-widest text-white/50 mb-1">{neighborhood.city}</p>
        <h3
          className="mb-1.5 text-white"
          style={{
            fontFamily: "var(--font-serif)",
            fontVariationSettings: '"opsz" 40',
            fontWeight: 400,
            fontSize: "1.2rem",
            lineHeight: 1.2,
          }}
        >
          {neighborhood.name}
        </h3>
        <p className="text-[12px] leading-relaxed text-white/60">{neighborhood.line}</p>
      </div>
    </motion.div>
    </TossReveal>
  )
}
