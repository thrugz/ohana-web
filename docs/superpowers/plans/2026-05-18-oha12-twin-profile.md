# OHA-12 Traveller Twin: Profile, Export & Discovery Biasing

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let travellers edit their Twin profile (countries visited + mood/theme preferences), download a JSON report, and have Discovery automatically widen results based on their saved preferences.

**Architecture:** A new `traveller_profile` table stores per-user preferences separately from `anonymous_session`. A data layer (`lib/twin/profile.ts`) handles reads/writes. The profile page is a Server Component that fetches initial data and mounts a Client Component for stateful editing with autosave. Discovery biasing is an additive OR clause in the wej query when a session user has a saved profile.

**Tech Stack:** Next.js 15 App Router, PostgreSQL (raw SQL via `getPool()`), Tailwind + CSS design tokens, Vitest + React Testing Library, TypeScript.

---

## File Map

**New files:**
- `ohana-infra/migrations/070_traveller_profile.sql` — creates `traveller_profile` table
- `lib/twin/profile.ts` — `getProfile(userId)` + `upsertProfile(userId, patch)`
- `lib/twin/profile.test.ts` — unit tests for the data layer
- `app/api/twin/profile/route.ts` — PATCH `/api/twin/profile`
- `app/api/twin/profile/profile.test.ts` — pure-function unit tests for the PATCH handler
- `app/api/twin/export/route.ts` — GET `/api/twin/export`
- `app/api/twin/export/export.test.ts` — unit tests
- `app/home/profile/page.tsx` — Server Component: fetches data, renders `<ProfileEditor>`
- `app/home/profile/_components/ProfileEditor.tsx` — Client Component: stateful form, autosave

**Modified files:**
- `app/home/_components/HomeNav.tsx` — add Profile link
- `app/home/page.tsx` — add completeness bar + export button
- `lib/twin/data.ts` — extend `TwinData` with `preferredMoods` + `preferredThemes`, read from `traveller_profile`
- `app/api/discover/wej/route.ts` — bias query with `preferred_moods` when session exists

---

## Task 1: Migration — `traveller_profile` table

**Files:**
- Create: `ohana-infra/migrations/070_traveller_profile.sql`

- [ ] **Step 1: Write the migration**

```sql
-- 070_traveller_profile.sql
--
-- Per-user Twin profile: manually edited preferences that extend the
-- Moment interview data stored in anonymous_session. Idempotent.

CREATE TABLE IF NOT EXISTS traveller_profile (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL UNIQUE REFERENCES traveller_users(id) ON DELETE CASCADE,
    visited_countries   TEXT[] NOT NULL DEFAULT '{}',
    preferred_moods     TEXT[] NOT NULL DEFAULT '{}',
    preferred_themes    TEXT[] NOT NULL DEFAULT '{}',
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS traveller_profile_user_idx ON traveller_profile (user_id);
```

- [ ] **Step 2: Run the migration against your local database**

```bash
psql "$DATABASE_URL" -f ohana-infra/migrations/070_traveller_profile.sql
```

Expected: `CREATE TABLE`, `CREATE INDEX` (or `NOTICE: ... already exists` if re-running).

- [ ] **Step 3: Commit**

```bash
git -C ../ohana-infra add migrations/070_traveller_profile.sql
git -C ../ohana-infra commit -m "feat: traveller_profile table for editable Twin preferences"
```

---

## Task 2: Data layer — `lib/twin/profile.ts`

