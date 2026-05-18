# Payments Readout + Payout Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/portal/payments` page showing earnings/payout data and a Mollie Connect OAuth flow so creators can link their Mollie org and begin receiving payouts.

**Architecture:** Server Components read raw SQL via `getPool()` from `lib/moment/db.ts`. Two API routes handle the Mollie OAuth redirect and callback. The payments page branches on `mollie_org_id` — no connection means a setup banner only; connected means full financial data. One DB write (scoped strictly to the session creator's payout columns).

**Tech Stack:** Next.js App Router (Server Components), raw `pg`, `@mollie/api-client`, Vitest + RTL

**Spec:** `docs/superpowers/specs/2026-05-18-payments-readout-payout-setup-design.md`

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Install | — | `@mollie/api-client` |
| Modify | `lib/portal/ambassador.ts` | Add `mollie_org_id` to type + SELECT |
| Create | `lib/portal/payments.ts` | 4 SQL query functions + types |
| Create | `lib/portal/payments.test.ts` | Unit tests for data layer |
| Create | `app/portal/payments/page.tsx` | Payments readout Server Component |
| Modify | `app/portal/page.tsx` | Replace Earnings ComingSoon with link |
| Modify | `app/portal/_components/PortalNav.tsx` | Add Payments nav link |
| Create | `app/api/portal/mollie/connect/route.ts` | Build OAuth redirect + state cookie |
| Create | `app/api/portal/mollie/callback/route.ts` | Exchange code, write mollie_org_id |

---

## Task 1: Install dependency + update ambassador type

**Files:**
- Modify: `lib/portal/ambassador.ts`

- [ ] **Install `@mollie/api-client`**

```bash
npm install @mollie/api-client
```

Expected: package added to `node_modules`, `package.json` updated.

- [ ] **Add `mollie_org_id` to `CreatorRecord` in `lib/portal/ambassador.ts`**

Replace the type and query in `lib/portal/ambassador.ts`:

```typescript
export type CreatorRecord = {
  id: string
  slug: string
  display_name: string
  creator_type: string | null
  status: string
  revenue_share_tier: string | null
  kyc_status: string
  payout_enabled: boolean
  mollie_org_id: string | null
}
```

And update the SELECT in `getAmbassadorRecord`:

```typescript
  const result = await pool.query<CreatorRecord>(
    `SELECT id, slug, display_name, creator_type, status,
            revenue_share_tier, kyc_status, payout_enabled, mollie_org_id
     FROM creator
     WHERE id = $1`,
    [creatorId],
  )
```

- [ ] **Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Run existing tests**

```bash
npm test
```

Expected: all tests pass (no regressions).

- [ ] **Commit**

```bash
git add lib/portal/ambassador.ts package.json package-lock.json
git commit -m "feat(portal): add mollie_org_id to CreatorRecord + install mollie sdk"
```

---

## Task 2: Data layer — `lib/portal/payments.ts` (TDD)

**Files:**
- Create: `lib/portal/payments.ts`
- Create: `lib/portal/payments.test.ts`

- [ ] **Write the failing tests in `lib/portal/payments.test.ts`**

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest"

const mockQuery = vi.fn()
vi.mock("@/lib/moment/db", () => ({
  getPool: () => ({ query: mockQuery }),
}))

const CREATOR_ID = "11111111-1111-1111-1111-111111111111"

describe("getEarningsSummary", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns zeroes when creator has no earnings", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] })  // earnings by status
      .mockResolvedValueOnce({ rows: [{ total: "0" }] })  // pending payout
    const { getEarningsSummary } = await import("./payments")
    const result = await getEarningsSummary(CREATOR_ID)
    expect(result).toEqual({ accrued: "0", available: "0", paid: "0", pendingPayout: "0", currency: "EUR" })
  })

  it("maps earnings rows by status", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [
          { status: "accrued", total: "120.50", currency: "EUR" },
          { status: "paid", total: "500.00", currency: "EUR" },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ total: "75.00" }] })
    const { getEarningsSummary } = await import("./payments")
    const result = await getEarningsSummary(CREATOR_ID)
    expect(result.accrued).toBe("120.50")
    expect(result.paid).toBe("500.00")
    expect(result.available).toBe("0")
    expect(result.pendingPayout).toBe("75.00")
    expect(result.currency).toBe("EUR")
  })
})

