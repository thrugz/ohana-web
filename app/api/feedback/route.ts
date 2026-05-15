import { LinearClient } from "@linear/sdk"
import { NextResponse } from "next/server"

const APP_LABEL = "web"

export async function POST(req: Request) {
  const apiKey = process.env.LINEAR_API_KEY
  const teamId = process.env.LINEAR_TEAM_ID

  if (!apiKey || !teamId) {
    return NextResponse.json({ error: "Linear not configured" }, { status: 500 })
  }

  const { title, description } = await req.json()
  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 })
  }

  const client = new LinearClient({ apiKey })

  const labelsResult = await client.issueLabels({
    filter: { team: { id: { eq: teamId } }, name: { eq: APP_LABEL } },
  })

  let labelId: string | undefined = labelsResult.nodes[0]?.id

  if (!labelId) {
    const created = await client.createIssueLabel({
      name: APP_LABEL,
      teamId,
      color: "#c17d52",
    })
    const newLabel = await created.issueLabel
    labelId = newLabel?.id
  }

  await client.createIssue({
    teamId,
    title: title.trim(),
    description: description?.trim() || undefined,
    labelIds: labelId ? [labelId] : [],
  })

  return NextResponse.json({ ok: true })
}