**Files:**
- Create: `lib/twin/profile.ts`
- Create: `lib/twin/profile.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// lib/twin/profile.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest"

const mockQuery = vi.fn()
vi.mock("@/lib/moment/db", () => ({ getPool: () => ({ query: mockQuery }) }))

describe("getProfile", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns null when no row exists", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    const { getProfile } = await import("./profile")
    expect(await getProfile("00000000-0000-0000-0000-000000000001")).toBeNull()
  })

  it("maps row columns to camelCase fields", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{
        visited_countries: ["japan", "france"],
        preferred_moods: ["serene"],
        preferred_themes: ["food"],
      }],
    })
    const { getProfile } = await import("./profile")
    const result = await getProfile("00000000-0000-0000-0000-000000000001")
    expect(result).toEqual({
      visitedCountries: ["japan", "france"],
      preferredMoods: ["serene"],
      preferredThemes: ["food"],
    })
  })
})

describe("upsertProfile", () => {
  beforeEach(() => vi.clearAllMocks())

  it("sends an upsert query with the provided patch fields", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    const { upsertProfile } = await import("./profile")
    await upsertProfile("00000000-0000-0000-0000-000000000001", {
      visitedCountries: ["brazil"],
    })
    expect(mockQuery).toHaveBeenCalledOnce()
    const [sql, params] = mockQuery.mock.calls[0]
    expect(sql).toMatch(/INSERT INTO traveller_profile/i)
    expect(sql).toMatch(/ON CONFLICT \(user_id\)/i)
    expect(params[0]).toBe("00000000-0000-0000-0000-000000000001")
    expect(params[1]).toEqual(["brazil"])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test lib/twin/profile.test.ts
```

Expected: FAIL (module not found).

- [ ] **Step 3: Write the implementation**

```ts
// lib/twin/profile.ts
import { getPool } from "@/lib/moment/db"

export interface TravellerProfile {
  visitedCountries: string[]
  preferredMoods: string[]
  preferredThemes: string[]
}

export interface ProfilePatch {
  visitedCountries?: string[]
  preferredMoods?: string[]
  preferredThemes?: string[]
}

export async function getProfile(userId: string): Promise<TravellerProfile | null> {
  const result = await getPool().query<{
    visited_countries: string[]
    preferred_moods: string[]
    preferred_themes: string[]
  }>(
    `SELECT visited_countries, preferred_moods, preferred_themes
     FROM traveller_profile
     WHERE user_id = $1`,
    [userId],
  )
  const row = result.rows[0]
  if (!row) return null
  return {
    visitedCountries: row.visited_countries,
    preferredMoods: row.preferred_moods,
    preferredThemes: row.preferred_themes,
  }
}

export async function upsertProfile(userId: string, patch: ProfilePatch): Promise<void> {
  await getPool().query(
    `INSERT INTO traveller_profile (user_id, visited_countries, preferred_moods, preferred_themes, updated_at)
     VALUES ($1, $2, $3, $4, now())
     ON CONFLICT (user_id) DO UPDATE SET
       visited_countries = COALESCE(EXCLUDED.visited_countries, traveller_profile.visited_countries),
       preferred_moods   = COALESCE(EXCLUDED.preferred_moods,   traveller_profile.preferred_moods),
       preferred_themes  = COALESCE(EXCLUDED.preferred_themes,  traveller_profile.preferred_themes),
       updated_at        = now()`,
    [
      userId,
      patch.visitedCountries ?? null,
      patch.preferredMoods ?? null,
      patch.preferredThemes ?? null,
    ],
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test lib/twin/profile.test.ts
```

