// app/api/plan/[id]/route.ts
import { NextResponse } from "next/server"
import { getTwinSession } from "@/lib/auth/session"
import { getItinerary } from "@/lib/plan/db"
import { isUuid } from "@/lib/moment/db"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getTwinSession()
  if (!session?.user?.id) {
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

  return NextResponse.json(itinerary)
}
