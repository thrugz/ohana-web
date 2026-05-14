"use client"

import { useEffect, useRef, type ReactNode, type CSSProperties } from "react"

interface Props {
  children: ReactNode
  delay?: number
  className?: string
  style?: CSSProperties
}

export function TossReveal({ children, delay = 0, className, style }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || !delay) return
    ref.current.style.animationDelay = `${delay}s`
  }, [delay])

  return (
    <div
      ref={ref}
      data-reveal="toss"
      className={className}
      style={style}
    >
      {children}
    </div>
  )
}
