# Creator CSV Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let creators upload a CSV of their places from the ambassador portal, validate required fields, and stage rows into `raw_pois` for KGE enrichment.

**Architecture:** Pure CSV parser + validator in `lib/portal/csvParse.ts` (unit-tested in isolation). Data access in `lib/portal/guides.ts` following the existing raw-pg pattern. A `POST /api/portal/guides/import` route that reads the uploaded file, parses, validates, and bulk-inserts. A `GuidesSection` client component replaces the `<ComingSoon />` stub on the portal page — it shows submitted places (server-fetched) and an upload form. After import it calls `router.refresh()` to reload server data.

**Tech Stack:** Next.js 16 App Router, raw `pg` via `getPool()`, Vitest for tests. No new dependencies.

---

## File map

| File | Action | Responsibility |
|---|---|---|
| `lib/portal/csvParse.ts` | Create | Parse CSV text → typed rows; validate required fields; build raw_poi insert shape |
| `lib/portal/csvParse.test.ts` | Create | Unit tests for parser and validator |
| `lib/portal/guides.ts` | Create | `getSubmittedGuides()` (read) + `stageImport()` (write) |
| `lib/portal/guides.test.ts` | Create | Unit tests for data layer |
| `app/api/portal/guides/import/route.ts` | Create | POST endpoint — parses upload, calls stageImport, returns JSON result |
| `app/portal/_components/GuidesSection.tsx` | Create | Client component — upload form + submitted guides list |
| `app/portal/page.tsx` | Modify | Fetch submitted guides server-side, pass to GuidesSection |

---

## Task 1: CSV parser and validator

**Files:**
- Create: `lib/portal/csvParse.ts`
- Create: `lib/portal/csvParse.test.ts`

The parser handles the CSV template format. Required: `name` plus at least one of `address` OR both `latitude`+`longitude`. Everything else is optional and stored as-is.

### Step 1.1 — Write the failing tests

- [ ] Create `lib/portal/csvParse.test.ts`:

```typescript
import { describe, it, expect } from "vitest"
import { parseCsvText, validateRow, buildSourceId, CSV_TEMPLATE } from "./csvParse"

describe("parseCsvText", () => {
  it("parses header + one data row", () => {
    const csv = "name,address,city,country,latitude,longitude,notes,website\nCafé Central,Rua do Ouro 12,,Portugal,,,Good coffee,"
    const rows = parseCsvText(csv)
    expect(rows).toHaveLength(1)
    expect(rows[0].name).toBe("Café Central")
    expect(rows[0].address).toBe("Rua do Ouro 12")
    expect(rows[0].country).toBe("Portugal")
  })

  it("trims whitespace from values", () => {
    const csv = "name,address,city,country,latitude,longitude,notes,website\n  Spot  ,  Rua 1  ,,,,,,"
    const rows = parseCsvText(csv)
    expect(rows[0].name).toBe("Spot")
    expect(rows[0].address).toBe("Rua 1")
  })

  it("handles quoted fields with commas", () => {
    const csv = `name,address,city,country,latitude,longitude,notes,website\n"Café, Lisboa","Rua do Ouro, 12",Lisbon,Portugal,,,,`
    const rows = parseCsvText(csv)
    expect(rows[0].name).toBe("Café, Lisboa")
    expect(rows[0].address).toBe("Rua do Ouro, 12")
  })

  it("skips blank lines", () => {
    const csv = "name,address,city,country,latitude,longitude,notes,website\nSpot,Rua 1,,,,,,\n\n"
    expect(parseCsvText(csv)).toHaveLength(1)
  })

  it("returns empty array for header-only CSV", () => {
    const csv = "name,address,city,country,latitude,longitude,notes,website"
    expect(parseCsvText(csv)).toHaveLength(0)
  })
})

describe("validateRow", () => {
  const base = { name: "Spot", address: "Rua 1", city: "", country: "Portugal", latitude: "", longitude: "", notes: "", website: "" }

  it("passes when name + address provided", () => {
    expect(validateRow(base, 1)).toHaveLength(0)
  })

  it("passes when name + lat + lng provided", () => {
    expect(validateRow({ ...base, address: "", latitude: "38.72", longitude: "-9.14" }, 1)).toHaveLength(0)
  })

  it("errors when name is missing", () => {
    const errs = validateRow({ ...base, name: "" }, 1)
    expect(errs).toContainEqual({ row: 1, field: "name", message: "name is required" })
  })

  it("errors when neither address nor coordinates provided", () => {
    const errs = validateRow({ ...base, address: "" }, 1)
    expect(errs).toContainEqual({ row: 1, field: "address", message: "address or latitude+longitude is required" })
  })

  it("errors when only latitude provided without longitude", () => {
    const errs = validateRow({ ...base, address: "", latitude: "38.72", longitude: "" }, 1)
    expect(errs.some(e => e.field === "longitude")).toBe(true)
  })

  it("errors on non-numeric latitude", () => {
    const errs = validateRow({ ...base, latitude: "not-a-number", longitude: "-9.14" }, 1)
    expect(errs.some(e => e.field === "latitude")).toBe(true)
  })
})

describe("buildSourceId", () => {
  it("returns a deterministic non-empty string", () => {
    const a = buildSourceId("ada", "Café Central", "Rua do Ouro 12")
    const b = buildSourceId("ada", "Café Central", "Rua do Ouro 12")
    expect(a).toBe(b)
    expect(a.length).toBeGreaterThan(0)
  })

  it("differs for different creators", () => {
    expect(buildSourceId("ada", "Spot", "Rua 1")).not.toBe(buildSourceId("bob", "Spot", "Rua 1"))
  })
})

describe("CSV_TEMPLATE", () => {
  it("is a non-empty string with the expected header", () => {
    expect(CSV_TEMPLATE).toContain("name,address")
  })
})
```

