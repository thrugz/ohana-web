"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"
import { FinalCTA } from "../_components/FinalCTA"
import { SiteFooter } from "../_components/SiteFooter"

// ─── Shared transition ────────────────────────────────────────────────────────

const spring = { type: "spring" as const, stiffness: 350, damping: 22 }

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    transition: { ...spring, delay },
  }
}

// ─── 1. Mission Statement ─────────────────────────────────────────────────────

function MissionStatement() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-15% 0px" })

  return (
    <section
      ref={ref}
      className="border-b border-[var(--color-line)] px-8 pt-40 pb-24 text-center md:px-20"
    >
      <motion.p
        {...fadeUp(0)}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="mb-6 text-[11px] uppercase tracking-widest"
        style={{ color: "var(--color-muted)" }}
      >
        Our mission
      </motion.p>

      <motion.h1
        {...fadeUp(0.1)}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        style={{
          fontFamily: "var(--font-serif)",
          fontVariationSettings: '"opsz" 144',
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(2.5rem, 5vw, 4rem)",
          lineHeight: 1.05,
          letterSpacing: "-0.025em",
          color: "var(--color-ink)",
        }}
      >
        Travel should feel like{" "}
        <em style={{ fontStyle: "inherit", color: "var(--color-clay)" }}>you.</em>
      </motion.h1>

      <motion.p
        {...fadeUp(0.2)}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="mx-auto mt-8 text-[17px] leading-[1.9]"
        style={{
          maxWidth: 580,
          color: "var(--color-muted)",
          fontFamily: "var(--font-sans)",
        }}
      >
        We built Ohana because we kept having the same conversation — how did you
        find that place? How did you know to go there? The answer was never an
        algorithm. It was knowing someone. Ohana is that someone.
      </motion.p>
    </section>
  )
}

// ─── 2. Origin Story ──────────────────────────────────────────────────────────

function OriginStory() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-15% 0px" })

  return (
    <section
      ref={ref}
      className="border-b border-[var(--color-line)] px-8 py-20 md:px-20"
    >
      <motion.p
        {...fadeUp(0)}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="mb-12 text-[11px] uppercase tracking-widest"
        style={{ color: "var(--color-muted)" }}
      >
        The story
      </motion.p>

      <div className="grid gap-16 md:grid-cols-2 md:gap-24">
        {/* Pull-quote */}
        <motion.div
          {...fadeUp(0.1)}
          animate={inView ? { opacity: 1, y: 0 } : {}}
        >
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontVariationSettings: '"opsz" 72',
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "var(--color-ink)",
              opacity: 0.85,
            }}
          >
            Most travel apps help you find a hotel. We wanted to help you find{" "}
            <em style={{ fontStyle: "inherit", color: "var(--color-clay)" }}>
              yourself
            </em>{" "}
            on the road.
          </p>
        </motion.div>

        {/* Body text */}
        <motion.div
          {...fadeUp(0.18)}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="flex flex-col gap-6"
        >
          <p
            className="text-[16px] leading-[1.9]"
            style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}
          >
            Ohana was founded by Bram in Copenhagen, after years of frustration
            watching every travel tool optimise for advertisers over the people
            actually taking the trips. The question was never "how do we rank
            these hotels?" It was: why does none of this feel personal?
          </p>
          <p
            className="text-[16px] leading-[1.9]"
            style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}
          >
            The answer came from watching how real travellers actually share
            knowledge. Not through sponsored placements or star ratings, but
            through trust. A friend who lived there for three months. A stranger
            who overheard you in a café. That texture of honest, particular
            recommendation — we wanted to build that at scale, without losing it.
          </p>
          <p
            className="text-[16px] leading-[1.9]"
            style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}
          >
            We launched an early beta with 12,400 travellers who already felt the
            same way. They are already planning trips to 140+ countries. Every
            one of them told a friend.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// ─── 3. Values ────────────────────────────────────────────────────────────────

const values = [
  {
    num: "01",
    title: "Honest intelligence",
    body: "We tell you what we actually think, not what we're paid to say.",
  },
  {
    num: "02",
    title: "Your data, yours",
    body: "We don't sell it. We don't profile you. We use it to serve you.",
  },
  {
    num: "03",
    title: "Designed for trust",
    body: "Every feature earns its place by making your trip better.",
  },
  {
    num: "04",
    title: "Travel with intention",
    body: "The best trips leave a place better than you found it.",
  },
]

