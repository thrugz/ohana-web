"use client"

import { motion, useInView } from "motion/react"
import { useRef, type ReactNode, type CSSProperties } from "react"

const SPRING = { type: "spring" as const, stiffness: 220, damping: 14, mass: 1 }

interface Props {
  children: ReactNode
  delay?: number
  className?: string
  style?: CSSProperties
}

export function TossReveal({ children, delay = 0, className, style }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-5% 0px" })

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 56, rotate: 1.5 }}
      animate={inView ? { opacity: 1, y: 0, rotate: 0 } : {}}
      transition={{ ...SPRING, delay }}
    >
      {children}
    </motion.div>
  )
}
