"use client"

import { useEffect } from "react"

// IntersectionObserver fallback for Safari/Firefox
// (native CSS scroll-driven animations only work in Chromium)
export function ScrollReveal() {
  useEffect(() => {
    const supportsScrollTimeline = CSS.supports("animation-timeline", "view()")
    if (supportsScrollTimeline) return

    const els = document.querySelectorAll("[data-reveal], [data-reveal='pop'], [data-reveal='tilt'], [data-reveal='toss']")
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            ;(entry.target as HTMLElement).dataset.revealed = "true"
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )

    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return null
}
