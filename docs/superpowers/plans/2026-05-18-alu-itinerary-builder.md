# Alu Itinerary Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/plan` itinerary builder — the final step of the F&F demo path (Quiz → Twin → Discover → Plan), letting travellers generate a day-by-day itinerary from their saved POIs and email it to themselves.

**Architecture:** A server-side deterministic bin-packer groups the user's saved POIs (loaded from `anonymous_session.saved_pois`) by city and confidence score, writes rows to the `itinerary` + `itinerary_item` tables, then serves a read-only day-by-day view. Transactional email uses the Resend API. No LLM calls anywhere in this flow.

**Tech Stack:** Next.js 15 App Router (params are Promises), TypeScript, pg (via `getPool()`), Resend (email), Vitest + React Testing Library (tests).

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `lib/plan/types.ts` | Create | Shared TS types: `Itinerary`, `ItineraryDay`, `ItineraryItem`, `ItinerarySummary` |
| `lib/plan/db.ts` | Create | DB queries: `createItinerary`, `getItinerary`, `listItineraries` |
| `lib/plan/db.test.ts` | Create | Unit tests for DB layer with mocked pool |
| `lib/plan/email.ts` | Create | `sendItineraryEmail(to, itinerary)` via Resend |
| `app/plan/layout.tsx` | Create | Auth gate via `requireTwin()`, reuses `HomeNav` |
| `app/plan/page.tsx` | Create | Server component — loads saved POIs, renders shell |
| `app/plan/_components/PlanForm.tsx` | Create | Client component — day picker + generate button |
| `app/api/plan/generate/route.ts` | Create | POST — validate body, call `createItinerary`, return `{ itineraryId }` |
| `app/api/plan/generate/route.test.ts` | Create | Unit tests for generate route |
| `app/api/plan/[id]/route.ts` | Create | GET — fetch itinerary owned by session user |
| `app/api/plan/[id]/send/route.ts` | Create | POST — send itinerary email |
| `app/plan/[id]/page.tsx` | Create | Server component — day-by-day view |
| `app/plan/[id]/_components/SendEmailButton.tsx` | Create | Client button that calls the send route |
| `app/home/page.tsx` | Modify | Replace journeys stub (lines 155-177) with live `listItineraries` cards |

---

## Task 1: Shared types

**Files:**
- Create: `lib/plan/types.ts`

- [ ] **Step 1: Create the types file**

```typescript
// lib/plan/types.ts
export interface ItineraryItem {
  id: string
  poiId: string
  dayIndex: number
  sortOrder: number
  name: string
  shortDescription: string | null
  photoUrl: string | null
  cityName: string | null
  poiType: string | null
}

export interface ItineraryDay {
  dayIndex: number
  items: ItineraryItem[]
}

export interface Itinerary {
  id: string
  title: string
  status: string
  ownerUserId: string
  createdAt: string
  days: ItineraryDay[]
}

export interface ItinerarySummary {
  id: string
  title: string
  status: string
  createdAt: string
  itemCount: number
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/plan/types.ts
git commit -m "feat(plan): add shared Itinerary types"
```

---

## Task 2: DB layer + tests

