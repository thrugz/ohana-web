// app/api/plan/[id]/send/route.ts
import { NextResponse } from "next/server"
import { getTwinSession } from "@/lib/auth/session"
import { getItinerary } from "@/lib/plan/db"
import { sendItineraryEmail } from "@/lib/plan/email"
import { isUuid } from "@/lib/moment/db"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getTwinSession()
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  const itinerary = await getItinerary(id, session.user.id)
  if (!itinerary) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await sendItineraryEmail(session.user.email, itinerary)
  return NextResponse.json({ sent: true })
}