- [ ] Run tests to confirm they fail:

```bash
npm test -- lib/portal/csvParse.test.ts
```

Expected: all tests fail with "Cannot find module './csvParse'"

### Step 1.2 — Implement `lib/portal/csvParse.ts`

- [ ] Create `lib/portal/csvParse.ts`:

```typescript
export const CSV_TEMPLATE =
  "name,address,city,country,latitude,longitude,notes,website\n" +
  "Café Central,Rua do Ouro 12,Lisbon,Portugal,,,Great espresso,\n" +
  "Viewpoint Sintra,,Sintra,Portugal,38.7975,-9.3909,,\n"

export type CsvRow = {
  name: string
  address: string
  city: string
  country: string
  latitude: string
  longitude: string
  notes: string
  website: string
}

export type ValidationError = {
  row: number
  field: string
  message: string
}

export type ParsedPlace = {
  name: string
  address: string | null
  city: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  notes: string | null
  website: string | null
}

// Splits a single CSV line respecting double-quoted fields.
function splitCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim())
      current = ""
    } else {
      current += ch
    }
  }
  fields.push(current.trim())
  return fields
}

export function parseCsvText(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/)
  if (lines.length < 2) return []
  const headers = splitCsvLine(lines[0]).map(h => h.toLowerCase().trim())
  const rows: CsvRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const values = splitCsvLine(line)
    const obj: Record<string, string> = {}
    headers.forEach((h, idx) => { obj[h] = values[idx] ?? "" })
    rows.push({
      name: obj["name"] ?? "",
      address: obj["address"] ?? "",
      city: obj["city"] ?? "",
      country: obj["country"] ?? "",
      latitude: obj["latitude"] ?? "",
      longitude: obj["longitude"] ?? "",
      notes: obj["notes"] ?? "",
      website: obj["website"] ?? "",
    })
  }
  return rows
}

export function validateRow(row: CsvRow, rowNumber: number): ValidationError[] {
  const errors: ValidationError[] = []
  if (!row.name) {
    errors.push({ row: rowNumber, field: "name", message: "name is required" })
  }
  const hasAddress = !!row.address
  const hasLat = !!row.latitude
  const hasLng = !!row.longitude
  if (!hasAddress && !hasLat && !hasLng) {
    errors.push({ row: rowNumber, field: "address", message: "address or latitude+longitude is required" })
  }
  if (hasLat && !hasLng) {
    errors.push({ row: rowNumber, field: "longitude", message: "longitude is required when latitude is provided" })
  }
  if (!hasLat && hasLng) {
    errors.push({ row: rowNumber, field: "latitude", message: "latitude is required when longitude is provided" })
  }
  if (hasLat && isNaN(parseFloat(row.latitude))) {
    errors.push({ row: rowNumber, field: "latitude", message: "latitude must be a number" })
  }
  if (hasLng && isNaN(parseFloat(row.longitude))) {
    errors.push({ row: rowNumber, field: "longitude", message: "longitude must be a number" })
  }
  return errors
}

// Deterministic source_id for deduplication — prevents re-importing the same place.
export function buildSourceId(creatorSlug: string, name: string, addressOrCoords: string): string {
  const input = `${creatorSlug}:${name}:${addressOrCoords}`
  return Buffer.from(input).toString("base64url").slice(0, 48)
}

export function toPlace(row: CsvRow): ParsedPlace {
  return {
    name: row.name,
    address: row.address || null,
    city: row.city || null,
    country: row.country || null,
    latitude: row.latitude ? parseFloat(row.latitude) : null,
    longitude: row.longitude ? parseFloat(row.longitude) : null,
    notes: row.notes || null,
    website: row.website || null,
  }
}
```

