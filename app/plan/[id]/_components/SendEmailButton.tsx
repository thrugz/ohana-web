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
      onClick={handleSend}
      disabled={state === "sending" || state === "sent"}
      className="text-sm underline underline-offset-2 transition-colors disabled:opacity-50"
      style={{
        color: "var(--color-muted)",
        background: "none",
        border: "none",
        cursor: state === "idle" || state === "error" ? "pointer" : "default",
        padding: 0,
      }}
      onMouseEnter={(e) => {
        if (state === "idle" || state === "error") {
          (e.currentTarget as HTMLButtonElement).style.color = "var(--color-ink)"
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = "var(--color-muted)"
      }}
    >
      {labels[state]}
    </button>
  )
}
