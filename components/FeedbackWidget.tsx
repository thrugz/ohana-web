"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { toPng } from "html-to-image"

type State = "idle" | "capturing" | "open" | "loading" | "success" | "unauthenticated"

export function FeedbackWidget() {
  const [state, setState] = useState<State>("idle")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [screenshot, setScreenshot] = useState<string | null>(null)

  async function openWidget() {
    setState("capturing")
    let png: string | null = null
    try {
      png = await toPng(document.documentElement, {
        skipFonts: true,
        pixelRatio: 1,
      })
    } catch {
      // Capture failed silently — proceed without screenshot
    }
    setScreenshot(png)
    setState("open")
  }

  function closeWidget() {
    setState("idle")
    setTitle("")
    setDescription("")
    setScreenshot(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState("loading")

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          screenshotBase64: screenshot,
          pageUrl: window.location.href,
          pageTitle: document.title,
        }),
      })

      if (res.status === 401) {
        setState("unauthenticated")
        return
      }
      if (!res.ok) throw new Error("Failed")

      setState("success")
      setTimeout(() => {
        closeWidget()
      }, 2200)
    } catch {
      setState("open")
    }
  }

  const isOpen = state === "open" || state === "loading" || state === "success" || state === "unauthenticated"

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="w-80 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-xl"
          >
            {state === "success" ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-2 py-4 text-center"
              >
                <span className="text-2xl">🌺</span>
                <p className="font-serif text-[var(--color-ink)]">Feedback received</p>
                <p className="text-sm text-[var(--color-muted)]">We appreciate it.</p>
              </motion.div>
            ) : state === "unauthenticated" ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-2 py-4 text-center"
              >
                <p className="font-serif text-[var(--color-ink)]">Sign in to send feedback</p>
                <p className="text-sm text-[var(--color-muted)]">Feedback is available to signed-in travellers.</p>
                <a
                  href="/sign-in"
                  className="mt-2 rounded-full bg-[var(--color-clay)] px-4 py-1.5 text-sm text-white no-underline hover:opacity-90 transition-opacity"
                >
                  Sign in
                </a>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-sm font-normal text-[var(--color-ink)]">
                    Share feedback
                  </h3>
                  <button
                    type="button"
                    onClick={closeWidget}
                    className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
                    aria-label="Close"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                {screenshot && (
                  <div className="overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-line)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={screenshot} alt="Page screenshot" className="w-full object-cover" style={{ maxHeight: 80 }} />
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[var(--color-muted)]">Title</label>
                  <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What's on your mind?"
                    className="rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-canvas)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-clay)] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[var(--color-muted)]">
                    Details <span className="opacity-50">(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Any extra context..."
                    className="resize-none rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-canvas)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-clay)] transition-colors"
                  />
                </div>

                <p className="text-[10px] text-[var(--color-muted)] truncate">
                  {typeof window !== "undefined" ? window.location.href : ""}
                </p>

                <button
                  type="submit"
                  disabled={state === "loading"}
                  className="flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-clay)] px-4 py-2 text-sm text-white transition-opacity disabled:opacity-60 hover:opacity-90"
                >
                  {state === "loading" ? "Sending…" : "Send"}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={isOpen ? closeWidget : openWidget}
        disabled={state === "capturing"}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-clay)] text-white shadow-lg disabled:opacity-70"
        aria-label="Open feedback"
      >
        {isOpen ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2h12a1 1 0 011 1v8a1 1 0 01-1 1H5l-3 2V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
        )}
      </motion.button>
    </div>
  )
}