**Files:**
- Create: `lib/plan/db.ts`
- Create: `lib/plan/db.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// lib/plan/db.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest"

const mockQuery = vi.fn()
vi.mock("@/lib/moment/db", () => ({
  getPool: () => ({ query: mockQuery }),
  isUuid: (v: unknown) => typeof v === "string" && /^[0-9a-f-]{36}$/.test(v),
}))

const POI_ID_1 = "aaaaaaaa-0000-0000-0000-000000000001"
const POI_ID_2 = "bbbbbbbb-0000-0000-0000-000000000002"
const ITIN_ID = "cccccccc-0000-0000-0000-000000000003"
const USER_ID = "dddddddd-0000-0000-0000-000000000004"

describe("createItinerary", () => {
  beforeEach(() => vi.clearAllMocks())

  it("inserts itinerary row and items, returns id", async () => {
    mockQuery
      // 1. poi_final fetch
      .mockResolvedValueOnce({
        rows: [
          { id: POI_ID_1, name: "Senso-ji", short_description: "Temple", photos: [], city_name: "tokyo", poi_type: "temple", confidence_score: 0.9 },
          { id: POI_ID_2, name: "Fushimi Inari", short_description: "Shrine", photos: [], city_name: "kyoto", poi_type: "shrine", confidence_score: 0.8 },
        ],
      })
      // 2. INSERT itinerary RETURNING id
      .mockResolvedValueOnce({ rows: [{ id: ITIN_ID }] })
      // 3. INSERT itinerary_item (bulk)
      .mockResolvedValueOnce({ rows: [] })

    const { createItinerary } = await import("./db")
    const id = await createItinerary(USER_ID, "2-day trip", [POI_ID_1, POI_ID_2], 2)

    expect(id).toBe(ITIN_ID)
    expect(mockQuery).toHaveBeenCalledTimes(3)
    // Verify the itinerary INSERT used the right owner
    const itinCall = mockQuery.mock.calls[1]
    expect(itinCall[1]).toEqual([USER_ID, "2-day trip"])
  })

  it("skips itinerary_item insert when no POIs match in poi_final", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] }) // poi_final returns nothing
      .mockResolvedValueOnce({ rows: [{ id: ITIN_ID }] }) // itinerary INSERT

    const { createItinerary } = await import("./db")
    const id = await createItinerary(USER_ID, "empty trip", [], 1)

    expect(id).toBe(ITIN_ID)
    expect(mockQuery).toHaveBeenCalledTimes(2) // no 3rd call for items
  })
})

describe("getItinerary", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns null when itinerary not found", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] }) // itinerary select
    const { getItinerary } = await import("./db")
    const result = await getItinerary(ITIN_ID, USER_ID)
    expect(result).toBeNull()
  })

  it("returns structured Itinerary with days", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [{ id: ITIN_ID, title: "2-day trip", status: "draft", owner_user_id: USER_ID, created_at: "2026-05-18T00:00:00Z" }],
      })
      .mockResolvedValueOnce({
        rows: [
          { id: "item-1", poi_id: POI_ID_1, day_index: 0, sort_order: 0, name: "Senso-ji", short_description: "Temple", photos: [], city_name: "tokyo", poi_type: "temple" },
          { id: "item-2", poi_id: POI_ID_2, day_index: 1, sort_order: 0, name: "Fushimi Inari", short_description: "Shrine", photos: [], city_name: "kyoto", poi_type: "shrine" },
        ],
      })

    const { getItinerary } = await import("./db")
    const result = await getItinerary(ITIN_ID, USER_ID)

    expect(result).not.toBeNull()
    expect(result!.id).toBe(ITIN_ID)
    expect(result!.days).toHaveLength(2)
    expect(result!.days[0].dayIndex).toBe(0)
    expect(result!.days[0].items[0].name).toBe("Senso-ji")
    expect(result!.days[1].items[0].name).toBe("Fushimi Inari")
  })
})

describe("listItineraries", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns an empty array when no itineraries exist", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    const { listItineraries } = await import("./db")
    const result = await listItineraries(USER_ID)
    expect(result).toEqual([])
  })

  it("returns summary array ordered by created_at desc", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: ITIN_ID, title: "2-day trip", status: "draft", created_at: "2026-05-18T00:00:00Z", item_count: "4" },
      ],
    })
    const { listItineraries } = await import("./db")
    const result = await listItineraries(USER_ID)

    expect(result).toHaveLength(1)
    expect(result[0].itemCount).toBe(4)
    expect(result[0].title).toBe("2-day trip")
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- lib/plan/db.test.ts
```

Expected: FAIL with "Cannot find module './db'"

- [ ] **Step 3: Implement the DB layer**

