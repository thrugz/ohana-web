import { NextResponse } from "next/server"
import { getPool } from "@/lib/moment/db"

export async function POST(req: Request) {
  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { firstName, email, travel, why } = body
  if (!firstName?.trim() || !email?.trim() || !why?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const displayName = firstName.trim()
  const interviewResponses = {
    email: email.trim(),
    travel_regions: travel?.trim() ?? "",
    why_apply: why.trim(),
  }

  try {
    await getPool().query(
      `INSERT INTO creator_application (display_name, desired_creator_type, interview_responses)
       VALUES ($1, 'guide', $2)`,
      [displayName, JSON.stringify(interviewResponses)],
    )
  } catch (err) {
    console.error("creator_application insert failed", err)
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