Expected: PASS (2 test suites, 3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/twin/profile.ts lib/twin/profile.test.ts
git commit -m "feat(twin): traveller_profile data layer — getProfile + upsertProfile"
```

---

## Task 3: PATCH `/api/twin/profile`

**Files:**
- Create: `app/api/twin/profile/route.ts`
- Create: `app/api/twin/profile/profile.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// app/api/twin/profile/profile.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest"

const mockGetTwinSession = vi.fn()
const mockUpsertProfile = vi.fn()

vi.mock("@/lib/auth/session", () => ({ getTwinSession: () => mockGetTwinSession() }))
vi.mock("@/lib/twin/profile", () => ({ upsertProfile: (...args: unknown[]) => mockUpsertProfile(...args) }))

// Parse body helper used by the route — import after mocks.
async function callPatch(body: unknown, sessionUser: { id: string } | null) {
  mockGetTwinSession.mockResolvedValue(sessionUser ? { user: sessionUser } : null)
  mockUpsertProfile.mockResolvedValue(undefined)
  const { PATCH } = await import("./route")
  const req = new Request("http://localhost/api/twin/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return PATCH(req)
}

describe("PATCH /api/twin/profile", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns 401 when not authenticated", async () => {
    const res = await callPatch({ visitedCountries: ["japan"] }, null)
    expect(res.status).toBe(401)
    expect(mockUpsertProfile).not.toHaveBeenCalled()
  })

  it("calls upsertProfile with userId and patch", async () => {
    const userId = "00000000-0000-0000-0000-000000000001"
    const res = await callPatch(
      { visitedCountries: ["japan", "france"], preferredMoods: ["serene"] },
      { id: userId },
    )
    expect(res.status).toBe(200)
    expect(mockUpsertProfile).toHaveBeenCalledWith(userId, {
      visitedCountries: ["japan", "france"],
      preferredMoods: ["serene"],
    })
  })

  it("returns 400 for a non-object body", async () => {
    const res = await callPatch("bad", { id: "00000000-0000-0000-0000-000000000001" })
    expect(res.status).toBe(400)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test app/api/twin/profile/profile.test.ts
```

Expected: FAIL (module not found).

- [ ] **Step 3: Write the implementation**

```ts
// app/api/twin/profile/route.ts
import { NextResponse } from "next/server"
import { getTwinSession } from "@/lib/auth/session"
import { upsertProfile } from "@/lib/twin/profile"
import type { ProfilePatch } from "@/lib/twin/profile"

export async function PATCH(req: Request) {
  const session = await getTwinSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Body must be an object" }, { status: 400 })
  }

  const raw = body as Record<string, unknown>
  const patch: ProfilePatch = {}

  if (Array.isArray(raw.visitedCountries)) {
    patch.visitedCountries = raw.visitedCountries.filter((v): v is string => typeof v === "string")
  }
  if (Array.isArray(raw.preferredMoods)) {
    patch.preferredMoods = raw.preferredMoods.filter((v): v is string => typeof v === "string")
  }
  if (Array.isArray(raw.preferredThemes)) {
    patch.preferredThemes = raw.preferredThemes.filter((v): v is string => typeof v === "string")
  }

  await upsertProfile(session.user.id, patch)
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test app/api/twin/profile/profile.test.ts
```

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add app/api/twin/profile/route.ts app/api/twin/profile/profile.test.ts
git commit -m "feat(api): PATCH /api/twin/profile — upsert traveller_profile"
```

---

## Task 4: GET `/api/twin/export`

**Files:**
- Create: `app/api/twin/export/route.ts`
- Create: `app/api/twin/export/export.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// app/api/twin/export/export.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest"

const mockGetTwinSession = vi.fn()
const mockGetTwinData = vi.fn()
const mockGetProfile = vi.fn()

vi.mock("@/lib/auth/session", () => ({ getTwinSession: () => mockGetTwinSession() }))
vi.mock("@/lib/twin/data", () => ({ getTwinData: () => mockGetTwinData() }))
vi.mock("@/lib/twin/profile", () => ({ getProfile: (...args: unknown[]) => mockGetProfile(...args) }))

async function callGet() {
  const { GET } = await import("./route")
  return GET()
}

describe("GET /api/twin/export", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns 401 when not authenticated", async () => {
    mockGetTwinSession.mockResolvedValue(null)
    const res = await callGet()
    expect(res.status).toBe(401)
  })

  it("sets Content-Disposition attachment header", async () => {
    mockGetTwinSession.mockResolvedValue({ user: { id: "u1", name: "Maya", email: "m@test.com" } })
    mockGetTwinData.mockResolvedValue({
      visitedCountries: ["japan"],
      moods: ["serene"],
      explorerBadge: "The Curious",
      savedPois: [{ id: "p1", name: "Senso-ji", poiType: "temple", slug: "senso-ji", shortDescription: null }],
    })
    mockGetProfile.mockResolvedValue({ visitedCountries: ["japan"], preferredMoods: ["serene"], preferredThemes: ["food"] })
    const res = await callGet()
    expect(res.status).toBe(200)
    expect(res.headers.get("Content-Disposition")).toMatch(/attachment.*twin-report\.json/)
  })

  it("includes name, badge, countries, moods, themes, savedPois in body", async () => {
    mockGetTwinSession.mockResolvedValue({ user: { id: "u1", name: "Maya", email: "m@test.com" } })
    mockGetTwinData.mockResolvedValue({
      visitedCountries: ["japan"],
      moods: ["serene"],
      explorerBadge: "The Curious",
      savedPois: [{ id: "p1", name: "Senso-ji", poiType: "temple", slug: "s", shortDescription: null }],
    })
    mockGetProfile.mockResolvedValue({ visitedCountries: ["japan", "brazil"], preferredMoods: ["serene"], preferredThemes: ["food"] })
    const res = await callGet()
    const body = await res.json()
    expect(body.name).toBe("Maya")
    expect(body.explorerBadge).toBe("The Curious")
    expect(body.visitedCountries).toEqual(["japan", "brazil"])
    expect(body.preferredMoods).toEqual(["serene"])
    expect(body.preferredThemes).toEqual(["food"])
    expect(body.savedPlaces).toHaveLength(1)
    expect(body.savedPlaces[0]).toEqual({ name: "Senso-ji", type: "temple" })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test app/api/twin/export/export.test.ts
```

Expected: FAIL (module not found).

- [ ] **Step 3: Write the implementation**

```ts
// app/api/twin/export/route.ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test app/api/twin/export/export.test.ts
```

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add app/api/twin/export/route.ts app/api/twin/export/export.test.ts
git commit -m "feat(api): GET /api/twin/export — download Twin report JSON"
```

---

## Task 5: Profile page — Server Component + Client Editor

**Files:**
- Create: `app/home/profile/page.tsx`
- Create: `app/home/profile/_components/ProfileEditor.tsx`

This page is auth-gated via the existing `HomeLayout` (which calls `requireTwin()`). The Server Component fetches three things: the current `traveller_profile` row, the `anonymous_session` row (for fallback countries), and the distinct moods/themes from `poi_final` to populate checkboxes.

- [ ] **Step 1: Write the Server Component page**

```tsx
// app/home/profile/page.tsx
import { requireTwin } from "@/lib/auth/session"
import { getProfile } from "@/lib/twin/profile"
import { getTwinData } from "@/lib/twin/data"
import { getPool } from "@/lib/moment/db"
import { ProfileEditor } from "./_components/ProfileEditor"

async function getPoiVocabulary(): Promise<{ moods: string[]; themes: string[] }> {
  const pool = getPool()
  const [moodsResult, themesResult] = await Promise.all([
    pool.query<{ mood: string }>(
      "SELECT DISTINCT unnest(moods) AS mood FROM poi_final WHERE operational_status = 'active' ORDER BY mood",
    ),
    pool.query<{ theme: string }>(
      "SELECT DISTINCT unnest(themes) AS theme FROM poi_final WHERE operational_status = 'active' ORDER BY theme",
    ),
  ])
  return {
    moods: moodsResult.rows.map((r) => r.mood).filter(Boolean),
    themes: themesResult.rows.map((r) => r.theme).filter(Boolean),
  }
}

export default async function ProfilePage() {
  const user = await requireTwin()
  const [profile, twin, vocabulary] = await Promise.all([
    getProfile(user.id),
    getTwinData(),
    getPoiVocabulary(),
  ])

  // Seed countries from traveller_profile if saved, else from anonymous_session
  const initialCountries = profile?.visitedCountries ?? twin?.visitedCountries ?? []
  const initialMoods = profile?.preferredMoods ?? twin?.moods ?? []
  const initialThemes = profile?.preferredThemes ?? []

  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-8">
      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 400,
          fontVariationSettings: '"opsz" 72',
          fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
          color: "var(--color-ink)",
          lineHeight: 1.1,
        }}
      >
        Your Twin
      </h1>
      <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
        Edit how your Twin understands you. Changes save automatically.
      </p>

      <ProfileEditor
        initialCountries={initialCountries}
        initialMoods={initialMoods}
        initialThemes={initialThemes}
        availableMoods={vocabulary.moods}
        availableThemes={vocabulary.themes}
      />
    </div>
  )
}
```

- [ ] **Step 2: Write the Client Editor component**

```tsx
// app/home/profile/_components/ProfileEditor.tsx
"use client"

