import { LinearClient } from "@linear/sdk"
import { NextResponse } from "next/server"

const APP_LABEL = "web"
const PROJECT_ID = "343b1877-dc98-4700-9a05-b7458014fd27"

export async function POST(req: Request) {
  const apiKey = process.env.LINEAR_API_KEY
  const teamId = process.env.LINEAR_TEAM_ID

  if (!apiKey || !teamId) {
    return NextResponse.json({ error: "Linear not configured" }, { status: 500 })
  }

  const { title, description, screenshotBase64, pageUrl, pageTitle } = await req.json()

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 })
  }

  const client = new LinearClient({ apiKey })

  // Find or create label
  const labelsResult = await client.issueLabels({
    filter: { team: { id: { eq: teamId } }, name: { eq: APP_LABEL } },
  })
  let labelId: string | undefined = labelsResult.nodes[0]?.id
  if (!labelId) {
    const created = await client.createIssueLabel({ name: APP_LABEL, teamId, color: "#c17d52" })
    const newLabel = await created.issueLabel
    labelId = newLabel?.id
  }

  // Build description with page context
  const contextLines = [
    description?.trim() || "",
    "",
    pageUrl ? `**URL:** ${pageUrl}` : "",
    pageTitle ? `**Page:** ${pageTitle}` : "",
  ].filter((l, i) => i < 2 || l !== "")
  const fullDescription = contextLines.join("\n").trim()

  // Create issue
  const issueResult = await client.createIssue({
    teamId,
    projectId: PROJECT_ID,
    title: title.trim(),
    description: fullDescription || undefined,
    labelIds: labelId ? [labelId] : [],
  })
  const issue = await issueResult.issue

  // Upload and attach screenshot
  if (screenshotBase64 && issue?.id) {
    try {
      const base64Data = screenshotBase64.replace(/^data:image\/png;base64,/, "")
      const buffer = Buffer.from(base64Data, "base64")

      const uploadResult = await client.fileUpload("image/png", "screenshot.png", buffer.length)
      const uploadFile = uploadResult.uploadFile

      if (uploadFile?.uploadUrl) {
        const uploadHeaders: Record<string, string> = { "Content-Type": "image/png" }
        uploadFile.headers?.forEach((h) => { uploadHeaders[h.key] = h.value })

        await fetch(uploadFile.uploadUrl, {
          method: "PUT",
          body: buffer,
          headers: uploadHeaders,
        })

        if (uploadFile.assetUrl) {
          await client.createAttachment({
            issueId: issue.id,
            url: uploadFile.assetUrl,
            title: "Screenshot",
          })
        }
      }
    } catch {
      // Screenshot upload failed — issue still created
    }
  }

  return NextResponse.json({ ok: true })
}
