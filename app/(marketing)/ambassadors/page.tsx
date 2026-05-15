"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { motion, useInView, AnimatePresence } from "motion/react"
import { SiteFooter } from "../_components/SiteFooter"

// ---------------------------------------------------------------------------
// Shared motion helpers
// ---------------------------------------------------------------------------

const EASE_OUT = [0.22, 1, 0.36, 1] as const

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.55, ease: EASE_OUT },
  }
}

// ---------------------------------------------------------------------------
// 1. PageHero
// ---------------------------------------------------------------------------

function PageHero() {
  return (
    <section
      className="relative flex min-h-[70vh] flex-col justify-end overflow-hidden px-8 pb-20 md:px-20"
      style={{ borderBottom: "1px solid var(--color-line)" }}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/alentejo.jpg"
          alt="Rolling hills in Alentejo, Portugal"
          fill
          sizes="100vw"
          preload
          className="object-cover"
          style={{ filter: "saturate(0.82) brightness(0.9)" }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, oklch(0.22 0.02 60 / 0.86) 0%, oklch(0.22 0.02 60 / 0.45) 40%, oklch(0.22 0.02 60 / 0.1) 80%, transparent 100%)",
          }}
        />
        {/* Clay-soft tint layer */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 30% 80%, var(--color-clay-glow), transparent)",
          }}
        />
      </div>

      {/* Content */}
      <HeroContent />
    </section>
  )
}

function HeroContent() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-10% 0px" })

  return (
    <div ref={ref} className="relative max-w-3xl">
      {/* Badge */}
      <motion.div
        {...fadeUp(0)}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1"
        style={{
          borderColor: "rgba(255,255,255,0.2)",
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(8px)",
        }}
      >
        <span
          className="text-[11px] uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          · Ambassador Programme
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.12, duration: 0.6, ease: EASE_OUT }}
        style={{
          fontFamily: "var(--font-serif)",
          fontVariationSettings: '"opsz" 144',
          fontWeight: 400,
          fontSize: "clamp(2.5rem, 5vw, 4rem)",
          lineHeight: 1.05,
          letterSpacing: "-0.025em",
          color: "rgba(255,255,255,0.95)",
          marginBottom: "1.25rem",
        }}
      >
        Share the places{" "}
        <span style={{ fontStyle: "italic", color: "var(--color-clay)" }}>you</span> love.
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.24, duration: 0.55, ease: EASE_OUT }}
        className="mb-10 max-w-xl text-[16px] leading-relaxed"
        style={{ color: "rgba(255,255,255,0.6)" }}
      >
        The Ohana Ambassador Programme — for the travellers who were recommending the good stuff
        long before it was cool.
      </motion.p>

      {/* CTA */}
      <motion.a
        href="#apply"
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.36, duration: 0.55, ease: EASE_OUT }}
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.97 }}
        className="inline-flex items-center rounded-full px-7 py-3.5 text-[14px] font-medium text-white no-underline"
        style={{
          background: "var(--color-clay)",
          boxShadow: "0 2px 20px var(--color-clay-glow)",
          transition: "box-shadow 0.2s",
        }}
      >
        Apply now
      </motion.a>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 2. WhatIsAmbassador
// ---------------------------------------------------------------------------

const perks = [
  { num: "01", label: "Early access to every new feature" },
  { num: "02", label: "Free Ohana Premium — for life" },
  { num: "03", label: "Travel credit every time someone joins through you" },
]

