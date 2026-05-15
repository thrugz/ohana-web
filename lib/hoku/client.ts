// Calls the ohana-haystack hoku_agent pipeline via the OpenAI-compatible
// /chat/completions endpoint. Returns "" on any failure so the caller can
// fall back to a pre-authored line (graceful degradation, per spec §3.3).

const HAYSTACK_URL = process.env.HAYSTACK_URL ?? "http://localhost:1416"

export type HokuMode = "reflect" | "wanderer"

export async function askHoku(mode: HokuMode, payload: Record<string, unknown>): Promise<string> {
  try {
    const res = await fetch(`${HAYSTACK_URL}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "hoku-agent",
        messages: [{ role: "user", content: JSON.stringify({ mode, ...payload }) }],
      }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return ""
    const data = await res.json()
    return data.choices?.[0]?.message?.content ?? ""
  } catch {
    return ""
  }
}