- [ ] Run tests:

```bash
npm test -- lib/portal/csvParse.test.ts
```

Expected: all pass.

- [ ] Commit:

```bash
git add lib/portal/csvParse.ts lib/portal/csvParse.test.ts
git commit -m "feat(portal): CSV parser and validator for creator place import"
```

---

## Task 2: Data access layer

**Files:**
- Create: `lib/portal/guides.ts`
- Create: `lib/portal/guides.test.ts`

`getSubmittedGuides` reads `raw_pois WHERE creator_slug = ANY(creators)`. `stageImport` bulk-inserts valid rows in a single parameterised query using dynamic VALUES, with `ON CONFLICT DO NOTHING` to skip re-imports of the same place.

### Step 2.1 — Write the failing tests

- [ ] Create `lib/portal/guides.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest"

const mockQuery = vi.fn()
vi.mock("@/lib/moment/db", () => ({
  getPool: () => ({ query: mockQuery }),
}))

describe("getSubmittedGuides", () => {
  beforeEach(() => { mockQuery.mockReset() })

  it("returns rows from raw_pois for the creator slug", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: "abc", poi_name: "Café", address: "Rua 1", city_raw: "Lisbon", country_raw: "Portugal", latitude: null, longitude: null, ai_status: "staged", created_at: new Date() },
      ],
    })
    const { getSubmittedGuides } = await import("./guides")
    const result = await getSubmittedGuides("ada")
    expect(result).toHaveLength(1)
    expect(result[0].poi_name).toBe("Café")
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("ANY(creators)"),
      expect.arrayContaining(["ada"]),
    )
  })

  it("returns empty array when no rows", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    const { getSubmittedGuides } = await import("./guides")
    expect(await getSubmittedGuides("ada")).toHaveLength(0)
  })
})

describe("stageImport", () => {
  beforeEach(() => { mockQuery.mockReset() })

  it("inserts valid rows and returns inserted count", async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 2 })
    const { stageImport } = await import("./guides")
    const places = [
      { name: "Café", address: "Rua 1", city: null, country: "Portugal", latitude: null, longitude: null, notes: null, website: null },
      { name: "Park", address: "Av. 2", city: "Lisbon", country: "Portugal", latitude: null, longitude: null, notes: null, website: null },
    ]
    const result = await stageImport("ada", places)
    expect(result.inserted).toBe(2)
    expect(mockQuery).toHaveBeenCalledTimes(1)
  })

  it("returns inserted=0 when places array is empty", async () => {
    const { stageImport } = await import("./guides")
    const result = await stageImport("ada", [])
    expect(result.inserted).toBe(0)
    expect(mockQuery).not.toHaveBeenCalled()
  })
})
```