function WhatIsAmbassador() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-15% 0px" })

  return (
    <section
      ref={ref}
      className="border-b border-[var(--color-line)] px-8 py-20 md:px-20"
      style={{ background: "var(--color-canvas)" }}
    >
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0, duration: 0.45, ease: EASE_OUT }}
        className="mb-3 text-[11px] uppercase tracking-widest"
        style={{ color: "var(--color-muted)" }}
      >
        What it means
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.1, duration: 0.55, ease: EASE_OUT }}
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
        Part advocate. Part insider.{" "}
        <span style={{ fontStyle: "italic" }}>All you.</span>
      </motion.h2>

      <div className="grid gap-12 md:grid-cols-2 md:gap-20">
        {/* Left: copy */}
        <div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.5, ease: EASE_OUT }}
            className="mb-5 text-[15px] leading-relaxed"
            style={{ color: "var(--color-muted)" }}
          >
            You already do it naturally — sending voice notes about that one restaurant, texting
            &ldquo;you have to go here&rdquo; before someone&apos;s trip. As an Ohana Ambassador, that instinct
            becomes something more. Your recommendations carry more weight, and you get the credit
            they deserve.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.5, ease: EASE_OUT }}
            className="text-[15px] leading-relaxed"
            style={{ color: "var(--color-muted)" }}
          >
            Ambassadors get early access to every feature before it ships, direct input into what
            we build next, and a community of real travellers — people who explore for the love of
            it, not the content.
          </motion.p>
        </div>

        {/* Right: perks list */}
        <div className="space-y-0">
          {perks.map((perk, i) => (
            <motion.div
              key={perk.num}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.12, duration: 0.5, ease: EASE_OUT }}
              className="flex items-start gap-6 border-b border-[var(--color-line)] py-6 last:border-0"
            >
              <motion.span
                whileHover={{ rotate: -8, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className="shrink-0 cursor-default select-none leading-none"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontVariationSettings: '"opsz" 72',
                  fontStyle: "italic",
                  fontWeight: 300,
                  fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
                  color: "var(--color-clay)",
                  opacity: 0.65,
                }}
              >
                {perk.num}
              </motion.span>
              <p
                className="pt-2 text-[17px] leading-snug"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontVariationSettings: '"opsz" 40',
                  fontWeight: 400,
                  letterSpacing: "-0.01em",
                  color: "var(--color-ink)",
                }}
              >
                {perk.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// 3. PerksGrid
// ---------------------------------------------------------------------------

const perksCards = [
  {
    id: "first",
    icon: "✦",
    title: "Be first.",
    body: "Early access to features two weeks before everyone else. Shape what Ohana becomes by living with it first.",
    bg: "var(--color-clay-soft)",
    dark: false,
  },
  {
    id: "travel",
    icon: "◎",
    title: "Travel free.",
    body: "Earn Ohana credit for every friend who joins through your link. Use it toward any trip, any time.",
    bg: "var(--color-ink)",
    dark: true,
  },
  {
    id: "product",
    icon: "◈",
    title: "Shape the product.",
    body: "Join direct calls with the Ohana team. Your travels, your feedback — that's our roadmap.",
    bg: "var(--color-sage-soft)",
    dark: false,
  },
]

function PerksGrid() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-15% 0px" })

  return (
    <section
      ref={ref}
      className="border-b border-[var(--color-line)] px-8 py-20 md:px-20"
    >
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0, duration: 0.45, ease: EASE_OUT }}
        className="mb-3 text-[11px] uppercase tracking-widest"
        style={{ color: "var(--color-muted)" }}
      >
        What you get
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.1, duration: 0.55, ease: EASE_OUT }}
        className="mb-12"
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
        The good stuff.
      </motion.h2>

      <div className="grid gap-3 md:grid-cols-3">
        {perksCards.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15 + i * 0.12, duration: 0.5, ease: EASE_OUT }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="rounded-2xl p-8"
            style={{
              background: card.bg,
              border: card.dark ? "none" : "1px solid var(--color-line)",
            }}
          >
            <div
              className="mb-5 text-2xl"
              style={{ color: card.dark ? "rgba(255,255,255,0.5)" : "var(--color-clay)" }}
            >
              {card.icon}
            </div>
            <h3
              className="mb-3"
              style={{
                fontFamily: "var(--font-serif)",
                fontVariationSettings: '"opsz" 40',
                fontWeight: 400,
                fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
                lineHeight: 1.25,
                letterSpacing: "-0.01em",
                color: card.dark ? "rgba(255,255,255,0.92)" : "var(--color-ink)",
              }}
            >
              {card.title}
            </h3>
            <p
              className="text-[14px] leading-relaxed"
              style={{ color: card.dark ? "rgba(255,255,255,0.45)" : "var(--color-muted)" }}
            >
              {card.body}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// 4. HowToJoin
// ---------------------------------------------------------------------------

const joinSteps = [
  {
    num: "01",
    title: "Apply",
    body: "Takes two minutes. Tell us a little about how you travel and why Ohana feels like yours.",
  },
  {
    num: "02",
    title: "Get your code",
    body: "We send you a referral code unique to you. No setup, no dashboard to learn — it just works.",
  },
  {
    num: "03",
    title: "Share and earn",
    body: "Share Ohana the way you already would. Every person who joins through you earns you credit. Indefinitely.",
  },
]

function HowToJoin() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-15% 0px" })

  return (
    <section
      ref={ref}
      className="border-b border-[var(--color-line)] px-8 py-20 md:px-20"
    >
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0, duration: 0.45, ease: EASE_OUT }}
        className="mb-3 text-[11px] uppercase tracking-widest"
        style={{ color: "var(--color-muted)" }}
      >
        How it works
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.1, duration: 0.55, ease: EASE_OUT }}
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
        Three steps to joining.
      </motion.h2>

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
          transition={{ delay: 0.3, duration: 0.9, ease: EASE_OUT }}
        />

        {joinSteps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{
              delay: 0.15 + i * 0.12,
              duration: 0.55,
              ease: EASE_OUT,
            }}
            className="group border-t border-[var(--color-line)] px-5 pb-2 pt-8 first:pl-0 last:pr-0 md:border-t-0 md:pt-0"
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

// ---------------------------------------------------------------------------
// 5. ApplicationForm
// ---------------------------------------------------------------------------

type FormState = "idle" | "loading" | "success"