describe("getRecentEarnings", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns rows from creator_earning", async () => {
    const row = {
      id: "abc",
      source_type: "booking_commission",
      gross_basis_amount: "200.00",
      creator_share_amount: "160.00",
      currency: "EUR",
      status: "accrued",
      accrued_at: new Date("2026-05-01"),
    }
    mockQuery.mockResolvedValueOnce({ rows: [row] })
    const { getRecentEarnings } = await import("./payments")
    const result = await getRecentEarnings(CREATOR_ID)
    expect(result).toHaveLength(1)
    expect(result[0].source_type).toBe("booking_commission")
  })

  it("passes limit to query", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    const { getRecentEarnings } = await import("./payments")
    await getRecentEarnings(CREATOR_ID, 5)
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [CREATOR_ID, 5])
  })
})

describe("getPayoutHistory", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns rows from payout table", async () => {
    const row = {
      id: "payout-1",
      total_amount: "300.00",
      currency: "EUR",
      status: "paid",
      period_start: new Date("2026-04-01"),
      period_end: new Date("2026-04-30"),
      mollie_reference: "tr_abc",
      initiated_at: new Date("2026-05-01"),
      paid_at: new Date("2026-05-03"),
    }
    mockQuery.mockResolvedValueOnce({ rows: [row] })
    const { getPayoutHistory } = await import("./payments")
    const result = await getPayoutHistory(CREATOR_ID)
    expect(result[0].mollie_reference).toBe("tr_abc")
  })
})

describe("getSourcedBookings", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns rows from booking table", async () => {
    const row = { id: "b-1", gross_amount: "500.00", status: "confirmed", booked_at: new Date("2026-05-10") }
    mockQuery.mockResolvedValueOnce({ rows: [row] })
    const { getSourcedBookings } = await import("./payments")
    const result = await getSourcedBookings(CREATOR_ID)
    expect(result[0].gross_amount).toBe("500.00")
  })
})
```

- [ ] **Run tests to confirm they fail**

```bash
npm test lib/portal/payments.test.ts
```

Expected: FAIL — "Cannot find module './payments'"

- [ ] **Create `lib/portal/payments.ts`**

```typescript
import { getPool } from "@/lib/moment/db"

export type EarningsSummary = {
  accrued: string
  available: string
  paid: string
  pendingPayout: string
  currency: string
}

export type EarningRow = {
  id: string
  source_type: string
  gross_basis_amount: string
  creator_share_amount: string
  currency: string
  status: string
  accrued_at: Date
}

export type PayoutRow = {
  id: string
  total_amount: string
  currency: string
  status: string
  period_start: Date | null
  period_end: Date | null
  mollie_reference: string | null
  initiated_at: Date
  paid_at: Date | null
}

export type SourcedBookingRow = {
  id: string
  gross_amount: string
  status: string
  booked_at: Date
}

export async function getEarningsSummary(creatorId: string): Promise<EarningsSummary> {
  const pool = getPool()
  const [earningsRes, payoutRes] = await Promise.all([
    pool.query<{ status: string; total: string; currency: string }>(
      `SELECT status, SUM(creator_share_amount)::text AS total, MAX(currency) AS currency
       FROM creator_earning
       WHERE creator_id = $1
       GROUP BY status`,
      [creatorId],
    ),
    pool.query<{ total: string }>(
      `SELECT COALESCE(SUM(total_amount), 0)::text AS total
       FROM payout
       WHERE creator_id = $1 AND status = 'pending'`,
      [creatorId],
    ),
  ])

  const byStatus: Record<string, string> = {}
  let currency = "EUR"
  for (const row of earningsRes.rows) {
    byStatus[row.status] = row.total
    currency = row.currency
  }

  return {
    accrued: byStatus["accrued"] ?? "0",
    available: byStatus["available"] ?? "0",
    paid: byStatus["paid"] ?? "0",
    pendingPayout: payoutRes.rows[0]?.total ?? "0",
    currency,
  }
}

export async function getRecentEarnings(creatorId: string, limit = 20): Promise<EarningRow[]> {
  const pool = getPool()
  const result = await pool.query<EarningRow>(
    `SELECT id, source_type, gross_basis_amount::text, creator_share_amount::text,
            currency, status, accrued_at
     FROM creator_earning
     WHERE creator_id = $1
     ORDER BY accrued_at DESC
     LIMIT $2`,
    [creatorId, limit],
  )
  return result.rows
}

