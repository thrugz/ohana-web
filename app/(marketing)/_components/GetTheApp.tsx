"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"
import { QRCodeSVG } from "qrcode.react"

const STORE_BUTTONS = [
  {
    label: "App Store",
    sub: "Download on the",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
  },
  {
    label: "Google Play",
    sub: "Get it on",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0">
        <path d="M3.18 23.76c.35.2.74.24 1.12.12l.07-.04L13.64 12 4.37.16l-.07-.04A1.49 1.49 0 003.18.24C2.76.49 2.5.96 2.5 1.56v20.88c0 .6.26 1.07.68 1.32zM16.54 8.85l2.1-1.21L16.1 5.5l-2.24 2.24 2.68 1.11zM4.37.16l11.25 11.25-2.61 2.61L4.37.16zM16.1 18.5l2.54-2.14-2.1-1.22-2.68 1.11L16.1 18.5zM4.37 23.84l8.62-11.59-2.61-2.61L4.37 23.84z" />
      </svg>
    ),
  },
]

export function GetTheApp() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-15% 0px" })

  return (
    <section
      ref={ref}
      className="border-b border-[var(--color-line)] px-8 py-20 md:px-20"
    >
      <div className="mx-auto grid max-w-5xl items-center gap-16 md:grid-cols-2">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-4 text-[11px] uppercase tracking-widest" style={{ color: "var(--color-clay)" }}>
            In your pocket
          </p>
          <h2
            className="mb-5"
            style={{
              fontFamily: "var(--font-serif)",
              fontVariationSettings: '"opsz" 72',
              fontWeight: 400,
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              color: "var(--color-ink)",
            }}
          >
            Travel smarter.<br />
            <em style={{ fontStyle: "italic", color: "var(--color-clay)" }}>Anywhere.</em>
          </h2>
          <p className="mb-10 text-[15px] leading-relaxed" style={{ color: "var(--color-muted)", maxWidth: 400 }}>
            iOS and Android. Works offline. Syncs seamlessly. Always knows where you are — and where you should be.
          </p>

          {/* Store buttons */}
          <div className="flex flex-wrap gap-3">
            {STORE_BUTTONS.map((btn) => (
              <motion.a
                key={btn.label}
                href="#signup"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="flex items-center gap-3 rounded-2xl px-5 py-3.5 no-underline"
                style={{
                  background: "var(--color-ink)",
                  color: "white",
                  boxShadow: "0 2px 16px oklch(0.22 0.02 60 / 0.16)",
                }}
              >
                {btn.icon}
                <div>
                  <p className="text-[9px] leading-none opacity-60">{btn.sub}</p>
                  <p className="mt-0.5 text-[14px] font-medium leading-none">{btn.label}</p>
                </div>
              </motion.a>
            ))}
          </div>

          <p className="mt-5 text-[12px]" style={{ color: "var(--color-muted)" }}>
            Currently in beta · iOS 16+ · Android 12+
          </p>
        </motion.div>

        {/* Right — QR + phone mockup */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-8"
        >
          {/* Phone mockup */}
          <div
            className="relative mx-auto w-48 rounded-[32px] p-2 shadow-2xl"
            style={{
              background: "var(--color-ink)",
              boxShadow: "0 32px 64px oklch(0.22 0.02 60 / 0.28), 0 0 0 1px oklch(0.35 0.02 60)",
            }}
          >
            {/* Notch */}
            <div className="mx-auto mb-1 h-1.5 w-12 rounded-full" style={{ background: "oklch(0.32 0.01 60)" }} />
            {/* Screen */}
            <div
              className="overflow-hidden rounded-[24px]"
              style={{ background: "var(--color-canvas)", minHeight: 280 }}
            >
              {/* Fake status bar */}
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <span className="text-[8px]" style={{ color: "var(--color-muted)" }}>9:41</span>
                <div className="flex gap-1">
                  {[3, 2, 1].map((i) => (
                    <div key={i} className="rounded-sm" style={{ width: 3, height: 3 + i * 2, background: "var(--color-muted)", opacity: 0.5 }} />
                  ))}
                </div>
              </div>
              {/* App content sketch */}
              <div className="px-4 pt-2">
                <p className="mb-3 text-[9px] font-medium" style={{ color: "var(--color-muted)" }}>Good morning, Maya ☀️</p>
                <p className="mb-3 text-[13px] leading-tight" style={{ fontFamily: "var(--font-serif)", fontVariationSettings: '"opsz" 40', color: "var(--color-ink)" }}>
                  Your Lisbon trip<br />starts in 4 days.
                </p>
                {/* Mini cards */}
                {["Alfama walk, 9am", "Pottery class, 2pm", "Fado night, 8pm"].map((item, i) => (
                  <div key={item} className="mb-1.5 flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: i === 0 ? "var(--color-clay-soft)" : "white", border: "1px solid var(--color-line)" }}>
                    <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: i === 0 ? "var(--color-clay)" : "var(--color-muted)", opacity: i === 0 ? 1 : 0.4 }} />
                    <p className="text-[9px]" style={{ color: i === 0 ? "var(--color-clay)" : "var(--color-muted)" }}>{item}</p>
                  </div>
                ))}
                <div className="mt-3 rounded-xl p-3" style={{ background: "var(--color-ink)" }}>
                  <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.5)" }}>Companion match</p>
                  <p className="text-[10px] font-medium" style={{ color: "white" }}>Scott is also in Lisbon ✦</p>
                </div>
              </div>
            </div>
          </div>

          {/* QR code */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="rounded-2xl p-3"
              style={{ background: "white", border: "1px solid var(--color-line)", boxShadow: "0 2px 12px oklch(0.22 0.02 60 / 0.06)" }}
            >
              <QRCodeSVG
                value="https://ohana.place/beta"
                size={96}
                fgColor="oklch(0.22 0.02 60)"
                bgColor="white"
                level="M"
              />
            </div>
            <p className="text-center text-[12px]" style={{ color: "var(--color-muted)" }}>
              Scan to join the beta
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
