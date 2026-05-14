"use client"

import { useEffect, useRef } from "react"

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: -100, y: -100 })
  const curr = useRef({ x: -100, y: -100 })
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return

    const cursor = cursorRef.current
    if (!cursor) return

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }

      const target = e.target as HTMLElement
      const isBtn = target.closest("button, a, [data-cursor='button']")
      const isPhoto = target.closest("[data-cursor='photo']")
      const isDark = target.closest("[data-cursor='dark']")
      const isDrag = target.closest("[data-cursor='drag']")

      cursor.dataset.state = isDrag
        ? "drag"
        : isBtn
          ? "button"
          : isPhoto
            ? "photo"
            : isDark
              ? "dark"
              : "default"
    }

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const loop = () => {
      curr.current.x = lerp(curr.current.x, pos.current.x, 0.15)
      curr.current.y = lerp(curr.current.y, pos.current.y, 0.15)
      cursor.style.transform = `translate(${curr.current.x}px, ${curr.current.y}px)`
      rafRef.current = requestAnimationFrame(loop)
    }

    window.addEventListener("mousemove", onMove)
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener("mousemove", onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      aria-hidden
      className="
        pointer-events-none fixed left-0 top-0 z-[9999]
        -translate-x-1/2 -translate-y-1/2
        transition-[width,height,background,border-radius,border-color,opacity]
        duration-150
        [transition-timing-function:var(--ease-spring)]

        data-[state=default]:h-3 data-[state=default]:w-3
        data-[state=default]:rounded-full
        data-[state=default]:border data-[state=default]:border-[var(--color-clay)]
        data-[state=default]:bg-transparent

        data-[state=dark]:h-3 data-[state=dark]:w-3
        data-[state=dark]:rounded-full
        data-[state=dark]:border data-[state=dark]:border-white
        data-[state=dark]:bg-transparent

        data-[state=button]:h-10 data-[state=button]:w-10
        data-[state=button]:rounded-full
        data-[state=button]:bg-[var(--color-clay-soft)]
        data-[state=button]:border-0

        data-[state=photo]:h-10 data-[state=photo]:w-10
        data-[state=photo]:rounded-full
        data-[state=photo]:border-2 data-[state=photo]:border-white
        data-[state=photo]:bg-transparent

        data-[state=drag]:h-10 data-[state=drag]:w-10
        data-[state=drag]:rounded-full
        data-[state=drag]:bg-[var(--color-clay)]
        data-[state=drag]:border-0

        hidden md:block
      "
    />
  )
}