```typescript
// lib/plan/db.ts
import { getPool } from "@/lib/moment/db"
import type { Itinerary, ItineraryItem, ItinerarySummary } from "./types"

interface PoiRow {
  id: string
  name: string
  short_description: string | null
  photos: unknown
  city_name: string | null
  poi_type: string | null
  confidence_score: number | null
}

interface ItineraryRow {
  id: string
  title: string
  status: string
  owner_user_id: string
  created_at: string
}

interface ItineraryItemRow {
  id: string
  poi_id: string
  day_index: number
  sort_order: number
  name: string
  short_description: string | null
  photos: unknown
  city_name: string | null
  poi_type: string | null
}

function extractFirstPhoto(photos: unknown): string | null {
  if (!Array.isArray(photos) || photos.length === 0) return null
  const first = photos[0]
  if (typeof first === "string") return first
  if (first && typeof first === "object") {
    const obj = first as Record<string, unknown>
    const candidate = obj.url ?? obj.src ?? obj.href
    if (typeof candidate === "string") return candidate
  }
  return null
}

export async function createItinerary(
  ownerUserId: string,
  title: string,
  poiIds: string[],
  days: number,
): Promise<string> {
  const pool = getPool()

  // Fetch POIs from poi_final to get city and confidence info
  const poiResult = await pool.query<PoiRow>(
    `SELECT id, name, short_description, photos, city_name, poi_type, confidence_score
     FROM poi_final
     WHERE id = ANY($1) AND operational_status = 'active'`,
    [poiIds],
  )

  // Sort: city_name ASC (keeps same-city POIs together), confidence_score DESC within city
  const pois = poiResult.rows.sort((a, b) => {
    const cityA = a.city_name ?? ""
    const cityB = b.city_name ?? ""
    if (cityA !== cityB) return cityA.localeCompare(cityB)
    return (b.confidence_score ?? 0) - (a.confidence_score ?? 0)
  })

  const poisPerDay = Math.max(1, Math.ceil(pois.length / days))

  const itinResult = await pool.query<{ id: string }>(
    `INSERT INTO itinerary (owner_user_id, title, status)
     VALUES ($1, $2, 'draft')
     RETURNING id`,
    [ownerUserId, title],
  )
  const itineraryId = itinResult.rows[0].id

  if (pois.length > 0) {
    const placeholders: string[] = []
    const vals: unknown[] = []
    pois.forEach((poi, i) => {
      const dayIndex = Math.floor(i / poisPerDay)
      const base = i * 4
      placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`)
      vals.push(itineraryId, poi.id, dayIndex, i)
    })
    await pool.query(
      `INSERT INTO itinerary_item (itinerary_id, poi_id, day_index, sort_order) VALUES ${placeholders.join(", ")}`,
      vals,
    )
  }

  return itineraryId
}

export async function getItinerary(id: string, ownerUserId: string): Promise<Itinerary | null> {
  const pool = getPool()

  const itinResult = await pool.query<ItineraryRow>(
    `SELECT id, title, status, owner_user_id, created_at
     FROM itinerary
     WHERE id = $1 AND owner_user_id = $2`,
    [id, ownerUserId],
  )
  if (!itinResult.rows[0]) return null
  const row = itinResult.rows[0]

  const itemsResult = await pool.query<ItineraryItemRow>(
    `SELECT ii.id, ii.poi_id, ii.day_index, ii.sort_order,
            pf.name, pf.short_description, pf.photos, pf.city_name, pf.poi_type
     FROM itinerary_item ii
     JOIN poi_final pf ON pf.id = ii.poi_id
     WHERE ii.itinerary_id = $1
     ORDER BY ii.day_index ASC, ii.sort_order ASC`,
    [id],
  )

  const itemsByDay = new Map<number, ItineraryItem[]>()
  for (const item of itemsResult.rows) {
    const dayItems = itemsByDay.get(item.day_index) ?? []
    dayItems.push({
      id: item.id,
      poiId: item.poi_id,
      dayIndex: item.day_index,
      sortOrder: item.sort_order,
      name: item.name,
      shortDescription: item.short_description,
      photoUrl: extractFirstPhoto(item.photos),
      cityName: item.city_name,
      poiType: item.poi_type,
    })
    itemsByDay.set(item.day_index, dayItems)
  }

  const days = Array.from(itemsByDay.entries())
    .sort(([a], [b]) => a - b)
    .map(([dayIndex, items]) => ({ dayIndex, items }))

  return {
    id: row.id,
    title: row.title,
    status: row.status,
    ownerUserId: row.owner_user_id,
    createdAt: row.created_at,
    days,
  }
}

