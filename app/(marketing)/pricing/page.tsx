"use client"

import { useRef, useState } from "react"
import { motion, useInView } from "motion/react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FinalCTA } from "../_components/FinalCTA"
import { SiteFooter } from "../_components/SiteFooter"

// ---------------------------------------------------------------------------
// PricingHero
// ---------------------------------------------------------------------------

function PricingHero() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-15% 0px" })

  return (
    <section
      ref={ref}
      className="border-b border-[var(--color-line)] px-8 pt-40 pb-16 md:px-20 text-center"
    >
      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-4 text-[11px] uppercase tracking-widest"
        style={{ color: "var(--color-clay)" }}
      >
        Pricing
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, ease: "easeOut", delay: 0.08 }}
        style={{
          fontFamily: "var(--font-serif)",
          fontVariationSettings: '"opsz" 144',
          fontWeight: 400,
          fontSize: "clamp(2.2rem, 4vw, 3.5rem)",
          lineHeight: 1.1,
          letterSpacing: "-0.025em",
          color: "var(--color-ink)",
          fontStyle: "italic",
        }}
        className="mb-5"
      >
        Simple, honest pricing.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, ease: "easeOut", delay: 0.18 }}
        className="mx-auto max-w-md text-[15px] leading-relaxed"
        style={{ color: "var(--color-muted)" }}
      >
        Free to start. Always. No tricks, no dark patterns, no sudden upsell when you&apos;re mid-trip.
      </motion.p>
    </section>
  )
}

// ---------------------------------------------------------------------------
// PricingCards
// ---------------------------------------------------------------------------

const FREE_FEATURES = [
  "Personalised trip planning",
  "Neighbourhood recommendations",
  "Up to 3 saved trips",
  "Companion matching (basic)",
  "Offline access",
  "Community access",
]

const PREMIUM_FEATURES = [
  "Everything in Free",
  "Unlimited saved trips",
  "AI trip refinement — unlimited",
  "Companion matching (full)",
  "Local insider access",
  "Priority support",
  "Ambassador benefits",
  "Early feature access",
]