import { useState, useCallback, useRef } from "react"

interface Props {
  initialCountries: string[]
  initialMoods: string[]
  initialThemes: string[]
  availableMoods: string[]
  availableThemes: string[]
}

async function savePatch(patch: {
  visitedCountries?: string[]
  preferredMoods?: string[]
  preferredThemes?: string[]
}) {
  await fetch("/api/twin/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  })
}

export function ProfileEditor({
  initialCountries,
  initialMoods,
  initialThemes,
  availableMoods,
  availableThemes,
}: Props) {
  const [countries, setCountries] = useState(initialCountries)
  const [moods, setMoods] = useState(new Set(initialMoods))
  const [themes, setThemes] = useState(new Set(initialThemes))
  const [countryInput, setCountryInput] = useState("")
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle")
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleSave = useCallback(
    (patch: Parameters<typeof savePatch>[0]) => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      setSaveState("saving")
      saveTimer.current = setTimeout(async () => {
        await savePatch(patch)
        setSaveState("saved")
        setTimeout(() => setSaveState("idle"), 2000)
      }, 500)
    },
    [],
  )

  function addCountry() {
    const trimmed = countryInput.trim().toLowerCase()
    if (!trimmed || countries.includes(trimmed)) return
    const next = [...countries, trimmed]
    setCountries(next)
    setCountryInput("")
    scheduleSave({ visitedCountries: next })
  }

  function removeCountry(c: string) {
    const next = countries.filter((x) => x !== c)
    setCountries(next)
    scheduleSave({ visitedCountries: next })
  }

  function toggleMood(mood: string) {
    const next = new Set(moods)
    next.has(mood) ? next.delete(mood) : next.add(mood)
    setMoods(next)
    scheduleSave({ preferredMoods: Array.from(next) })
  }

  function toggleTheme(theme: string) {
    const next = new Set(themes)
    next.has(theme) ? next.delete(theme) : next.add(theme)
    setThemes(next)
    scheduleSave({ preferredThemes: Array.from(next) })
  }

  return (
    <div className="mt-8 space-y-10">
      {/* Save indicator */}
      <div className="h-4">
        {saveState === "saving" && (
          <span className="text-[11px] uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
            Saving…
          </span>
        )}
        {saveState === "saved" && (
          <span className="text-[11px] uppercase tracking-widest" style={{ color: "var(--color-clay)" }}>
            Saved
          </span>
        )}
      </div>

      {/* Countries visited */}
      <section>
        <h2 className="text-[11px] uppercase tracking-widest mb-3" style={{ color: "var(--color-muted)" }}>
          Countries visited
        </h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {countries.map((c) => (
            <span
              key={c}
              className="flex items-center gap-1 rounded-full px-3 py-1 text-sm border border-line"
              style={{ background: "var(--color-surface)", color: "var(--color-ink)" }}
            >
              <span className="capitalize">{c}</span>
              <button
                type="button"
                onClick={() => removeCountry(c)}
                className="text-muted hover:text-ink transition-colors ml-1"
                aria-label={`Remove ${c}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={countryInput}
            onChange={(e) => setCountryInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCountry()}
            placeholder="Add a country…"
            className="flex-1 rounded-lg border border-line px-3 py-2 text-sm bg-surface text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-clay/30"
          />
          <button
            type="button"
            onClick={addCountry}
            className="rounded-lg px-4 py-2 text-sm border border-line bg-surface text-ink hover:bg-canvas transition-colors"
          >
            Add
          </button>
        </div>
      </section>

      {/* Mood preferences */}
      <section>
        <h2 className="text-[11px] uppercase tracking-widest mb-3" style={{ color: "var(--color-muted)" }}>
          Travel moods
        </h2>
        <div className="flex flex-wrap gap-2">
          {availableMoods.map((mood) => (
            <button
              key={mood}
              type="button"
              onClick={() => toggleMood(mood)}
              className="rounded-full px-3 py-1 text-sm border transition-colors capitalize"
              style={
                moods.has(mood)
                  ? { background: "var(--color-clay)", color: "var(--color-canvas)", borderColor: "var(--color-clay)" }
                  : { background: "var(--color-surface)", color: "var(--color-ink)", borderColor: "var(--color-line)" }
              }
            >
              {mood.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </section>

      {/* Theme preferences */}
      <section>
        <h2 className="text-[11px] uppercase tracking-widest mb-3" style={{ color: "var(--color-muted)" }}>
          Travel themes
        </h2>
        <div className="flex flex-wrap gap-2">
          {availableThemes.map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => toggleTheme(theme)}
              className="rounded-full px-3 py-1 text-sm border transition-colors capitalize"
              style={
                themes.has(theme)
                  ? { background: "var(--color-clay)", color: "var(--color-canvas)", borderColor: "var(--color-clay)" }
                  : { background: "var(--color-surface)", color: "var(--color-ink)", borderColor: "var(--color-line)" }
              }
            >
              {theme.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors in the new files.

- [ ] **Step 4: Commit**

```bash
git add app/home/profile/page.tsx app/home/profile/_components/ProfileEditor.tsx
git commit -m "feat(home): /home/profile — editable Twin profile with autosave"
```

---

## Task 6: Nav link + completeness bar + export button on `/home`

**Files:**
- Modify: `app/home/_components/HomeNav.tsx`
- Modify: `app/home/page.tsx`
- Modify: `lib/twin/data.ts` (extend `TwinData` with profile fields)

### Part A: Extend `TwinData` with profile fields

The home page completeness bar needs `preferred_moods` and `preferred_themes` from `traveller_profile`. Extend `TwinData` to carry them.

- [ ] **Step 1: Update `lib/twin/data.ts`**

Add the import and two new fields. Replace the entire file:

```ts
// lib/twin/data.ts
import { cache } from "react"
import { getTwinSession } from "@/lib/auth/session"
import { getPool } from "@/lib/moment/db"
import { explorerBadge } from "@/lib/moment/explorerBadge"
import { getProfile } from "@/lib/twin/profile"

export interface SavedPoi {
  id: string
  name: string
  slug: string
  shortDescription: string | null
  poiType: string | null
}

export interface TwinData {
  userId: string
  visitedCountries: string[]
  moods: string[]
  portrait: string | null
  explorerBadge: string
  savedPois: SavedPoi[]
  preferredMoods: string[]
  preferredThemes: string[]
}

export const getTwinData = cache(async (): Promise<TwinData | null> => {
  const session = await getTwinSession()
  if (!session?.user?.id) return null

  const pool = getPool()

  const [sessionRow, profile] = await Promise.all([
    pool.query<{
      visited_countries: string[]
      moods: string[]
      mana_summary: { explorerBadge?: string; portrait?: string } | null
      saved_pois: string[] | null
    }>(
      `SELECT visited_countries, moods, mana_summary, saved_pois
       FROM anonymous_session
       WHERE linked_user_id = $1
       ORDER BY completed_at DESC NULLS LAST
       LIMIT 1`,
      [session.user.id],
    ),
    getProfile(session.user.id),
  ])

  const row = sessionRow.rows[0]
  const visitedCountries = profile?.visitedCountries ?? row?.visited_countries ?? []
  const moods = row?.moods ?? []
  const portrait = row?.mana_summary?.portrait ?? null
  const rawSavedPoiIds = row?.saved_pois ?? []

  let savedPois: SavedPoi[] = []
  if (rawSavedPoiIds.length > 0) {
    const poiRows = await pool.query<{
      id: string
      name: string
      slug: string
      short_description: string | null
      poi_type: string | null
    }>(
      `SELECT id, name, slug, short_description, poi_type
       FROM poi_final
       WHERE id = ANY($1)`,
      [rawSavedPoiIds],
    )
    savedPois = poiRows.rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      shortDescription: r.short_description,
      poiType: r.poi_type,
    }))
  }

  return {
    userId: session.user.id,
    visitedCountries,
    moods,
    portrait,
    explorerBadge: explorerBadge(visitedCountries.length),
    savedPois,
    preferredMoods: profile?.preferredMoods ?? moods,
    preferredThemes: profile?.preferredThemes ?? [],
  }
})
```

- [ ] **Step 2: Run existing data tests — they should still pass**

```bash
npm test lib/twin/data.test.ts
```

Expected: PASS. The mocked `getProfile` call needs to be added to the test's mock setup. If tests fail because `@/lib/twin/profile` is not mocked, update `lib/twin/data.test.ts` by adding this mock near the other vi.mock calls:

```ts
vi.mock("@/lib/twin/profile", () => ({ getProfile: vi.fn().mockResolvedValue(null) }))
```

Re-run until all pass.

### Part B: Add Profile link to HomeNav

- [ ] **Step 3: Update `app/home/_components/HomeNav.tsx`**

```tsx
"use client"

import Link from "next/link"
import { authClient } from "@/lib/auth/client"
import { useRouter } from "next/navigation"

export function HomeNav({ userName }: { userName?: string | null }) {
  const router = useRouter()

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/sign-in")
  }

  return (
    <nav className="border-b border-line bg-surface px-6 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/home" className="font-serif text-lg text-ink" style={{ fontWeight: 400 }}>
          Ohana
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/home/profile"
            className="text-sm text-muted hover:text-ink transition-colors"
          >
            Profile
          </Link>
          {userName && (
            <span className="text-sm text-muted hidden sm:block">{userName}</span>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="text-sm text-muted hover:text-ink transition-colors bg-transparent border-none cursor-pointer p-0"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
```

### Part C: Add completeness bar + export button to `/home`

- [ ] **Step 4: Update `app/home/page.tsx`**

Add these two sections immediately after the opening `<div>`, before the Hoku greeting:

```tsx
{/* ── Completeness bar ── */}
{twin && (() => {
  const filled = [
    twin.visitedCountries.length > 0,
    twin.preferredMoods.length > 0,
    twin.preferredThemes.length > 0,
  ].filter(Boolean).length
  const pct = Math.round((filled / 3) * 100)
  return (
    <section className="mb-6 px-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
          Twin completeness
        </span>
        <span className="text-[11px]" style={{ color: "var(--color-muted)" }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-line)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: "var(--color-clay)" }}
        />
      </div>
      {pct < 100 && (
        <p className="mt-1 text-[12px]" style={{ color: "var(--color-muted)" }}>
          <a href="/home/profile" className="underline underline-offset-2 hover:text-ink transition-colors">
            Complete your profile
          </a>{" "}
          to get better recommendations.
        </p>
      )}
    </section>
  )
})()}
```

And add this export button at the bottom, after the "Your journeys" section:

```tsx
{/* ── Export ── */}
<section className="mt-6 px-4">
  <a
    href="/api/twin/export"
    download="twin-report.json"
    className="text-sm underline underline-offset-2 hover:text-ink transition-colors"
    style={{ color: "var(--color-muted)" }}
  >
    Download your Twin report
  </a>
</section>
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add lib/twin/data.ts app/home/_components/HomeNav.tsx app/home/page.tsx
git commit -m "feat(home): completeness bar, export link, Profile nav — OHA-12"
```

---

## Task 7: Wire Twin into Discovery (`/api/discover/wej`)

The Wej query should widen results when an authenticated user has saved `preferred_moods` in `traveller_profile`. The unauthenticated path must be untouched.

**Files:**
- Modify: `app/api/discover/wej/route.ts`
- Modify: `app/api/discover/wej/wej.test.ts`

- [ ] **Step 1: Add the new test cases to `wej.test.ts`**

Append these tests to the existing file:

```ts
import { buildWejQueryBiased } from "./route"

test("buildWejQueryBiased adds OR branch for preferred moods", () => {
  const { text, values } = buildWejQueryBiased("serene", "food", ["calm", "adventurous"])
  expect(text).toMatch(/moods @> \$1 OR moods && \$3/i)
  expect(values[2]).toEqual(["calm", "adventurous"])
})

test("buildWejQueryBiased with empty preferred moods behaves like basic query", () => {
  const { text, values } = buildWejQueryBiased("serene", "food", [])
  // No OR branch when list is empty
  expect(text).not.toMatch(/OR moods/)
  expect(values).toHaveLength(2)
})
```

- [ ] **Step 2: Run tests to verify the new ones fail**

```bash
npm test app/api/discover/wej/wej.test.ts
```

Expected: existing tests PASS, new two FAIL (function not exported).

- [ ] **Step 3: Add `buildWejQueryBiased` and wire session lookup in `route.ts`**

Add after the existing `buildWejQuery` function:

```ts
export function buildWejQueryBiased(
  mood: string,
  theme: string,
  preferredMoods: string[],
): { text: string; values: (string | string[])[] } {
  if (preferredMoods.length === 0) {
    return buildWejQuery(mood, theme)
  }
  const text = `
    SELECT id, name, short_description, photos, source_id, city_name
    FROM poi_final
    WHERE (moods @> $1 OR moods && $3)
      AND themes @> $2
      AND operational_status = 'active'
    ORDER BY confidence_score DESC NULLS LAST
    LIMIT ${WEJ_CAP}
  `
  return { text, values: [[mood], [theme], preferredMoods] }
}
```

Then update the `GET` handler to use it. Replace the existing `GET` function:

```ts
import { getTwinSession } from "@/lib/auth/session"
import { getProfile } from "@/lib/twin/profile"

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams
  const mood = params.get("mood")?.trim()
  const theme = params.get("theme")?.trim()

  if (!mood || !theme) {
    return NextResponse.json({ error: "mood and theme are required" }, { status: 400 })
  }

  // Attempt to fetch the session user's preferred moods for biasing.
  // Failures here must never break the unauthenticated path.
  let preferredMoods: string[] = []
  try {
    const session = await getTwinSession()
    if (session?.user?.id) {
      const profile = await getProfile(session.user.id)
      preferredMoods = profile?.preferredMoods ?? []
    }
  } catch {
    // Silently fall back to no biasing.
  }

  const { text, values } = buildWejQueryBiased(mood, theme, preferredMoods)

  let cards: WejCard[] = []
  try {
    const result = await getPool().query<PoiFinalRow>(text, values)
    cards = result.rows.map((row) => rowToCard(row, mood, theme))
  } catch {
    cards = []
  }

  const title = titleCaseSlug(theme)

  if (isThinWej(cards.length)) {
    return NextResponse.json({ mood, theme, title, thin: true, cards })
  }

  return NextResponse.json({ mood, theme, title, cards })
}
```

- [ ] **Step 4: Run all wej tests**

```bash
npm test app/api/discover/wej/wej.test.ts
```

Expected: all tests PASS (existing + 2 new).

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add app/api/discover/wej/route.ts app/api/discover/wej/wej.test.ts
git commit -m "feat(discover): bias Wej query with traveller preferred_moods when authenticated"
```

---

## Task 8: Full test run + smoke check

- [ ] **Step 1: Run the full test suite**

```bash
npm test
```

Expected: all tests pass. Fix any regressions before continuing.

- [ ] **Step 2: Start dev server and manually verify**

```bash
npm run dev
```

Check each route:
- `/home` — completeness bar visible (shows 0% if no profile), "Download your Twin report" link visible, "Profile" link in nav
- `/home/profile` — page loads, countries/moods/themes sections appear, adding a country and saving shows "Saved" indicator
- `/api/twin/export` (in browser while signed in) — downloads `twin-report.json` with correct shape
- `/api/discover/wej?mood=serene&theme=food` — still returns cards (no regression on unauth path)

- [ ] **Step 3: Final commit if any fixes were made**

```bash
git add -p
git commit -m "fix: post-integration corrections from smoke test"
```