export async function listItineraries(userId: string): Promise<ItinerarySummary[]> {
  const result = await getPool().query<{
    id: string
    title: string
    status: string
    created_at: string
    item_count: string
  }>(
    `SELECT i.id, i.title, i.status, i.created_at,
            COUNT(ii.id) AS item_count
     FROM itinerary i
     LEFT JOIN itinerary_item ii ON ii.itinerary_id = i.id
     WHERE i.owner_user_id = $1
     GROUP BY i.id
     ORDER BY i.created_at DESC`,
    [userId],
  )
  return result.rows.map((r) => ({
    id: r.id,
    title: r.title,
    status: r.status,
    createdAt: r.created_at,
    itemCount: parseInt(r.item_count, 10),
  }))
}
```

- [ ] **Step 4: Run tests and confirm they pass**

```bash
npm test -- lib/plan/db.test.ts
```

Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/plan/db.ts lib/plan/db.test.ts
git commit -m "feat(plan): DB layer — createItinerary, getItinerary, listItineraries"
```

---

## Task 3: Generate route + tests

**Files:**
- Create: `app/api/plan/generate/route.ts`
- Create: `app/api/plan/generate/route.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// app/api/plan/generate/route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

const mockGetTwinSession = vi.fn()
vi.mock("@/lib/auth/session", () => ({ getTwinSession: () => mockGetTwinSession() }))

const mockCreateItinerary = vi.fn()
vi.mock("@/lib/plan/db", () => ({ createItinerary: (...args: unknown[]) => mockCreateItinerary(...args) }))

vi.mock("@/lib/moment/db", () => ({
  isUuid: (v: unknown) => typeof v === "string" && /^[0-9a-f-]{36}$/.test(v),
}))

const USER_ID = "dddddddd-0000-0000-0000-000000000004"
const ITIN_ID = "cccccccc-0000-0000-0000-000000000003"
const POI_ID_1 = "aaaaaaaa-0000-0000-0000-000000000001"

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/plan/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("POST /api/plan/generate", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns 401 when not authenticated", async () => {
    mockGetTwinSession.mockResolvedValue(null)
    const { POST } = await import("./route")
    const res = await POST(makeRequest({ savedPoiIds: [POI_ID_1], days: 3 }))
    expect(res.status).toBe(401)
  })

  it("returns 400 when body is missing savedPoiIds", async () => {
    mockGetTwinSession.mockResolvedValue({ user: { id: USER_ID } })
    const { POST } = await import("./route")
    const res = await POST(makeRequest({ days: 3 }))
    expect(res.status).toBe(400)
  })

  it("returns 400 when savedPoiIds contains no valid UUIDs", async () => {
    mockGetTwinSession.mockResolvedValue({ user: { id: USER_ID } })
    const { POST } = await import("./route")
    const res = await POST(makeRequest({ savedPoiIds: ["not-a-uuid"], days: 2 }))
    expect(res.status).toBe(400)
  })

  it("returns itineraryId on success", async () => {
    mockGetTwinSession.mockResolvedValue({ user: { id: USER_ID } })
    mockCreateItinerary.mockResolvedValue(ITIN_ID)
    const { POST } = await import("./route")
    const res = await POST(makeRequest({ savedPoiIds: [POI_ID_1], days: 2 }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.itineraryId).toBe(ITIN_ID)
    expect(mockCreateItinerary).toHaveBeenCalledWith(USER_ID, "2-day trip", [POI_ID_1], 2)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- app/api/plan/generate/route.test.ts
```

Expected: FAIL with "Cannot find module './route'"

- [ ] **Step 3: Implement the generate route**