export async function getPayoutHistory(creatorId: string, limit = 10): Promise<PayoutRow[]> {
  const pool = getPool()
  const result = await pool.query<PayoutRow>(
    `SELECT id, total_amount::text, currency, status, period_start, period_end,
            mollie_reference, initiated_at, paid_at
     FROM payout
     WHERE creator_id = $1
     ORDER BY initiated_at DESC
     LIMIT $2`,
    [creatorId, limit],
  )
  return result.rows
}

export async function getSourcedBookings(creatorId: string, limit = 10): Promise<SourcedBookingRow[]> {
  const pool = getPool()
  const result = await pool.query<SourcedBookingRow>(
    `SELECT id, gross_amount::text, status, booked_at
     FROM booking
     WHERE sourcing_creator_id = $1
     ORDER BY booked_at DESC
     LIMIT $2`,
    [creatorId, limit],
  )
  return result.rows
}
```

- [ ] **Run tests to confirm they pass**

```bash
npm test lib/portal/payments.test.ts
```

Expected: all 6 tests PASS.

- [ ] **Run full test suite**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Commit**

```bash
git add lib/portal/payments.ts lib/portal/payments.test.ts
git commit -m "feat(portal): payments data layer with earnings, payouts, sourced bookings"
```

---

## Task 3: Payments page UI

**Files:**
- Create: `app/portal/payments/page.tsx`
- Modify: `app/portal/page.tsx`
- Modify: `app/portal/_components/PortalNav.tsx`

- [ ] **Create `app/portal/payments/page.tsx`**

```typescript
import Link from "next/link"
import { getAmbassadorRecord } from "@/lib/portal/ambassador"
import {
  getEarningsSummary,
  getRecentEarnings,
  getPayoutHistory,
  getSourcedBookings,
} from "@/lib/portal/payments"

export default async function PaymentsPage() {
  const record = await getAmbassadorRecord()
  if (!record) return null

  const notConnected = !record.mollie_org_id

  return (
    <div className="space-y-12">
      <header>
        <h1
          className="font-serif text-4xl text-ink"
          style={{ fontWeight: 400, fontVariationSettings: '"opsz" 144' }}
        >
          Payments
        </h1>
      </header>

      {notConnected && (
        <section className="rounded-lg border border-line bg-surface p-8 text-center space-y-4">
          <p className="text-sm text-muted">Connect your Mollie account to start receiving payouts.</p>
          <Link
            href="/api/portal/mollie/connect"
            className="inline-flex items-center rounded-full bg-ink px-5 py-2.5 text-sm text-canvas hover:opacity-80 transition-opacity"
          >
            Connect with Mollie
          </Link>
        </section>
      )}

      {!notConnected && record.kyc_status !== "verified" && (
        <div className="rounded-lg border border-line bg-surface px-6 py-4 text-sm text-muted">
          Mollie is reviewing your account — payouts will be enabled once verification is complete.
        </div>
      )}

      {!notConnected && <EarningsData creatorId={record.id} currency="EUR" />}
    </div>
  )
}

async function EarningsData({ creatorId, currency: _currency }: { creatorId: string; currency: string }) {
  const [summary, earnings, payouts, bookings] = await Promise.all([
    getEarningsSummary(creatorId),
    getRecentEarnings(creatorId),
    getPayoutHistory(creatorId),
    getSourcedBookings(creatorId),
  ])

  const fmt = (amount: string) =>
    new Intl.NumberFormat("en-EU", { style: "currency", currency: summary.currency }).format(
      parseFloat(amount),
    )

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-xs uppercase tracking-widest text-muted mb-4">Summary</h2>
        <div className="rounded-lg border border-line bg-surface p-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Accrued">{fmt(summary.accrued)}</Stat>
          <Stat label="Available">{fmt(summary.available)}</Stat>
          <Stat label="Paid out">{fmt(summary.paid)}</Stat>
          <Stat label="Pending payout">{fmt(summary.pendingPayout)}</Stat>
        </div>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-widest text-muted mb-4">Earnings</h2>
        {earnings.length === 0 ? (
          <Empty>No earnings yet.</Empty>
        ) : (
          <Table
            head={["Date", "Type", "Gross", "Your share", "Status"]}
            rows={earnings.map((e) => [
              new Date(e.accrued_at).toLocaleDateString("en-GB"),
              e.source_type.replace(/_/g, " "),
              fmt(e.gross_basis_amount),
              fmt(e.creator_share_amount),
              <StatusBadge key={e.id} status={e.status} />,
            ])}
          />
        )}
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-widest text-muted mb-4">Payout history</h2>
        {payouts.length === 0 ? (
          <Empty>No payouts yet.</Empty>
        ) : (
          <Table
            head={["Period", "Amount", "Reference", "Status"]}
            rows={payouts.map((p) => [
              p.period_start
                ? `${new Date(p.period_start).toLocaleDateString("en-GB")} – ${new Date(p.period_end!).toLocaleDateString("en-GB")}`
                : "—",
              fmt(p.total_amount),
              p.mollie_reference ?? "—",
              <StatusBadge key={p.id} status={p.status} />,
            ])}
          />
        )}
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-widest text-muted mb-4">Bookings sourced</h2>
        {bookings.length === 0 ? (
          <Empty>No sourced bookings yet.</Empty>
        ) : (
          <Table
            head={["Date", "Gross value", "Status"]}
            rows={bookings.map((b) => [
              new Date(b.booked_at).toLocaleDateString("en-GB"),
              fmt(b.gross_amount),
              <StatusBadge key={b.id} status={b.status} />,
            ])}
          />
        )}
      </section>
    </div>
  )
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted mb-1">{label}</dt>
      <dd className="text-sm font-medium text-ink">{children}</dd>
    </div>
  )
}

