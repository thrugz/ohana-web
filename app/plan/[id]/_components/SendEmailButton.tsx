// app/plan/[id]/_components/SendEmailButton.tsx
"use client"

import { useState } from "react"

export function SendEmailButton({ itineraryId }: { itineraryId: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle")

  async function handleSend() {
    setState("sending")
    try {
      const res = await fetch(`/api/plan/${itineraryId}/send`, { method: "POST" })
      setState(res.ok ? "sent" : "error")
    } catch {
      setState("error")
    }
  }

  const labels: Record<typeof state, string> = {
    idle: "Email this itinerary to me",
    sending: "Sending…",
    sent: "Sent! Check your inbox.",
    error: "Failed to send. Try again.",
  }

  return (
    <button
      type="button"
      onClick={state === "error" ? handleSend : state === "idle" ? handleSend : undefined}
      disabled={state === "sending" || state === "sent"}
      className="text-sm underline underline-offset-2 hover:text-ink transition-colors disabled:opacity-50"
      style={{
        color: "var(--color-muted)",
        background: "none",
        border: "none",
        cursor: state === "idle" || state === "error" ? "pointer" : "default",
        padding: 0,
      }}
    >
      {labels[state]}
    </button>
  )
}