function ApplicationForm() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-15% 0px" })

  const [state, setState] = useState<FormState>("idle")
  const [particles, setParticles] = useState<
    { id: number; tx: string; ty: string; r: string }[]
  >([])

  const [fields, setFields] = useState({
    firstName: "",
    email: "",
    travel: "",
    why: "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (state !== "idle") return
    setState("loading")
    await new Promise((r) => setTimeout(r, 800))
    setState("success")
    setParticles(
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        tx: `${(Math.random() - 0.5) * 100}px`,
        ty: `${-(Math.random() * 70 + 30)}px`,
        r: `${Math.random() * 360}deg`,
      }))
    )
    setTimeout(() => setParticles([]), 1000)
  }

  const inputBase: React.CSSProperties = {
    width: "100%",
    background: "white",
    border: "1px solid var(--color-line)",
    borderRadius: 12,
    padding: "12px 16px",
    fontSize: 14,
    color: "var(--color-ink)",
    outline: "none",
    fontFamily: "var(--font-sans)",
  }

  return (
    <section
      id="apply"
      ref={ref}
      className="border-b border-[var(--color-line)] px-8 py-20 md:px-20"
      style={{ background: "var(--color-canvas)" }}
    >
      <div className="mx-auto max-w-xl">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0, duration: 0.45, ease: EASE_OUT }}
          className="mb-3 text-[11px] uppercase tracking-widest"
          style={{ color: "var(--color-muted)" }}
        >
          Join the programme
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.55, ease: EASE_OUT }}
          className="mb-10"
          style={{
            fontFamily: "var(--font-serif)",
            fontVariationSettings: '"opsz" 72',
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(2rem, 4vw, 3rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
            color: "var(--color-ink)",
          }}
        >
          Apply to join.
        </motion.h2>

        <AnimatePresence mode="wait">
          {state === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="rounded-2xl border border-[var(--color-line)] bg-white px-10 py-14 text-center"
            >
              <div
                className="mb-4 text-3xl"
                style={{ color: "var(--color-clay)" }}
              >
                ✓
              </div>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontVariationSettings: '"opsz" 40',
                  fontWeight: 400,
                  fontSize: "1.4rem",
                  letterSpacing: "-0.01em",
                  color: "var(--color-ink)",
                }}
              >
                We&apos;ll be in touch soon.
              </p>
              <p
                className="mt-3 text-[14px] leading-relaxed"
                style={{ color: "var(--color-muted)" }}
              >
                Thanks for applying. Expect a message from us within a few days.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: EASE_OUT }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    className="mb-1.5 block text-[12px] uppercase tracking-widest"
                    style={{ color: "var(--color-muted)" }}
                  >
                    First name
                  </label>
                  <input
                    name="firstName"
                    type="text"
                    required
                    placeholder="Ada"
                    value={fields.firstName}
                    onChange={handleChange}
                    style={inputBase}
                  />
                </div>
                <div>
                  <label
                    className="mb-1.5 block text-[12px] uppercase tracking-widest"
                    style={{ color: "var(--color-muted)" }}
                  >
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="ada@example.com"
                    value={fields.email}
                    onChange={handleChange}
                    style={inputBase}
                  />
                </div>
              </div>

              <div>
                <label
                  className="mb-1.5 block text-[12px] uppercase tracking-widest"
                  style={{ color: "var(--color-muted)" }}
                >
                  Where do you travel most?
                </label>
                <input
                  name="travel"
                  type="text"
                  required
                  placeholder="Southern Europe, Southeast Asia, anywhere quiet…"
                  value={fields.travel}
                  onChange={handleChange}
                  style={inputBase}
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block text-[12px] uppercase tracking-widest"
                  style={{ color: "var(--color-muted)" }}
                >
                  Why do you want to be an Ohana ambassador?
                </label>
                <textarea
                  name="why"
                  rows={4}
                  required
                  placeholder="Tell us in your own words…"
                  value={fields.why}
                  onChange={handleChange}
                  style={{ ...inputBase, resize: "vertical" }}
                />
              </div>

              {/* Submit */}
              <div className="relative pt-2">
                <motion.button
                  type="submit"
                  disabled={state === "loading"}
                  whileHover={state === "idle" ? { scale: 1.03, y: -1 } : {}}
                  whileTap={state === "idle" ? { scale: 0.97 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="rounded-full px-8 py-3.5 text-[14px] font-medium text-white"
                  style={{
                    background: "var(--color-clay)",
                    boxShadow: "0 2px 16px var(--color-clay-glow)",
                    opacity: state === "loading" ? 0.7 : 1,
                    transition: "opacity 0.2s",
                  }}
                >
                  <AnimatePresence mode="wait">
                    {state === "loading" ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        Sending…
                      </motion.span>
                    ) : (
                      <motion.span
                        key="cta"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        Send my application
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Confetti */}
                {particles.map((p) => (
                  <span
                    key={p.id}
                    aria-hidden
                    className="pointer-events-none absolute left-16 top-1/2 h-2 w-2 rounded-full"
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
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AmbassadorsPage() {
  return (
    <>
      <PageHero />
      <WhatIsAmbassador />
      <PerksGrid />
      <HowToJoin />
      <ApplicationForm />
      <SiteFooter />
    </>
  )
}