function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full text-sm">
        <thead className="border-b border-line bg-surface">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-widest text-muted font-normal">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row, i) => (
            <tr key={i} className="bg-canvas hover:bg-surface transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-ink">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const STATUS_COLORS: Record<string, string> = {
  accrued: "bg-clay-soft text-clay",
  available: "bg-sage-soft text-sage",
  paid: "bg-line text-muted",
  pending: "bg-clay-soft text-clay",
  processing: "bg-clay-soft text-clay",
  failed: "bg-red-100 text-red-700",
  confirmed: "bg-sage-soft text-sage",
  cancelled: "bg-line text-muted",
}

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_COLORS[status] ?? "bg-line text-muted"
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${style}`}>
      {status.replace(/_/g, " ")}
    </span>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-8 text-center">
      <p className="text-sm text-muted">{children}</p>
    </div>
  )
}
```

- [ ] **Update `app/portal/page.tsx` — replace Earnings ComingSoon with link**

Replace:

```tsx
      <section>
        <h2 className="text-xs uppercase tracking-widest text-muted mb-4">Earnings</h2>
        <ComingSoon />
      </section>
```

With:

```tsx
      <section>
        <h2 className="text-xs uppercase tracking-widest text-muted mb-4">Earnings</h2>
        <div className="rounded-lg border border-line bg-surface p-6 flex items-center justify-between">
          <p className="text-sm text-muted">View your earnings and payout history.</p>
          <Link href="/portal/payments" className="text-sm text-ink underline underline-offset-2">
            Go to Payments
          </Link>
        </div>
      </section>
```

Also add `import Link from "next/link"` at the top if not present.

- [ ] **Update `app/portal/_components/PortalNav.tsx` — add Payments link**

Replace the nav links section:

```tsx
        <div className="flex items-center gap-6">
          <Link href="/portal/payments" className="text-sm text-muted hover:text-ink transition-colors">
            Payments
          </Link>
          <Link href="/sign-in" className="text-sm text-muted hover:text-ink transition-colors">
            Sign out
          </Link>
        </div>
```

(Keep the "Ohana Portal" brand link on the left unchanged.)

- [ ] **Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Commit**

```bash
git add app/portal/payments/page.tsx app/portal/page.tsx app/portal/_components/PortalNav.tsx
git commit -m "feat(portal): payments page with earnings summary, history, sourced bookings"
```

---

## Task 4: Mollie connect route

**Files:**
- Create: `app/api/portal/mollie/connect/route.ts`

- [ ] **Create `app/api/portal/mollie/connect/route.ts`**

```typescript
import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import { getPortalSession } from "@/lib/portal/session"

export async function GET() {
  const session = await getPortalSession()
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const clientId = process.env.MOLLIE_CLIENT_ID
  const redirectUri = process.env.MOLLIE_REDIRECT_URI
  if (!clientId || !redirectUri) {
    return new NextResponse("Mollie not configured", { status: 503 })
  }

  const state = randomUUID()

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "organizations.read onboarding.read",
    response_type: "code",
    state,
  })

  const mollieUrl = `https://www.mollie.com/oauth2/authorize?${params.toString()}`

  const response = NextResponse.redirect(mollieUrl)
  response.cookies.set("mollie_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  })
  return response
}
```

- [ ] **Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Commit**

```bash
git add app/api/portal/mollie/connect/route.ts
git commit -m "feat(portal): Mollie Connect OAuth redirect route"
```

---

## Task 5: Mollie callback route

**Files:**
- Create: `app/api/portal/mollie/callback/route.ts`

- [ ] **Create `app/api/portal/mollie/callback/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server"
import createMollieClient, { OAuthGrantType } from "@mollie/api-client"
import { getPool } from "@/lib/moment/db"
import { getPortalSession } from "@/lib/portal/session"

