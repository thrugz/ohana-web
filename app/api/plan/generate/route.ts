import { NextResponse } from "next/server"
import { getTwinSession } from "@/lib/auth/session"
import { createItinerary } from "@/lib/plan/db"
import { isUuid } from "@/lib/moment/db"

export async function POST(req: Request) {
  const session = await getTwinSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !Array.isArray((body as Record<string, unknown>).savedPoiIds) ||
    typeof (body as Record<string, unknown>).days !== "number"
  ) {
    return NextResponse.json({ error: "savedPoiIds and days are required" }, { status: 400 })
  }

  const { savedPoiIds, days } = body as { savedPoiIds: unknown[]; days: number }
  const validIds = savedPoiIds.filter(isUuid) as string[]

  if (validIds.length === 0) {
    return NextResponse.json({ error: "No valid POI IDs" }, { status: 400 })
  }

  const clampedDays = Math.max(1, Math.min(30, Math.floor(days)))
  const title = `${clampedDays}-day trip`

  const itineraryId = await createItinerary(session.user.id, title, validIds, clampedDays)
  return NextResponse.json({ itineraryId })
}