function Values() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-15% 0px" })

  return (
    <section
      ref={ref}
      className="border-b border-[var(--color-line)] px-8 py-20 md:px-20"
    >
      <motion.h2
        {...fadeUp(0)}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="mb-16"
        style={{
          fontFamily: "var(--font-serif)",
          fontVariationSettings: '"opsz" 72',
          fontWeight: 400,
          fontSize: "clamp(2.5rem, 5vw, 4rem)",
          lineHeight: 1.05,
          letterSpacing: "-0.025em",
          color: "var(--color-ink)",
        }}
      >
        What we stand for.
      </motion.h2>

      <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 md:gap-8">
        {values.map((v, i) => (
          <motion.div
            key={v.num}
            {...fadeUp(0.08 + i * 0.1)}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            whileHover={{ y: -4 }}
            transition={spring}
          >
            {/* Number tag */}
            <div
              className="mb-5 select-none"
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
              {v.num}
            </div>
            <h3
              className="mb-3 text-[18px]"
              style={{
                fontFamily: "var(--font-serif)",
                fontVariationSettings: '"opsz" 40',
                fontWeight: 400,
                letterSpacing: "-0.01em",
                color: "var(--color-ink)",
              }}
            >
              {v.title}
            </h3>
            <p
              className="text-[14px] leading-[1.75]"
              style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}
            >
              {v.body}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ─── 4. Giving Back ───────────────────────────────────────────────────────────

function GivingBack() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-15% 0px" })

  return (
    <section
      ref={ref}
      className="border-b border-[var(--color-line)] px-8 py-20 text-center md:px-20"
      style={{ background: "var(--color-clay-soft)" }}
    >
      <motion.p
        {...fadeUp(0)}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="mb-4 text-[11px] uppercase tracking-widest"
        style={{ color: "var(--color-clay)" }}
      >
        Giving back
      </motion.p>

      <motion.h2
        {...fadeUp(0.1)}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="mb-6"
        style={{
          fontFamily: "var(--font-serif)",
          fontVariationSettings: '"opsz" 144',
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(2.5rem, 5vw, 4rem)",
          lineHeight: 1.05,
          letterSpacing: "-0.025em",
          color: "var(--color-ink)",
        }}
      >
        1% of every trip,<br />for something good.
      </motion.h2>

      <motion.p
        {...fadeUp(0.18)}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="mx-auto mb-10 text-[16px] leading-[1.9]"
        style={{
          maxWidth: 620,
          color: "var(--color-muted)",
          fontFamily: "var(--font-sans)",
        }}
      >
        We reserve 1% of revenue from every trip planned through Ohana for
        humanitarian causes chosen by our community. No corporate charity-washing
        — just a direct, transparent commitment to the places and people that make
        travel worth having. We also build optional volunteer opportunities into
        trips, and give free Ohana access to NGO workers and humanitarian staff
        worldwide.
      </motion.p>

      <motion.div
        {...fadeUp(0.26)}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] uppercase tracking-widest"
        style={{
          background: "var(--color-sage-soft)",
          color: "var(--color-sage)",
        }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: "var(--color-sage)" }}
        />
        Certified B Corp in progress
      </motion.div>
    </section>
  )
}

// ─── 5. Team Note ─────────────────────────────────────────────────────────────

function TeamNote() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-15% 0px" })

  return (
    <section
      ref={ref}
      className="border-b border-[var(--color-line)] px-8 py-20 text-center md:px-20"
    >
      <motion.p
        {...fadeUp(0)}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="mb-4 text-[11px] uppercase tracking-widest"
        style={{ color: "var(--color-muted)" }}
      >
        The team
      </motion.p>

      <motion.h2
        {...fadeUp(0.1)}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="mb-6"
        style={{
          fontFamily: "var(--font-serif)",
          fontVariationSettings: '"opsz" 144',
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(2.5rem, 5vw, 4rem)",
          lineHeight: 1.05,
          letterSpacing: "-0.025em",
          color: "var(--color-ink)",
        }}
      >
        Small by design.
      </motion.h2>

      <motion.p
        {...fadeUp(0.18)}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="mx-auto mb-10 text-[16px] leading-[1.9]"
        style={{
          maxWidth: 560,
          color: "var(--color-muted)",
          fontFamily: "var(--font-sans)",
        }}
      >
        We're a small team spread across Copenhagen, Lisbon, and Tokyo. We're
        engineers, writers, and compulsive travellers. We think the best products
        are made by people who actually use them.
      </motion.p>

      <motion.div
        {...fadeUp(0.26)}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="flex items-center justify-center gap-3 text-[13px]"
        style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}
      >
        <span>Copenhagen</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span>Lisbon</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span>Tokyo</span>
      </motion.div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <>
      <MissionStatement />
      <OriginStory />
      <Values />
      <GivingBack />
      <TeamNote />
      <FinalCTA />
      <SiteFooter />
    </>
  )
}
