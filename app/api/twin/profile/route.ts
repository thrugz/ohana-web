import { NextResponse } from "next/server"
import { getTwinSession } from "@/lib/auth/session"
import { upsertProfile } from "@/lib/twin/profile"
import type { ProfilePatch } from "@/lib/twin/profile"

export async function PATCH(req: Request) {
  const session = await getTwinSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Body must be an object" }, { status: 400 })
  }

  const raw = body as Record<string, unknown>
  const patch: ProfilePatch = {}

  if (Array.isArray(raw.visitedCountries)) {
    patch.visitedCountries = raw.visitedCountries.filter((v): v is string => typeof v === "string")
  }
  if (Array.isArray(raw.preferredMoods)) {
    patch.preferredMoods = raw.preferredMoods.filter((v): v is string => typeof v === "string")
  }
  if (Array.isArray(raw.preferredThemes)) {
    patch.preferredThemes = raw.preferredThemes.filter((v): v is string => typeof v === "string")
  }

  await upsertProfile(session.user.id, patch)
  return NextResponse.json({ ok: true })
}
