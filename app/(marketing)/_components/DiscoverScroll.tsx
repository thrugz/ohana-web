"use client"

import { useRef, useEffect } from "react"
import { motion } from "motion/react"
import Image from "next/image"

const NEIGHBORHOODS = [
  { name: "Alfama",         city: "Lisbon",       line: "Fado echoes and hilltop views at dusk.",               img: "/neighborhoods/alfama.jpg",        tilt:  1.5 },
  { name: "Shimokitazawa",  city: "Tokyo",        line: "Vintage shops and jazz bars, no tourists.",            img: "/neighborhoods/shimokitazawa.jpg", tilt: -2   },
  { name: "Roma Norte",     city: "Mexico City",  line: "Street murals, mezcal, all-day brunches.",             img: "/neighborhoods/roma-norte.jpg",    tilt:  1   },
  { name: "Croix-Rousse",   city: "Lyon",         line: "Silk weavers' quarter, the best bouchon in France.",   img: "/neighborhoods/croix-rousse.jpg",  tilt: -1.5 },
  { name: "Sacred Valley",  city: "Peru",         line: "Andean villages untouched by package tours.",          img: "/neighborhoods/sacred-valley.jpg", tilt:  2   },
  { name: "Yeonnam-dong",   city: "Seoul",        line: "Coffee, art, and the quiet Seoul locals love.",        img: "/neighborhoods/yeonnam-dong.jpg",  tilt: -1   },
  { name: "Pigneto",        city: "Rome",         line: "Old-school trattorie, street art, zero pretence.",     img: "/neighborhoods/pigneto.jpg",       tilt:  1.5 },
  { name: "Hauz Khas",      city: "Delhi",        line: "Ruins at sunset, rooftops, and bold colour.",          img: "/neighborhoods/hauz-khas.jpg",     tilt: -2   },
  { name: "Le Marais",      city: "Paris",        line: "Medieval lanes hiding the city's sharpest galleries.", img: "/neighborhoods/le-marais.jpg",     tilt:  1   },
  { name: "Williamsburg",   city: "New York",     line: "Waterfront sunsets and the best slice in the city.",   img: "/neighborhoods/williamsburg.jpg",  tilt: -1   },
  { name: "Fushimi",        city: "Kyoto",        line: "Torii gates, sake breweries, fewer crowds.",           img: "/neighborhoods/fushimi.jpg",       tilt:  2   },
  { name: "Paarel",         city: "Cape Town",    line: "Winelands and mountain light that stops you cold.",    img: "/neighborhoods/paarel.jpg",        tilt: -1.5 },
]

// Duplicate for seamless infinite loop
const TRACK = [...NEIGHBORHOODS, ...NEIGHBORHOODS]

const CARD_W  = 280
const CARD_GAP = 16
const SPEED   = 0.55 // px per frame

export function DiscoverScroll() {
  const trackRef  = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const isPaused   = useRef(false)
  const dragStart  = useRef({ x: 0, scrollLeft: 0 })
  const rafRef     = useRef<number>(0)

  // Auto-scroll loop
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const halfWidth = (CARD_W + CARD_GAP) * NEIGHBORHOODS.length

    const step = () => {
      if (!isPaused.current && !isDragging.current) {
        track.scrollLeft += SPEED
        if (track.scrollLeft >= halfWidth) {
          track.scrollLeft -= halfWidth
        }
      }
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const onMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return
    isDragging.current = true
    dragStart.current = { x: e.pageX, scrollLeft: trackRef.current.scrollLeft }
    trackRef.current.style.cursor = "grabbing"
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !trackRef.current) return
    trackRef.current.scrollLeft = dragStart.current.scrollLeft - (e.pageX - dragStart.current.x)
  }
  const onMouseUp = () => {
    isDragging.current = false
    if (trackRef.current) trackRef.current.style.cursor = "grab"
  }

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

      {/* pt-4 gives cards 16px headroom so y:-10 hover doesn't clip */}
      <div
        ref={trackRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={() => { isPaused.current = false; isDragging.current = false; if (trackRef.current) trackRef.current.style.cursor = "grab" }}
        onMouseEnter={() => { isPaused.current = true }}
        className="flex gap-4 overflow-x-scroll px-8 pb-4 pt-4 md:px-20 select-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", cursor: "grab" } as React.CSSProperties}
        data-cursor="drag"
      >
          {TRACK.map((n, i) => (
            <NeighborhoodCard key={`${n.name}-${i}`} neighborhood={n} />
          ))}
      </div>
    </section>
  )
}

function NeighborhoodCard({ neighborhood }: { neighborhood: (typeof NEIGHBORHOODS)[0] }) {
  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 320, damping: 20 }}
      className="relative overflow-hidden rounded-2xl flex-shrink-0"
      style={{ width: CARD_W, height: 380 }}
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
  )
}