```typescript
// app/api/plan/generate/route.ts
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
```

- [ ] **Step 4: Run tests and confirm they pass**

```bash
npm test -- app/api/plan/generate/route.test.ts
```

Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add app/api/plan/generate/route.ts app/api/plan/generate/route.test.ts
git commit -m "feat(plan): POST /api/plan/generate — deterministic bin-packing itinerary"
```

---

## Task 4: GET itinerary + send email routes

**Files:**
- Create: `app/api/plan/[id]/route.ts`
- Create: `app/api/plan/[id]/send/route.ts`

- [ ] **Step 1: Create the GET /api/plan/[id] route**

```typescript
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
```

- [ ] **Step 2: Create the POST /api/plan/[id]/send route**

```typescript
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
```

- [ ] **Step 3: Commit**

```bash
git add app/api/plan/[id]/route.ts app/api/plan/[id]/send/route.ts
git commit -m "feat(plan): GET /api/plan/[id] and POST /api/plan/[id]/send"
```

---

## Task 5: Email library

**Files:**
- Create: `lib/plan/email.ts`

- [ ] **Step 1: Install Resend**

```bash
npm install resend
```

- [ ] **Step 2: Add RESEND_API_KEY to your local .env.local**

```
RESEND_API_KEY=re_your_key_here
```

> Get a key at resend.com. For demo, use the sandbox domain — emails send but only land in Resend's dashboard.

- [ ] **Step 3: Implement the email module**

```typescript
// lib/plan/email.ts
import { Resend } from "resend"
import type { Itinerary } from "./types"

const resend = new Resend(process.env.RESEND_API_KEY)