- [ ] Run tests to confirm they fail:

```bash
npm test -- lib/portal/guides.test.ts
```

Expected: fail with "Cannot find module './guides'"

### Step 2.2 — Implement `lib/portal/guides.ts`

- [ ] Create `lib/portal/guides.ts`:

```typescript
import { getPool } from "@/lib/moment/db"
import { buildSourceId, ParsedPlace } from "./csvParse"

export type GuideRow = {
  id: string
  poi_name: string | null
  address: string | null
  city_raw: string | null
  country_raw: string | null
  latitude: number | null
  longitude: number | null
  ai_status: string
  created_at: Date
}

export type StageResult = {
  inserted: number
}

export async function getSubmittedGuides(creatorSlug: string, limit = 50): Promise<GuideRow[]> {
  const pool = getPool()
  const result = await pool.query<GuideRow>(
    `SELECT id, poi_name, address, city_raw, country_raw,
            latitude, longitude, ai_status, created_at
     FROM raw_pois
     WHERE $1 = ANY(creators) AND source = 'creator'
     ORDER BY created_at DESC
     LIMIT $2`,
    [creatorSlug, limit],
  )
  return result.rows
}

export async function stageImport(creatorSlug: string, places: ParsedPlace[]): Promise<StageResult> {
  if (places.length === 0) return { inserted: 0 }

  const pool = getPool()
  // Build multi-row VALUES for a single INSERT.
  // Each row = 10 params: source, creators, source_id, poi_name, address,
  //   city_raw, country_raw, latitude, longitude, raw_data
  const params: unknown[] = []
  const valueParts: string[] = []

  for (const p of places) {
    const base = params.length
    const addressOrCoords = p.address ?? (p.latitude != null ? `${p.latitude},${p.longitude}` : "")
    const sourceId = buildSourceId(creatorSlug, p.name, addressOrCoords)
    params.push(
      "creator",                            // $N+1  source
      [creatorSlug],                        // $N+2  creators (text[])
      sourceId,                             // $N+3  source_id
      p.name,                              // $N+4  poi_name
      p.address,                           // $N+5  address
      p.city,                              // $N+6  city_raw
      p.country,                           // $N+7  country_raw
      p.latitude,                          // $N+8  latitude
      p.longitude,                         // $N+9  longitude
      JSON.stringify({                      // $N+10 raw_data
        notes: p.notes,
        website: p.website,
        imported_via: "creator_csv",
      }),
    )
    valueParts.push(
      `($${base+1}, $${base+2}::text[], $${base+3}, $${base+4}, $${base+5}, ` +
      `$${base+6}, $${base+7}, $${base+8}, $${base+9}, $${base+10}::jsonb)`
    )
  }

  const result = await pool.query(
    `INSERT INTO raw_pois
       (source, creators, source_id, poi_name, address, city_raw, country_raw, latitude, longitude, raw_data)
     VALUES ${valueParts.join(", ")}
     ON CONFLICT (source, source_id) DO NOTHING`,
    params,
  )
  return { inserted: result.rowCount ?? 0 }
}
```

- [ ] Run tests:

```bash
npm test -- lib/portal/guides.test.ts
```

Expected: all pass.

- [ ] Commit:

```bash
git add lib/portal/guides.ts lib/portal/guides.test.ts
git commit -m "feat(portal): guides data layer — getSubmittedGuides + stageImport"
```

---

## Task 3: Import API route

**Files:**
- Create: `app/api/portal/guides/import/route.ts`

Reads the uploaded file from FormData, parses CSV, validates each row, inserts valid rows, returns a JSON result with inserted count and any validation errors. Rows with errors are skipped (not a hard stop).

### Step 3.1 — Implement the route

