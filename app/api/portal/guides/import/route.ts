import { NextRequest, NextResponse } from "next/server"
import { getPortalSession } from "@/lib/portal/session"
import { getAmbassadorRecord } from "@/lib/portal/ambassador"
import { parseCsvText, validateRow, toPlace, ValidationError } from "@/lib/portal/csvParse"
import { stageImport } from "@/lib/portal/guides"

export async function POST(request: NextRequest) {
  const session = await getPortalSession()
  if (!session) return new NextResponse("Unauthorized", { status: 401 })

  const record = await getAmbassadorRecord()
  if (!record) return new NextResponse("Not found", { status: 404 })

  let text: string
  try {
    const formData = await request.formData()
    const file = formData.get("file")
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }
    text = await (file as File).text()
  } catch {
    return NextResponse.json({ error: "Could not read file" }, { status: 400 })
  }

  const rows = parseCsvText(text)
  if (rows.length === 0) {
    return NextResponse.json({ error: "CSV contains no data rows" }, { status: 400 })
  }

  const allErrors: ValidationError[] = []
  const validPlaces = []

  for (let i = 0; i < rows.length; i++) {
    const rowErrors = validateRow(rows[i], i + 2)
    if (rowErrors.length > 0) {
      allErrors.push(...rowErrors)
    } else {
      validPlaces.push(toPlace(rows[i]))
    }
  }

  const { inserted } = await stageImport(record.slug, validPlaces)

  return NextResponse.json({
    inserted,
    skipped: rows.length - validPlaces.length,
    errors: allErrors,
  })
}
