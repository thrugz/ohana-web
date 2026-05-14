"use client"

import { useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"

export function FinalCTA() {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [particles, setParticles] = useState<{ id: number; tx: string; ty: string; r: string }[]>([])
  const btnRef = useRef<HTMLButtonElement>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || state !== "idle") return
    setState("loading")
    await new Promise((r) => setTimeout(r, 700))
    setState("success")
    // Confetti burst
    setParticles(
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        tx: `${(Math.random() - 0.5) * 120}px`,
        ty: `${-(Math.random() * 80 + 30)}px`,
        r: `${Math.random() * 360}deg`,
      }))
    )
    setTimeout(() => setParticles([]), 1000)
  }

  return (
    <section
      id="signup"
      className="relative overflow-hidden px-8 py-28 text-center md:px-20"
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, var(--color-clay-glow), transparent)",
        }}
      />

      {/* Ghost brand text */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-8 right-0 select-none leading-none"
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontVariationSettings: '"opsz" 144',
          fontSize: "clamp(8rem, 18vw, 22rem)",
          color: "var(--color-clay)",
          opacity: 0.045,
          letterSpacing: "-0.04em",
        }}
      >
        Ohana
      </div>

      <div className="relative">
        <p className="mb-4 text-[11px] uppercase tracking-widest" style={{ color: "var(--color-clay)" }}>
          Join Ohana
        </p>

        <h2
          className="mb-5"
          style={{
            fontFamily: "var(--font-serif)",
            fontVariationSettings: '"opsz" 144',
            fontWeight: 400,
            fontStyle: "italic",
            fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: "var(--color-ink)",
          }}
        >
          Ready to go<br />somewhere good?
        </h2>

        <p className="mx-auto mb-10 max-w-sm text-[15px] leading-relaxed" style={{ color: "var(--color-muted)" }}>
          Free to join. No credit card. Your data stays yours — always.
        </p>

        <form
          onSubmit={submit}
          className="inline-flex overflow-hidden rounded-full border border-[var(--color-line)] bg-white shadow-[0_2px_24px_oklch(0.22_0.02_60_/_0.06)]"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-64 bg-transparent px-6 py-4 text-[14px] outline-none placeholder:text-[var(--color-muted)]"
            style={{ color: "var(--color-ink)" }}
          />

          <div className="relative m-[3px]">
            <motion.button
              ref={btnRef}
              type="submit"
              disabled={state !== "idle"}
              whileHover={state === "idle" ? { scale: 1.03 } : {}}
              whileTap={state === "idle" ? { scale: 0.97 } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="relative h-full rounded-full px-6 text-[13px] font-medium text-white"
              style={{
                background: state === "success" ? "var(--color-sage)" : "var(--color-clay)",
                minWidth: 120,
                boxShadow: "0 1px 12px var(--color-clay-glow)",
                transition: "background 0.3s",
              }}
            >
              <AnimatePresence mode="wait">
                {state === "success" ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    ✓ Joined
                  </motion.span>
                ) : state === "loading" ? (
                  <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    ...
                  </motion.span>
                ) : (
                  <motion.span key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    Get started
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Confetti particles */}
            {particles.map((p) => (
              <span
                key={p.id}
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
                style={{
                  background: "var(--color-clay)",
                  "--tx": p.tx,
                  "--ty": p.ty,
                  "--r": p.r,
                  animation: "confetti-fly 0.8s var(--ease-out) forwards",
                } as React.CSSProperties}
              />
            ))}
          </div>
        </form>

        <p className="mt-4 text-[12px]" style={{ color: "rgba(42,36,31,0.3)" }}>
          Already have an account?{" "}
          <a href="#" className="border-b border-current no-underline transition-opacity hover:opacity-70">
            Sign in
          </a>
        </p>
      </div>
    </section>
  )
}
