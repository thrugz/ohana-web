"use client"

import { motion } from "motion/react"
import Link from "next/link"

const DESTINATIONS = ["Alfama", "Shimokitazawa", "Sacred Valley", "Croix-Rousse", "Yeonnam-dong"]

export default function NotFound() {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-8 text-center"
      style={{ background: "var(--color-canvas)" }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 55%, var(--color-clay-glow), transparent)",
        }}
      />

      {/* Ghost 404 */}
      <div
        aria-hidden
        className="pointer-events-none absolute select-none leading-none"
        style={{
          fontFamily: "var(--font-serif)",
          fontVariationSettings: '"opsz" 144',
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(14rem, 35vw, 32rem)",
          color: "var(--color-clay)",
          opacity: 0.055,
          letterSpacing: "-0.04em",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          whiteSpace: "nowrap",
        }}
      >
        404
      </div>

      <div className="relative z-10 max-w-md">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-5 text-[11px] uppercase tracking-widest"
          style={{ color: "var(--color-clay)" }}
        >
          Lost somewhere beautiful
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-5"
          style={{
            fontFamily: "var(--font-serif)",
            fontVariationSettings: '"opsz" 144',
            fontWeight: 400,
            fontStyle: "italic",
            fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            color: "var(--color-ink)",
          }}
        >
          This page doesn't<br />exist. Yet.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 text-[15px] leading-relaxed"
          style={{ color: "var(--color-muted)" }}
        >
          Maybe you took a wrong turn. Maybe you found a shortcut to somewhere better.
          Either way — Ohana knows how to handle the unexpected.
        </motion.p>

        {/* Destination suggestions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-10 flex flex-wrap justify-center gap-2"
        >
          {DESTINATIONS.map((d, i) => (
            <motion.span
              key={d}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.45 + i * 0.07,
                duration: 0.4,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className="rounded-full border px-3.5 py-1.5 text-[12px]"
              style={{
                borderColor: "var(--color-line)",
                color: "var(--color-muted)",
                background: "var(--color-surface)",
              }}
            >
              {d}
            </motion.span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <Link
            href="/"
            className="rounded-full px-7 py-3.5 text-[15px] font-medium text-white no-underline"
            style={{
              background: "var(--color-clay)",
              boxShadow: "0 2px 20px var(--color-clay-glow)",
            }}
          >
            Take me home
          </Link>
          <Link
            href="/about"
            className="text-[14px] no-underline transition-opacity hover:opacity-70"
            style={{ color: "var(--color-muted)" }}
          >
            Learn about Ohana →
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
