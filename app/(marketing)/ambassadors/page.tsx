"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { motion, useInView, AnimatePresence } from "motion/react"
import { SiteFooter } from "../_components/SiteFooter"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

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
        When your knowledge of a place helps a traveller plan their trip, you get paid. When they
        sign up because of you, you get paid. And for Anchor partners, we put a floor under all
        of it — guaranteed, in writing.
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
  { num: "01", label: "Earn every time your POI appears in a paid itinerary" },
  { num: "02", label: "€5–8 referral commission on every new subscriber you bring in" },
  { num: "03", label: "€750 minimum guaranteed — for Anchor Ambassadors, every year" },
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
        Your knowledge builds itineraries.{" "}
        <span style={{ fontStyle: "italic" }}>You earn from every trip.</span>
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
            You&apos;ve spent years finding the good stuff — the restaurant nobody writes about,
            the trail that rewards the people who show up. As an Ohana Ambassador, your POIs
            become the engine behind personalised itineraries for paying members. Every time
            we use your content, you earn.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.5, ease: EASE_OUT }}
            className="text-[15px] leading-relaxed"
            style={{ color: "var(--color-muted)" }}
          >
            No exclusivity. No content quotas. Your IP stays yours — we just put it to work
            for travellers who actually want it.
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
    id: "poi",
    icon: "✦",
    title: "POI usage revenue.",
    body: "20% of every paid itinerary is set aside as a Creator Pool — split across the POIs used in that trip. A €49 Tour Plan generates €9.45 in creator earnings. Your share scales with your contribution.",
    bg: "var(--color-clay-soft)",
    dark: false,
  },
  {
    id: "referral",
    icon: "◎",
    title: "Referral commissions.",
    body: "€5 on every Tour Plan, €8 on every Aloha Pass annual subscription your audience brings in. Paid monthly after the refund window. Stacks on top of your POI revenue.",
    bg: "var(--color-ink)",
    dark: true,
  },
  {
    id: "guarantee",
    icon: "◈",
    title: "€750 Anchor guarantee.",
    body: "Publish 200+ POIs within 90 days and we guarantee €750 in your first year. If your earnings fall short, we cover the gap. No clawbacks if you earn more.",
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
    body: "Two minutes. Tell us where you travel and what kind of POIs you have. We review every application personally.",
  },
  {
    num: "02",
    title: "Upload your POIs",
    body: "We onboard you to the creator portal. Import from Rexby or upload directly. Your content, your call on what goes in.",
  },
  {
    num: "03",
    title: "Earn from every trip",
    body: "Each time your POI appears in a paid itinerary, you get a cut. No minimums. No quotas. Monthly payouts via Mollie.",
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
// 5. EarningsTable
// ---------------------------------------------------------------------------

function EarningsTable() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-15% 0px" })

  const rows = [
    { label: "Your POIs used in 200 Tour Plans", amount: "€486" },
    { label: "Your POIs used in 30 annual subscriber itineraries", amount: "€39" },
    { label: "40 Tour Plan referrals from your audience", amount: "€200" },
    { label: "20 Aloha Pass referrals from your audience", amount: "€160" },
  ]

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
        What this looks like in practice
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.1, duration: 0.55, ease: EASE_OUT }}
        className="mb-4"
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
        A real number, not a best case.
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.18, duration: 0.45, ease: EASE_OUT }}
        className="mb-12 max-w-xl text-[15px] leading-relaxed"
        style={{ color: "var(--color-muted)" }}
      >
        A Portugal Anchor with 514 POIs, at a walk pace — not an optimistic scenario.
        In a slower launch, the guarantee covers you to €750. In a stronger year, the upside is uncapped.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.25, duration: 0.5, ease: EASE_OUT }}
        className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-[var(--color-line)]"
        style={{ background: "white" }}
      >
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b border-[var(--color-line)] px-6 py-4 last:border-0"
          >
            <span className="text-[14px] leading-snug" style={{ color: "var(--color-muted)" }}>
              {row.label}
            </span>
            <span
              className="ml-6 shrink-0 text-[15px]"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 400, color: "var(--color-ink)" }}
            >
              {row.amount}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between px-6 py-5" style={{ background: "var(--color-clay-soft)" }}>
          <span
            className="text-[15px]"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 400, color: "var(--color-ink)" }}
          >
            Year 1 total
          </span>
          <span
            className="text-[22px]"
            style={{
              fontFamily: "var(--font-serif)",
              fontVariationSettings: '"opsz" 40',
              fontWeight: 400,
              color: "var(--color-clay)",
            }}
          >
            €885
          </span>
        </div>
      </motion.div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// 6. Principles
// ---------------------------------------------------------------------------