// Canonical-table write: scoped to session creator's own row, payout columns only.
// Flagged for review — consider routing through ohana-infra/admin endpoint in a future pass.

export async function GET(request: NextRequest) {
  const session = await getPortalSession()
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const stateCookie = request.cookies.get("mollie_oauth_state")?.value

  if (!code || !state || !stateCookie || state !== stateCookie) {
    return NextResponse.redirect(new URL("/portal/payments?error=state_mismatch", request.url))
  }

  const clientId = process.env.MOLLIE_CLIENT_ID
  const clientSecret = process.env.MOLLIE_CLIENT_SECRET
  const redirectUri = process.env.MOLLIE_REDIRECT_URI
  if (!clientId || !clientSecret || !redirectUri) {
    return new NextResponse("Mollie not configured", { status: 503 })
  }

  try {
    // Exchange code for access token
    const oauthClient = createMollieClient({ apiKey: "" })
    const token = await oauthClient.oauth.create({
      clientId,
      clientSecret,
      grantType: OAuthGrantType.AuthorizationCode,
      code,
      redirectUri,
    })

    // Fetch the connected Mollie organisation ID
    const orgClient = createMollieClient({ accessToken: token.access_token })
    const org = await orgClient.organizations.get("me")
    const mollieOrgId = org.id

    // Write to creator — session creator's row only, mollie_org_id + kyc_status only.
    // AND mollie_org_id IS NULL prevents overwriting an existing link.
    const pool = getPool()
    await pool.query(
      `UPDATE creator
       SET mollie_org_id = $1, kyc_status = 'pending'
       WHERE id = $2
         AND mollie_org_id IS NULL`,
      [mollieOrgId, session.creatorId],
    )

    const response = NextResponse.redirect(new URL("/portal/payments?connected=1", request.url))
    response.cookies.set("mollie_oauth_state", "", { maxAge: 0, path: "/" })
    return response
  } catch {
    return NextResponse.redirect(new URL("/portal/payments?error=connect_failed", request.url))
  }
}
```

- [ ] **Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors. If `@mollie/api-client` types surface issues with `organizations.get("me")`, check the installed version's type definitions — the method signature may require an options object: `orgClient.organizations.get("me", {})`.

- [ ] **Run full test suite**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Commit**

```bash
git add app/api/portal/mollie/callback/route.ts
git commit -m "feat(portal): Mollie Connect OAuth callback — exchange code, write mollie_org_id"
```

---

## Task 6: Wire env vars + smoke test

**Files:** none (config + manual verification)

- [ ] **Add env vars to `.env.local`**

```bash
MOLLIE_CLIENT_ID=app_<your_client_id>
MOLLIE_CLIENT_SECRET=<your_client_secret>
MOLLIE_REDIRECT_URI=http://localhost:3000/api/portal/mollie/callback
PORTAL_DEV_CREATOR_ID=<uuid_of_a_creator_with_earning_rows>
```

Get `MOLLIE_CLIENT_ID` and `MOLLIE_CLIENT_SECRET` from the Mollie partner dashboard under **More → Developers → Your apps**.

- [ ] **Start dev server**

```bash
npm run dev
```

- [ ] **Smoke test: not-connected state**

Navigate to `http://localhost:3000/portal/payments`. Expected: "Connect with Mollie" banner, no financial tables.

- [ ] **Smoke test: Mollie connect flow**

Click "Connect with Mollie". Expected: redirect to `https://www.mollie.com/oauth2/authorize?...`. Complete the Mollie auth flow. Expected: redirect back to `/portal/payments?connected=1`, banner changes to "Mollie is reviewing your account".

- [ ] **Smoke test: earnings data (if creator has rows)**

With `PORTAL_DEV_CREATOR_ID` pointing to a creator that has `creator_earning` and `payout` rows: navigate to `/portal/payments`. Expected: summary cards show correct totals, earnings table shows rows.

- [ ] **Smoke test: nav**

Navigate to `/portal`. Expected: "Payments" link in nav. "Earnings" section shows "Go to Payments" link.
