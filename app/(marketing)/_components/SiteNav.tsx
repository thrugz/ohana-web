"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import { OhanaLogo } from "@/components/OhanaLogo"

const NAV_LINKS = [
  { label: "Pricing", href: "/pricing" },
  { label: "Ambassadors", href: "/ambassadors" },
  { label: "About", href: "/about" },
]

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 80)
    }
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  // Close mobile menu on scroll
  useEffect(() => {
    if (mobileOpen) {
      const close = () => setMobileOpen(false)
      window.addEventListener("scroll", close, { once: true, passive: true })
      return () => window.removeEventListener("scroll", close)
    }
  }, [mobileOpen])

  const navBg = scrolled || mobileOpen ? "oklch(0.99 0.005 80 / 0.96)" : "transparent"
  const navBlur = scrolled || mobileOpen ? "blur(12px)" : "none"
  const navBorder = scrolled || mobileOpen ? "1px solid var(--color-line)" : "1px solid transparent"
  const linkColor = scrolled || mobileOpen ? "var(--color-ink)" : "rgba(255,255,255,0.88)"

  return (
    <>
      <nav
        className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
        style={{
          background: navBg,
          backdropFilter: navBlur,
          borderBottom: navBorder,
        }}
      >
        <div className="flex h-16 items-center px-8 md:px-12">
          {/* Logo */}
          <Link href="/" className="no-underline" onClick={() => setMobileOpen(false)}>
            <OhanaLogo variant={scrolled || mobileOpen ? "light" : "dark"} />
          </Link>

          {/* Desktop centre links */}
          <div className="mx-auto hidden gap-8 md:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="relative text-[13px] transition-colors duration-150 no-underline group"
                style={{ color: linkColor }}
              >
                {l.label}
                <span
                  className="absolute -bottom-0.5 left-0 h-px w-0 bg-current transition-all duration-200 group-hover:w-full"
                  style={{ transformOrigin: "left" }}
                />
              </Link>
            ))}
          </div>

          {/* Desktop right */}
          <div className="ml-auto hidden items-center gap-4 md:flex">
            <Link
              href="/sign-in"
              className="text-[13px] no-underline transition-colors duration-150"
              style={{ color: scrolled ? "var(--color-ink)" : "rgba(255,255,255,0.88)" }}
            >
              Sign in
            </Link>
            <motion.a
              href="#signup"
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="rounded-full px-5 py-2 text-[13px] font-medium text-white no-underline"
              style={{
                background: "var(--color-clay)",
                boxShadow: "0 1px 8px var(--color-clay-glow)",
              }}
            >
              Get the app
            </motion.a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="ml-auto flex flex-col gap-[5px] p-2 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <motion.span
              animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="block h-px w-5 origin-center"
              style={{ background: scrolled || mobileOpen ? "var(--color-ink)" : "white" }}
            />
            <motion.span
              animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.2 }}
              className="block h-px w-5 origin-center"
              style={{ background: scrolled || mobileOpen ? "var(--color-ink)" : "white" }}
            />
            <motion.span
              animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="block h-px w-5 origin-center"
              style={{ background: scrolled || mobileOpen ? "var(--color-ink)" : "white" }}
            />
          </button>
        </div>

        {/* Mobile menu panel */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t md:hidden"
              style={{ borderColor: "var(--color-line)" }}
            >
              <div className="flex flex-col gap-1 px-8 py-6">
                {NAV_LINKS.map((l, i) => (
                  <motion.div
                    key={l.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 + 0.1, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      className="block py-3 text-[18px] no-underline"
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontVariationSettings: '"opsz" 40',
                        fontWeight: 400,
                        color: "var(--color-ink)",
                      }}
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
                <div className="mt-4 flex flex-col gap-3 border-t pt-4" style={{ borderColor: "var(--color-line)" }}>
                  <Link href="/sign-in" className="text-[14px] no-underline" style={{ color: "var(--color-muted)" }}>
                    Sign in
                  </Link>
                  <a
                    href="#signup"
                    onClick={() => setMobileOpen(false)}
                    className="inline-block w-fit rounded-full px-6 py-3 text-[14px] font-medium text-white no-underline"
                    style={{ background: "var(--color-clay)" }}
                  >
                    Get the app
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}