No test file for this route — it's a thin orchestration layer between the parser (tested) and data layer (tested). Manual verification in Step 3.2.

- [ ] Create `app/api/portal/guides/import/route.ts`:

```typescript
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
    const rowErrors = validateRow(rows[i], i + 2) // row 2 = first data row (row 1 = header)
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
```

### Step 3.2 — Verify manually

- [ ] Start the dev server:

```bash
npm run dev
```

- [ ] Set `PORTAL_DEV_CREATOR_ID` in `.env.local` to a valid creator UUID.

- [ ] Test with curl:

```bash
cat > /tmp/test_places.csv << 'EOF'
name,address,city,country,latitude,longitude,notes,website
Café Central,Rua do Ouro 12,Lisbon,Portugal,,,Good coffee,
Viewpoint Sintra,,Sintra,Portugal,38.7975,-9.3909,,
Bad Row,,,,,,, 
EOF

curl -s -X POST http://localhost:3000/api/portal/guides/import \
  -F "file=@/tmp/test_places.csv" | python3 -m json.tool
```

Expected response:

```json
{
  "inserted": 2,
  "skipped": 1,
  "errors": [
    { "row": 4, "field": "name", "message": "name is required" },
    { "row": 4, "field": "address", "message": "address or latitude+longitude is required" }
  ]
}
```

- [ ] Verify rows appeared in the DB:

```sql
SELECT poi_name, address, creators, ai_status FROM raw_pois WHERE 'your-creator-slug' = ANY(creators) ORDER BY created_at DESC LIMIT 5;
```

- [ ] Commit:

```bash
git add app/api/portal/guides/import/route.ts
git commit -m "feat(portal): POST /api/portal/guides/import — CSV upload to raw_pois"
```

---

## Task 4: GuidesSection component

**Files:**
- Create: `app/portal/_components/GuidesSection.tsx`

Client component. Accepts `initialGuides: GuideRow[]` and `slug: string`. Shows a template download link, a file upload button, import result feedback, and the list of submitted places.

- [ ] Create `app/portal/_components/GuidesSection.tsx`:

```tsx
"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { GuideRow } from "@/lib/portal/guides"
import { CSV_TEMPLATE } from "@/lib/portal/csvParse"

type ImportResult = {
  inserted: number
  skipped: number
  errors: Array<{ row: number; field: string; message: string }>
}

const STATUS_LABELS: Record<string, string> = {
  staged: "Pending review",
  enriched: "Enriched",
  promoted: "Live",
  rejected: "Rejected",
}

export function GuidesSection({ initialGuides }: { initialGuides: GuideRow[] }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "ohana-places-template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setResult(null)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/portal/guides/import", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Import failed")
        return
      }
      setResult(data as ImportResult)
      startTransition(() => { router.refresh() })
    } catch {
      setError("Network error — please try again")
    } finally {
      // Reset input so the same file can be re-selected after fixing errors
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      {/* Actions row */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={downloadTemplate}
          className="text-sm text-muted underline underline-offset-2 hover:text-ink transition-colors"
        >
          Download CSV template
        </button>
        <label className="cursor-pointer">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={handleFileChange}
            disabled={isPending}
          />
          <span
            className="inline-flex items-center rounded-full border border-line bg-surface px-4 py-1.5 text-sm text-ink hover:bg-canvas transition-colors"
          >
            {isPending ? "Importing…" : "Import CSV"}
          </span>
        </label>
      </div>

      {/* Import result */}
      {error && (
        <div className="rounded-lg border border-line bg-surface px-4 py-3 text-sm text-clay">
          {error}
        </div>
      )}
      {result && (
        <div className="rounded-lg border border-line bg-surface px-4 py-3 space-y-2">
          <p className="text-sm text-ink">
            Imported {result.inserted} place{result.inserted !== 1 ? "s" : ""}.
            {result.skipped > 0 && ` ${result.skipped} row${result.skipped !== 1 ? "s" : ""} skipped.`}
          </p>
          {result.errors.length > 0 && (
            <ul className="text-sm text-clay space-y-1">
              {result.errors.map((e, i) => (
                <li key={i}>Row {e.row}: {e.field} — {e.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Submitted guides list */}
      {initialGuides.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface p-8 text-center">
          <p className="text-sm text-muted">
            No places imported yet. Download the template, fill it in, and import your CSV above.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-line bg-surface divide-y divide-line">
          {initialGuides.map(g => (
            <div key={g.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm text-ink">{g.poi_name ?? "Unnamed place"}</p>
                <p className="text-xs text-muted mt-0.5">
                  {[g.city_raw, g.country_raw].filter(Boolean).join(", ") || g.address || "No location"}
                </p>
              </div>
              <span className="text-xs text-muted">{STATUS_LABELS[g.ai_status] ?? g.ai_status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] Commit:

```bash
git add app/portal/_components/GuidesSection.tsx
git commit -m "feat(portal): GuidesSection — CSV upload form + submitted places list"
```

---

## Task 5: Wire portal page

**Files:**
- Modify: `app/portal/page.tsx`

Replace the "Your guides" `<ComingSoon />` with `<GuidesSection>`, passing server-fetched initial guides.

### Step 5.1 — Read the current portal page

The relevant section in `app/portal/page.tsx` currently (lines ~52–55):

```tsx
<section>
  <h2 className="text-xs uppercase tracking-widest text-muted mb-4">Your guides</h2>
  <ComingSoon />