function Principles() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-15% 0px" })

  const dontAsk = [
    "No exclusivity. Keep publishing on Rexby, your blog, Instagram, wherever you already are.",
    "No quotas. 200 POIs gets you Anchor status. We don't ask for more.",
    "No mandated promotion. Sharing Ohana is your choice — it just happens to pay well when you do.",
  ]

  const doAsk = [
    "Authentic POIs. The places you'd actually send a friend.",
    "Honest descriptions. We're building trust, not SEO.",
    "A 3-month pilot. Either of us can walk at the end with no questions.",
  ]

  return (
    <section
      ref={ref}
      className="border-b border-[var(--color-line)] px-8 py-20 md:px-20"
    >
      <div className="grid gap-16 md:grid-cols-2 md:gap-20">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0, duration: 0.45, ease: EASE_OUT }}
            className="mb-3 text-[11px] uppercase tracking-widest"
            style={{ color: "var(--color-muted)" }}
          >
            What we don&apos;t ask
          </motion.p>
          <ul className="space-y-4">
            {dontAsk.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 + i * 0.1, duration: 0.45, ease: EASE_OUT }}
                className="flex items-start gap-3 text-[15px] leading-relaxed"
                style={{ color: "var(--color-muted)" }}
              >
                <span style={{ color: "var(--color-clay)", marginTop: 3 }}>—</span>
                {item}
              </motion.li>
            ))}
          </ul>
        </div>

        <div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.45, ease: EASE_OUT }}
            className="mb-3 text-[11px] uppercase tracking-widest"
            style={{ color: "var(--color-muted)" }}
          >
            What we ask
          </motion.p>
          <ul className="space-y-4">
            {doAsk.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.45, ease: EASE_OUT }}
                className="flex items-start gap-3 text-[15px] leading-relaxed"
                style={{ color: "var(--color-muted)" }}
              >
                <span style={{ color: "var(--color-clay)", marginTop: 3 }}>—</span>
                {item}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      {/* IP note */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.45, duration: 0.5, ease: EASE_OUT }}
        className="mt-16 rounded-2xl border border-[var(--color-line)] px-8 py-6"
        style={{ background: "var(--color-canvas)" }}
      >
        <p className="mb-1 text-[11px] uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
          Your content stays yours
        </p>
        <p className="text-[15px] leading-relaxed" style={{ color: "var(--color-ink)" }}>
          You keep full ownership of everything you upload. We get a perpetual licence to use
          your POIs inside Ohana — and we promise never to sublicense your content to anyone else
          without your written consent. Remove your POIs anytime; we honour it within 30 days.
        </p>
      </motion.div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// 7. PaymentSchedule
// ---------------------------------------------------------------------------

const paymentRows = [
  { stream: "POI usage", timing: "Monthly", note: "Direct to your bank via Mollie" },
  { stream: "Referral commissions", timing: "Monthly, after refund window", note: "14 days Tour Plan · 30 days annual" },
  { stream: "Anchor guarantee top-up", timing: "Year-end", note: "If total falls below €750" },
]

function PaymentSchedule() {
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
        When you get paid
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.1, duration: 0.55, ease: EASE_OUT }}
        className="mb-10"
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
        Monthly payouts. No waiting.
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.2, duration: 0.5, ease: EASE_OUT }}
        className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-[var(--color-line)]"
        style={{ background: "white" }}
      >
        {paymentRows.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-3 gap-4 border-b border-[var(--color-line)] px-6 py-4 last:border-0"
          >
            <span className="text-[14px] font-medium" style={{ color: "var(--color-ink)" }}>
              {row.stream}
            </span>
            <span className="text-[14px]" style={{ color: "var(--color-muted)" }}>
              {row.timing}
            </span>
            <span className="text-[13px]" style={{ color: "var(--color-muted)" }}>
              {row.note}
            </span>
          </div>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.4, duration: 0.4, ease: EASE_OUT }}
        className="mt-4 text-[13px]"
        style={{ color: "var(--color-muted)" }}
      >
        Minimum payout €50. Anything below carries to the following month.
      </motion.p>
    </section>
  )
}

// ---------------------------------------------------------------------------
// 8. AmbassadorFAQ
// ---------------------------------------------------------------------------

const AMBASSADOR_FAQS = [
  {
    q: "What if my POIs get deleted from the platform?",
    a: "We notify you 14 days before any removal. POIs only get removed if they fail our quality bar — closures, factual errors, plagiarism, or content that doesn't fit the Ohana standard. You can always upload corrected versions.",
  },
  {
    q: "Can I see how my POIs are performing?",
    a: "Yes. Every Ambassador gets an analytics dashboard showing usage, earnings, and referral activity.",
  },
  {
    q: "What happens if I drop below 200 POIs as an Anchor?",
    a: "You stay an Ambassador, just not an Anchor. The minimum guarantee no longer applies, but POI earnings and referrals continue. You can climb back to Anchor by publishing more.",
  },
  {
    q: "Is Ohana related to Rexby?",
    a: "No. Many of our first Ambassadors came from Rexby's creator community — but we're a different product. Rexby sells guides. Ohana builds personalised itineraries from the POIs creators contribute. Both can coexist; we don't ask you to choose.",
  },
  {
    q: "When does my content earn me money?",
    a: "The moment one of your POIs appears in a paid itinerary. We track every usage and credit you for it.",
  },
  {
    q: "Can I still publish on Rexby, my blog, or Instagram?",
    a: "Yes — and please do. There's no exclusivity in this partnership. Your content is yours to publish wherever you already do.",
  },
]

function AmbassadorFAQ() {
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
        Questions
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
        Common questions.
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.2, duration: 0.5, ease: EASE_OUT }}
      >
        <Accordion className="mx-auto max-w-2xl divide-y divide-[var(--color-line)]">
          {AMBASSADOR_FAQS.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-0">
              <AccordionTrigger
                className="py-5 text-left text-[15px] font-medium hover:no-underline"
                style={{ color: "var(--color-ink)" }}
              >
                {faq.q}
              </AccordionTrigger>
              <AccordionContent
                className="pb-5 text-[15px] leading-relaxed"
                style={{ color: "var(--color-muted)" }}
              >
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// 9. ApplicationForm
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
    try {
      const res = await fetch("/api/ambassadors/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      })
      if (!res.ok) throw new Error("submit failed")
    } catch {
      setState("idle")
      return
    }
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
      <EarningsTable />
      <HowToJoin />
      <Principles />
      <PaymentSchedule />
      <AmbassadorFAQ />
      <ApplicationForm />
      <SiteFooter />
    </>
  )
}
