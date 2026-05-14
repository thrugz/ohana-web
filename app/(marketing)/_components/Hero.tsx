"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"

const words = ["Your kind of place".split(" "), ["found", "for", "you,"], ["not", "sold", "to", "you."]]

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springX = useSpring(mouseX, { stiffness: 40, damping: 25 })
  const springY = useSpring(mouseY, { stiffness: 40, damping: 25 })
  const photoX = useTransform(springX, [-0.5, 0.5], ["-1.5%", "1.5%"])
  const photoY = useTransform(springY, [-0.5, 0.5], ["-1.5%", "1.5%"])

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  return (
    <section
      ref={containerRef}
      onMouseMove={onMouseMove}
      className="relative flex h-screen min-h-[600px] flex-col justify-end overflow-hidden pb-20 pl-12 pr-12 md:pl-20"
      data-cursor="dark"
    >
      {/* Photo with parallax */}
      <motion.div
        className="absolute inset-0 scale-[1.04]"
        style={{ x: photoX, y: photoY }}
        data-cursor="photo"
      >
        <Image
          src="/bali.jpg"
          alt="A warm neighborhood street in Bali, Indonesia"
          fill
          sizes="100vw"
          preload
          className="object-cover"
          style={{ filter: "saturate(0.85) brightness(0.96)" }}
        />
      </motion.div>

      {/* Gradient overlays */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(to top, oklch(0.22 0.02 60 / 0.88) 0%, oklch(0.22 0.02 60 / 0.5) 30%, oklch(0.22 0.02 60 / 0.12) 70%, transparent 100%),
            linear-gradient(to right, oklch(0.22 0.02 60 / 0.48) 0%, transparent 55%)
          `,
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-2xl">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] tracking-widest text-white/80 uppercase backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-clay)] animate-[cursor-blink_2s_ease-in-out_infinite]" />
          Travel companion · in beta
        </motion.div>

        {/* Headline — word-by-word stagger */}
        <h1
          className="mb-5 text-white"
          style={{
            fontFamily: "var(--font-serif)",
            fontVariationSettings: '"opsz" 144',
            fontWeight: 400,
            fontSize: "clamp(2.8rem, 6vw, 5.2rem)",
            lineHeight: 1.04,
            letterSpacing: "-0.025em",
          }}
        >
          {words.map((line, li) => (
            <span key={li} className="block">
              {line.map((word, wi) => (
                <motion.span
                  key={wi}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.45 + (li * line.length + wi) * 0.08,
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="inline-block mr-[0.25em]"
                  style={li === 0 && wi > 2 ? { fontStyle: "italic", color: "#F2D4C3" } : {}}
                >
                  {li === 0 && wi === 0 ? <em style={{ fontStyle: "italic", color: "#F2D4C3" }}>{word}</em> : word}
                </motion.span>
              ))}
            </span>
          ))}
        </h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-9 max-w-[440px] text-[16px] leading-relaxed text-white/65"
        >
          Ohana finds the neighborhoods, experiences, and people that match how you actually want to travel.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 flex items-center gap-4"
        >
          <MagneticButton href="#signup" primary>
            Plan with Ohana
          </MagneticButton>
          <button className="flex items-center gap-2.5 text-[14px] text-white/65 transition-colors hover:text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/12 text-[11px] backdrop-blur-sm">
              ▶
            </span>
            Watch the 60-sec demo
          </button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.55, duration: 0.5 }}
          className="flex items-center gap-3 text-[13px] text-white/50"
        >
          <div className="flex">
            {["🌿", "✈️", "☀️"].map((e, i) => (
              <span
                key={i}
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 text-sm -ml-2 first:ml-0"
              >
                {e}
              </span>
            ))}
          </div>
          Joined by 12,400 travelers this month
        </motion.div>
      </div>

      {/* Destination label */}
      <div className="absolute bottom-7 right-12 z-10 text-[11px] tracking-[0.2em] text-white/30 uppercase">
        Bali, Indonesia
      </div>
    </section>
  )
}

function MagneticButton({
  children,
  href,
  primary,
}: {
  children: React.ReactNode
  href?: string
  primary?: boolean
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 20 })
  const springY = useSpring(y, { stiffness: 300, damping: 20 })

  const onMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dist = Math.sqrt((e.clientX - cx) ** 2 + (e.clientY - cy) ** 2)
    if (dist < 70) {
      x.set((e.clientX - cx) * 0.32)
      y.set((e.clientY - cy) * 0.32)
    }
  }

  const onMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      whileTap={{ scale: 0.96 }}
      className="inline-block rounded-full px-7 py-3.5 text-[15px] font-medium text-white no-underline"
      style={{
        x: springX,
        y: springY,
        background: "var(--color-clay)",
        boxShadow: "0 2px 20px var(--color-clay-glow)",
        animation: "clay-pulse 3s ease-in-out infinite",
      }}
    >
      {children}
    </motion.a>
  )
}
