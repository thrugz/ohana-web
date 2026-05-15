// POST /api/moment/hoku — server proxy to the hoku_agent pipeline. Keeps
// HAYSTACK_URL server-side. Body: { mode, payload }.
import { NextResponse } from "next/server"
import { askHoku, type HokuMode } from "@/lib/hoku/client"

const MODES = new Set<HokuMode>(["reflect", "wanderer"])

export async function POST(req: Request) {
  let body: { mode?: unknown; payload?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { mode, payload } = body
  if (typeof mode !== "string" || !MODES.has(mode as HokuMode)) {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 })
  }

  const reply = await askHoku(
    mode as HokuMode,
    payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {},
  )
  return NextResponse.json({ reply })
}