function PricingCards() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-15% 0px" })
  const [billing, setBilling] = useState<"monthly" | "annual">("annual")

  return (
    <section
      ref={ref}
      className="border-b border-[var(--color-line)] px-8 py-20 md:px-20"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-6 sm:flex-row">
        {/* Free card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0 }}
          className="flex flex-1 flex-col rounded-2xl border border-[var(--color-line)] bg-white p-8"
          style={{ minHeight: 480 }}
        >
          <span
            className="mb-6 inline-block w-fit rounded-full px-3 py-1 text-[11px] uppercase tracking-widest"
            style={{ background: "var(--color-sage-soft)", color: "var(--color-sage)" }}
          >
            Always free
          </span>

          <div className="mb-1 flex items-end gap-1">
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontVariationSettings: '"opsz" 144',
                fontWeight: 400,
                fontSize: "4rem",
                lineHeight: 1,
                color: "var(--color-ink)",
              }}
            >
              €0
            </span>
            <span
              className="mb-2 text-[13px]"
              style={{ color: "var(--color-muted)" }}
            >
              /month
            </span>
          </div>

          <p
            className="mb-6 text-[14px] leading-snug"
            style={{ color: "var(--color-muted)" }}
          >
            Everything you need to plan a real trip.
          </p>

          <ul className="mb-8 flex-1 space-y-3">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[14px]" style={{ color: "var(--color-ink)" }}>
                <span style={{ color: "var(--color-clay)", flexShrink: 0 }}>✓</span>
                {f}
              </li>
            ))}
          </ul>

          <button
            className="mt-auto w-full rounded-full py-3 text-[14px] font-medium transition-opacity hover:opacity-80"
            style={{ background: "var(--color-clay)", color: "#fff" }}
          >
            Get started free
          </button>
        </motion.div>

        {/* Premium card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          whileHover={{ y: -6 }}
          style={{
            minHeight: 480,
            background: "var(--color-clay)",
            boxShadow: "0 8px 40px var(--color-clay-glow), 0 2px 12px var(--color-clay-glow)",
            transition: "box-shadow 0.2s",
          }}
          className="flex flex-1 flex-col rounded-2xl p-8"
        >
          <span
            className="mb-6 inline-block w-fit rounded-full px-3 py-1 text-[11px] uppercase tracking-widest"
            style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
          >
            Premium
          </span>

          {/* Billing toggle */}
          <div className="mb-3 flex items-center gap-2">
            <button
              onClick={() => setBilling("monthly")}
              className="rounded-full px-3 py-1 text-[12px] transition-all"
              style={{
                background: billing === "monthly" ? "rgba(255,255,255,0.25)" : "transparent",
                color: billing === "monthly" ? "#fff" : "rgba(255,255,255,0.55)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("annual")}
              className="rounded-full px-3 py-1 text-[12px] transition-all"
              style={{
                background: billing === "annual" ? "rgba(255,255,255,0.25)" : "transparent",
                color: billing === "annual" ? "#fff" : "rgba(255,255,255,0.55)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              Annual
            </button>
            {billing === "annual" && (
              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                Save 33%
              </span>
            )}
          </div>

          <div className="mb-1 flex items-end gap-1">
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontVariationSettings: '"opsz" 144',
                fontWeight: 400,
                fontSize: "4rem",
                lineHeight: 1,
                color: "#fff",
              }}
            >
              {billing === "annual" ? "€8" : "€12"}
            </span>
            <span
              className="mb-2 text-[13px]"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              /mo
            </span>
          </div>

          <p
            className="mb-6 text-[14px] leading-snug"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            For travellers who are serious about the journey.
          </p>

          <ul className="mb-8 flex-1 space-y-3">
            {PREMIUM_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[14px]" style={{ color: "#fff" }}>
                <span style={{ color: "rgba(255,255,255,0.7)", flexShrink: 0 }}>✓</span>
                {f}
              </li>
            ))}
          </ul>

          <button
            className="mt-auto w-full rounded-full py-3 text-[14px] font-medium transition-opacity hover:opacity-90"
            style={{ background: "#fff", color: "var(--color-clay)" }}
          >
            Start free trial
          </button>

          <p
            className="mt-3 text-center text-[12px]"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            14-day free trial, cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// ComparisonTable
// ---------------------------------------------------------------------------

type CellValue = string | boolean

interface ComparisonRow {
  feature: string
  free: CellValue
  premium: CellValue
}

const COMPARISON_ROWS: ComparisonRow[] = [
  { feature: "Trip planning", free: true, premium: true },
  { feature: "Neighbourhood picks", free: true, premium: true },
  { feature: "Saved trips", free: "Up to 3", premium: "Unlimited" },
  { feature: "Trip refinement", free: "5/month", premium: "Unlimited" },
  { feature: "Companion matching", free: "Basic", premium: "Full" },
  { feature: "Local insider access", free: false, premium: true },
  { feature: "Offline maps", free: true, premium: true },
  { feature: "Priority support", free: false, premium: true },
  { feature: "Early feature access", free: false, premium: true },
]

function CellContent({ value }: { value: CellValue }) {
  if (typeof value === "boolean") {
    return value ? (
      <span style={{ color: "var(--color-clay)" }}>✓</span>
    ) : (
      <span style={{ color: "var(--color-muted)" }}>–</span>
    )
  }
  return <span style={{ color: "var(--color-ink)", fontSize: "13px" }}>{value}</span>
}

function ComparisonTable() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-15% 0px" })

  return (
    <section
      ref={ref}
      className="border-b border-[var(--color-line)] px-8 py-20 md:px-20"
    >
      <p
        className="mb-3 text-[11px] uppercase tracking-widest"
        style={{ color: "var(--color-muted)" }}
      >
        Compare
      </p>
      <h2
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
        What&apos;s included.
      </h2>

      <div className="mx-auto max-w-2xl overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="pb-4 text-left" style={{ width: "55%" }}></th>
              <th
                className="pb-4 text-center text-[11px] uppercase tracking-widest"
                style={{ color: "var(--color-muted)", fontWeight: 500 }}
              >
                Free
              </th>
              <th
                className="pb-4 text-center text-[11px] uppercase tracking-widest"
                style={{ color: "var(--color-clay)", fontWeight: 500 }}
              >
                Premium
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, i) => (
              <motion.tr
                key={row.feature}
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.04 }}
                style={{
                  background:
                    i % 2 === 1 ? "oklch(0.97 0.012 80 / 0.5)" : "transparent",
                }}
                className="border-b border-[var(--color-line)]"
              >
                <td
                  className="py-3.5 pr-4 text-[14px]"
                  style={{ color: "var(--color-ink)" }}
                >
                  {row.feature}
                </td>
                <td className="py-3.5 text-center text-[14px]">
                  <CellContent value={row.free} />
                </td>
                <td className="py-3.5 text-center text-[14px]">
                  <CellContent value={row.premium} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// PricingFAQ
// ---------------------------------------------------------------------------

const PRICING_FAQS = [
  {
    q: "Can I really use Ohana for free, forever?",
    a: "Yes. The Free tier is permanent, not a trial. We mean it when we say free to start, always.",
  },
  {
    q: "What happens to my trips if I cancel Premium?",
    a: "Your trips stay. All your data remains intact. You simply revert to the 3-trip limit on saved trips.",
  },
  {
    q: "Is there a student or NGO discount?",
    a: "NGO workers get free Premium, always. Students get 50% off with a .edu email. No hoops, just verification.",
  },
  {
    q: "How does billing work?",
    a: "Billed monthly or annually via Stripe. Cancel any time — no questions, no retention flow, no nonsense.",
  },
]

function PricingFAQ() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-15% 0px" })

  return (
    <section
      ref={ref}
      className="border-b border-[var(--color-line)] px-8 py-20 md:px-20"
    >
      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-3 text-[11px] uppercase tracking-widest"
        style={{ color: "var(--color-muted)" }}
      >
        FAQ
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, ease: "easeOut", delay: 0.08 }}
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
        Pricing questions.
      </motion.h2>

      <Accordion className="mx-auto max-w-2xl divide-y divide-[var(--color-line)]">
        {PRICING_FAQS.map((faq, i) => (
          <AccordionItem key={i} value={`pfaq-${i}`} className="border-0">
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
    </section>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PricingPage() {
  return (
    <>
      <PricingHero />
      <PricingCards />
      <ComparisonTable />
      <PricingFAQ />
      <FinalCTA />
      <SiteFooter />
    </>
  )
}