function buildHtml(itinerary: Itinerary): string {
  const daysHtml = itinerary.days
    .map((day) => {
      const itemsHtml = day.items
        .map(
          (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e5e0d8;">
            <strong style="display:block;font-size:15px;color:#2a2218;">${item.name}</strong>
            ${item.cityName ? `<span style="font-size:11px;color:#8a7e6e;text-transform:capitalize;">${item.cityName}</span>` : ""}
            ${item.shortDescription ? `<p style="margin:4px 0 0;font-size:13px;color:#8a7e6e;line-height:1.4;">${item.shortDescription}</p>` : ""}
          </td>
        </tr>`,
        )
        .join("")
      return `
      <h2 style="font-family:Georgia,serif;font-size:18px;font-weight:400;margin:28px 0 8px;color:#2a2218;">
        Day ${day.dayIndex + 1}
      </h2>
      <table style="width:100%;border-collapse:collapse;">${itemsHtml}</table>`
    })
    .join("")

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:32px 24px;color:#2a2218;background:#faf7f2;">
  <h1 style="font-size:28px;font-weight:400;margin-bottom:4px;line-height:1.1;">${itinerary.title}</h1>
  <p style="font-size:13px;color:#8a7e6e;margin-top:4px;">Your Ohana itinerary</p>
  ${daysHtml}
  <hr style="border:none;border-top:1px solid #e5e0d8;margin:32px 0;">
  <p style="font-size:11px;color:#8a7e6e;">
    Generated by <a href="https://ohana.travel" style="color:#8a7e6e;">Ohana</a>
  </p>
</body>
</html>`
}

export async function sendItineraryEmail(to: string, itinerary: Itinerary): Promise<void> {
  await resend.emails.send({
    from: "Ohana <hello@ohana.travel>",
    to,
    subject: itinerary.title,
    html: buildHtml(itinerary),
  })
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/plan/email.ts package.json package-lock.json
git commit -m "feat(plan): sendItineraryEmail via Resend"
```

---

## Task 6: Plan layout + planner shell page

**Files:**
- Create: `app/plan/layout.tsx`
- Create: `app/plan/page.tsx`
- Create: `app/plan/_components/PlanForm.tsx`

- [ ] **Step 1: Create the layout**

```typescript
// app/plan/layout.tsx
import type { Metadata } from "next"
import { requireTwin } from "@/lib/auth/session"
import { HomeNav } from "@/app/home/_components/HomeNav"

export const metadata: Metadata = {
  title: "Plan — Ohana",
  robots: { index: false },
}

export default async function PlanLayout({ children }: { children: React.ReactNode }) {
  const user = await requireTwin()
  return (
    <>
      <HomeNav userName={user.name} />
      <main className="min-h-dvh bg-canvas text-ink">{children}</main>
    </>
  )
}
```

- [ ] **Step 2: Create the planner shell page**

```typescript
// app/plan/page.tsx
import { getTwinData } from "@/lib/twin/data"
import { PlanForm } from "./_components/PlanForm"

export default async function PlanPage() {
  const twin = await getTwinData()
  const savedPois = twin?.savedPois ?? []

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-8">
      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontVariationSettings: '"opsz" 144',
          fontWeight: 400,
          fontSize: "clamp(2rem, 5vw, 3rem)",
          color: "var(--color-ink)",
          lineHeight: 1,
        }}
      >
        Plan your trip
      </h1>
      <p className="mt-2 mb-8 text-sm" style={{ color: "var(--color-muted)" }}>
        Build a day-by-day itinerary from your saved places.
      </p>

      {savedPois.length === 0 ? (
        <div
          className="rounded-xl border border-line p-8 text-center"
          style={{ background: "var(--color-surface)" }}
        >
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 400,
              fontVariationSettings: '"opsz" 72',
              fontSize: "1.25rem",
              color: "var(--color-ink)",
            }}
          >
            No saved places yet.
          </p>
          <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
            <a
              href="/discover"
              className="underline underline-offset-2 hover:text-ink transition-colors"
            >
              Discover places
            </a>{" "}
            to add them here.
          </p>
        </div>
      ) : (
        <PlanForm savedPois={savedPois} />
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create the PlanForm client component**

```typescript
// app/plan/_components/PlanForm.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { SavedPoi } from "@/lib/twin/data"

export function PlanForm({ savedPois }: { savedPois: SavedPoi[] }) {
  const [days, setDays] = useState(3)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savedPoiIds: savedPois.map((p) => p.id), days }),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error ?? "Failed to generate itinerary")
      }
      const { itineraryId } = (await res.json()) as { itineraryId: string }
      router.push(`/plan/${itineraryId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <section>
        <h2
          className="text-[11px] uppercase tracking-widest mb-4"
          style={{ color: "var(--color-muted)" }}
        >
          Your saved places ({savedPois.length})
        </h2>
        <div className="flex flex-col gap-3 mb-8">
          {savedPois.map((poi) => (
            <div
              key={poi.id}
              className="flex items-start gap-4 rounded-xl border border-line p-4"
              style={{ background: "var(--color-surface)" }}
            >
              <div className="min-w-0">
                <p className="font-medium text-ink text-[15px] leading-snug">{poi.name}</p>
                {poi.poiType && (
                  <p
                    className="text-[11px] uppercase tracking-wide mt-0.5"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {poi.poiType}
                  </p>
                )}
                {poi.shortDescription && (
                  <p
                    className="text-[13px] mt-1 leading-snug line-clamp-2"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {poi.shortDescription}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mb-6">
          <label
            htmlFor="days"
            className="text-[11px] uppercase tracking-widest"
            style={{ color: "var(--color-muted)" }}
          >
            Days
          </label>
          <input
            id="days"
            type="number"
            min={1}
            max={30}
            value={days}
            onChange={(e) =>
              setDays(Math.max(1, Math.min(30, parseInt(e.target.value, 10) || 1)))
            }
            className="w-20 rounded-lg border border-line px-3 py-2 text-sm"
            style={{ background: "var(--color-surface)", color: "var(--color-ink)" }}
          />
        </div>

        {error && (
          <p className="text-sm mb-4" style={{ color: "oklch(0.5 0.2 27)" }}>
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-xl px-6 py-3 text-sm font-medium transition-opacity disabled:opacity-50"
          style={{ background: "var(--color-clay)", color: "var(--color-canvas)" }}
        >
          {loading ? "Generating…" : "Generate itinerary"}
        </button>
      </section>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/plan/layout.tsx app/plan/page.tsx app/plan/_components/PlanForm.tsx
git commit -m "feat(plan): /plan layout, planner shell page, and PlanForm client component"
```

---

## Task 7: Day-by-day itinerary view

**Files:**
- Create: `app/plan/[id]/page.tsx`
- Create: `app/plan/[id]/_components/SendEmailButton.tsx`

- [ ] **Step 1: Create the SendEmailButton client component**

```typescript
// app/plan/[id]/_components/SendEmailButton.tsx
"use client"

import { useState } from "react"

export function SendEmailButton({ itineraryId }: { itineraryId: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle")

  async function handleSend() {
    setState("sending")
    try {
      const res = await fetch(`/api/plan/${itineraryId}/send`, { method: "POST" })
      setState(res.ok ? "sent" : "error")
    } catch {
      setState("error")
    }
  }

  const labels: Record<typeof state, string> = {
    idle: "Email this itinerary to me",
    sending: "Sending…",
    sent: "Sent! Check your inbox.",
    error: "Failed to send. Try again.",
  }

  return (
    <button
      type="button"
      onClick={state === "error" ? handleSend : undefined}
      disabled={state === "sending" || state === "sent"}
      className="text-sm underline underline-offset-2 hover:text-ink transition-colors disabled:opacity-50"
      style={{ color: "var(--color-muted)", background: "none", border: "none", cursor: state === "idle" || state === "error" ? "pointer" : "default", padding: 0 }}
    >
      {labels[state]}
    </button>
  )
}
```

- [ ] **Step 2: Create the itinerary view page**

```typescript
// app/plan/[id]/page.tsx
import { requireTwin } from "@/lib/auth/session"
import { getItinerary } from "@/lib/plan/db"
import { notFound } from "next/navigation"
import { SendEmailButton } from "./_components/SendEmailButton"

export default async function ItineraryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireTwin()
  const { id } = await params
  const itinerary = await getItinerary(id, user.id)
  if (!itinerary) notFound()

  const totalPlaces = itinerary.days.reduce((sum, d) => sum + d.items.length, 0)

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-8">
      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontVariationSettings: '"opsz" 144',
          fontWeight: 400,
          fontSize: "clamp(2rem, 5vw, 3rem)",
          color: "var(--color-ink)",
          lineHeight: 1,
        }}
      >
        {itinerary.title}
      </h1>
      <p className="mt-1 mb-10 text-sm" style={{ color: "var(--color-muted)" }}>
        {itinerary.days.length} {itinerary.days.length === 1 ? "day" : "days"} &middot; {totalPlaces}{" "}
        {totalPlaces === 1 ? "place" : "places"}
      </p>

      <div className="flex flex-col gap-10">
        {itinerary.days.map((day) => (
          <section key={day.dayIndex}>
            <h2
              className="text-[11px] uppercase tracking-widest mb-4"
              style={{ color: "var(--color-muted)" }}
            >
              Day {day.dayIndex + 1}
              {day.items[0]?.cityName && (
                <span
                  className="ml-2 capitalize"
                  style={{ textTransform: "capitalize", letterSpacing: "normal" }}
                >
                  — {day.items[0].cityName}
                </span>
              )}
            </h2>
            <div className="flex flex-col gap-3">
              {day.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 rounded-xl border border-line p-4"
                  style={{ background: "var(--color-surface)" }}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-ink text-[15px] leading-snug">{item.name}</p>
                    {item.poiType && (
                      <p
                        className="text-[11px] uppercase tracking-wide mt-0.5"
                        style={{ color: "var(--color-muted)" }}
                      >
                        {item.poiType}
                      </p>
                    )}
                    {item.shortDescription && (
                      <p
                        className="text-[13px] mt-1 leading-snug line-clamp-2"
                        style={{ color: "var(--color-muted)" }}
                      >
                        {item.shortDescription}
                      </p>
                    )}
                    {item.cityName && (
                      <p
                        className="text-[11px] mt-1 capitalize"
                        style={{ color: "var(--color-muted)" }}
                      >
                        {item.cityName}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10">
        <SendEmailButton itineraryId={id} />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/plan/[id]/page.tsx app/plan/[id]/_components/SendEmailButton.tsx
git commit -m "feat(plan): day-by-day itinerary view and email send button"
```

---

## Task 8: Wire home journeys section

**Files:**
- Modify: `app/home/page.tsx` (lines 155-177, the journeys stub)

- [ ] **Step 1: Add imports to app/home/page.tsx**

At the top of the file, add after the existing imports:

```typescript
import { listItineraries } from "@/lib/plan/db"
import type { ItinerarySummary } from "@/lib/plan/types"
```

- [ ] **Step 2: Fetch itineraries in the page body**

After `const greetingText = greeting(new Date(), userName?.split(" ")[0])`, add:

```typescript
const itineraries: ItinerarySummary[] = session?.user?.id
  ? await listItineraries(session.user.id)
  : []
```

- [ ] **Step 3: Replace the journeys stub**

Replace the entire `{/* ── Your journeys (stub) ── */}` section (lines 155-177) with:

```tsx
{/* ── Your journeys ── */}
<section className="mt-10 px-4">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-[11px] uppercase tracking-widest text-muted">Your journeys</h2>
    <a
      href="/plan"
      className="text-[11px] underline underline-offset-2 hover:text-ink transition-colors"
      style={{ color: "var(--color-muted)" }}
    >
      Plan a trip
    </a>
  </div>

  {itineraries.length === 0 ? (
    <div
      className="rounded-xl border border-line p-8 text-center"
      style={{ background: "var(--color-surface)" }}
    >
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 400,
          fontVariationSettings: '"opsz" 72',
          fontSize: "1.25rem",
          color: "var(--color-ink)",
        }}
      >
        Your adventures are being woven together.
      </p>
      <p className="mt-2 text-sm text-muted">
        <a
          href="/plan"
          className="underline underline-offset-2 hover:text-ink transition-colors"
        >
          Build your first itinerary
        </a>{" "}
        from your saved places.
      </p>
    </div>
  ) : (
    <div className="flex flex-col gap-3">
      {itineraries.map((itin) => (
        <a
          key={itin.id}
          href={`/plan/${itin.id}`}
          className="flex items-center justify-between rounded-xl border border-line p-4 hover:border-clay transition-colors"
          style={{ background: "var(--color-surface)" }}
        >
          <div>
            <p className="font-medium text-ink text-[15px] leading-snug">{itin.title}</p>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--color-muted)" }}>
              {itin.itemCount} {itin.itemCount === 1 ? "place" : "places"}
            </p>
          </div>
          <span className="text-[11px]" style={{ color: "var(--color-muted)" }}>
            →
          </span>
        </a>
      ))}
    </div>
  )}
</section>
```

- [ ] **Step 4: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add app/home/page.tsx
git commit -m "feat(home): wire Your journeys section to listItineraries"
```

---

## Task 9: Smoke test in dev

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Navigate the F&F demo path**

1. Go to `/moment` — complete the quiz if not done
2. Go to `/discover` — save at least 2 POIs
3. Go to `/home` — verify "Your journeys" shows "Build your first itinerary" with a Plan link
4. Go to `/plan` — verify saved places appear in the list
5. Set days to 2, click "Generate itinerary" — verify redirect to `/plan/[id]`
6. On the itinerary page — verify day columns, POI names, cities
7. Click "Email this itinerary to me" — verify "Sent!" state (or Resend sandbox log)
8. Go back to `/home` — verify the itinerary card appears in "Your journeys"

- [ ] **Step 3: Verify TypeScript passes**

```bash
npx tsc --noEmit
```

Expected: No errors

- [ ] **Step 4: Run all tests**

```bash
npm test
```

Expected: All existing tests + new tests PASS

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat(plan): Sprint 6 — Alu itinerary builder complete (F&F demo path)"
```
