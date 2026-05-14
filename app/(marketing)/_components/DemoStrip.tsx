"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "motion/react"
import dynamic from "next/dynamic"

const MapPane = dynamic(() => import("@/components/MapPane").then((m) => m.MapPane), { ssr: false })

const REPLY =
  "Here's what I'd do: start Saturday morning in Alfama — coffee at Pois, walk the alleys before the crowds. Afternoon in Príncipe Real for the antique market. Evening in LX Factory — dinner at Taberna da Rua das Flores. Sunday is yours to slow down."


export function DemoStrip() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-20% 0px" })
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!isInView) return
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(REPLY.slice(0, i))
      if (i >= REPLY.length) {
        clearInterval(id)
        setDone(true)
      }
    }, 1000 / 24)
    return () => clearInterval(id)
  }, [isInView])

  return (
    <div
      ref={ref}
      className="grid gap-16 border-b border-[var(--color-line)] px-8 py-20 md:grid-cols-2 md:gap-20 md:px-20"
      style={{ background: "var(--color-surface)" }}
    >
      {/* Chat side */}
      <div>
        <p
          className="mb-5 text-[11px] uppercase tracking-widest"
          style={{ color: "var(--color-muted)" }}
        >
          See it in action
        </p>

        {/* User bubble */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-3 inline-block max-w-xs rounded-2xl rounded-bl-sm border border-[var(--color-line)] px-4 py-3 text-[14px] leading-relaxed"
          style={{ background: "var(--color-canvas)", color: "var(--color-ink)" }}
        >
          48 hours in Lisbon, like a slow weekend.
        </motion.div>

        {/* Ohana reply bubble */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-sm rounded-2xl rounded-br-sm px-4 py-3 text-[14px] leading-relaxed"
          style={{ background: "var(--color-clay-soft)", color: "var(--color-ink)" }}
        >
          <p
            className="mb-1.5 text-[10px] font-medium uppercase tracking-widest"
            style={{ color: "var(--color-clay)" }}
          >
            Ohana
          </p>
          {displayed}
          {!done && (
            <span
              className="ml-0.5 inline-block h-3.5 w-0.5 align-middle"
              style={{
                background: "var(--color-clay)",
                animation: "cursor-blink 0.8s ease-in-out infinite",
              }}
            />
          )}
        </motion.div>
      </div>

      {/* Map side */}
      <div
        className="relative overflow-hidden rounded-2xl border border-[var(--color-line)]"
        style={{ aspectRatio: "4/3" }}
        data-cursor="photo"
      >
        <MapPane />
      </div>
    </div>
  )
}
