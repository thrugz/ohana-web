import { NextResponse } from "next/server"
import { getTwinSession } from "@/lib/auth/session"
import { getTwinData } from "@/lib/twin/data"
import { getProfile } from "@/lib/twin/profile"

export async function GET() {
  const session = await getTwinSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  const [twin, profile] = await Promise.all([
    getTwinData(),
    getProfile(session.user.id),
  ])

  const report = {
    name: session.user.name ?? null,
    explorerBadge: twin?.explorerBadge ?? null,
    visitedCountries: profile?.visitedCountries ?? twin?.visitedCountries ?? [],
    preferredMoods: profile?.preferredMoods ?? twin?.moods ?? [],
    preferredThemes: profile?.preferredThemes ?? [],
    savedPlaces: (twin?.savedPois ?? []).map((p) => ({ name: p.name, type: p.poiType })),
  }

  return new Response(JSON.stringify(report, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="twin-report.json"',
    },
  })
}