</section>
```

### Step 5.2 — Update `app/portal/page.tsx`

- [ ] Add the import for `getSubmittedGuides` and `GuidesSection` at the top:

```tsx
import { getSubmittedGuides } from "@/lib/portal/guides"
import { GuidesSection } from "./_components/GuidesSection"
```

- [ ] Replace the "Your guides" section:

Before:
```tsx
<section>
  <h2 className="text-xs uppercase tracking-widest text-muted mb-4">Your guides</h2>
  <ComingSoon />
</section>
```

After:
```tsx
<section>
  <h2 className="text-xs uppercase tracking-widest text-muted mb-4">Your guides</h2>
  <GuidesSection initialGuides={guides} />
</section>
```

- [ ] Add the `guides` fetch at the top of `PortalPage`:

Before:
```tsx
export default async function PortalPage() {
  const record = await getAmbassadorRecord()
  if (!record) return null
```

After:
```tsx
export default async function PortalPage() {
  const record = await getAmbassadorRecord()
  if (!record) return null
  const guides = await getSubmittedGuides(record.slug)
```

- [ ] Remove the `ComingSoon` function from the bottom of the file if it is no longer used anywhere else in the file. Check first — if the Earnings section still uses it, leave it.

The Earnings section links to `/portal/payments` (not `<ComingSoon />`), so `ComingSoon` is only used in the guides section. Remove it.

- [ ] Run all tests:

```bash
npm test
```

Expected: 112+ tests pass. (csvParse: 9 new, guides: 4 new)

- [ ] Commit:

```bash
git add app/portal/page.tsx
git commit -m "feat(portal): wire GuidesSection into portal — replace Your guides stub"
```

---

## Verify end-to-end

- [ ] Start dev server: `npm run dev`
- [ ] Set `PORTAL_DEV_CREATOR_ID` in `.env.local` to a valid creator UUID.
- [ ] Visit `http://localhost:3000/portal`
- [ ] Confirm "Your guides" section shows empty state with "Download CSV template" and "Import CSV" buttons.
- [ ] Click "Download CSV template" — confirms file downloads as `ohana-places-template.csv`.
- [ ] Fill in 3 rows (2 valid, 1 missing name) and import.
- [ ] Confirm result banner shows: "Imported 2 places. 1 row skipped." with the error for the bad row.
- [ ] Confirm the two imported places appear in the list with status "Pending review".
- [ ] Re-import the same file — confirm "Imported 0 places" (dedup by source_id via ON CONFLICT DO NOTHING).
