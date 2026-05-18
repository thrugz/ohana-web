# Payments Readout + Payout Setup

Date: 2026-05-18

## Context

ohana-web is a Next.js app using raw `pg` (no Prisma/ORM). The shared DB pool is in `lib/moment/db.ts`. The creator portal resolves the logged-in creator via `lib/portal/session.ts` (`getPortalSession() -> { creatorId }`), currently stub-driven by `PORTAL_DEV_CREATOR_ID`. `lib/portal/ambassador.ts` already reads the `creator` table.

The DB (owned by ohana-infra) has the full Mollie-based payment model. Payouts are processed via Mollie Connect — each creator links a Mollie organisation; `creator.mollie_org_id` stores that org ID. `kyc_status` and `payout_enabled` reflect their onboarding state.

Webhook handling (OHA-38) is out of scope for this pass. `payout_enabled` is flipped by admin or the future webhook.

## What already exists

- `lib/portal/session.ts` — stub, no changes needed
- `lib/portal/ambassador.ts` — reads `creator` (id, slug, display_name, creator_type, status, revenue_share_tier, kyc_status, payout_enabled); `mollie_org_id` not yet selected
- `app/portal/page.tsx` — profile stats, "Earnings" and "Your guides" as `<ComingSoon />`
- `app/portal/layout.tsx`, `PortalNav.tsx`, gate via `requireAmbassador()`

## Scope

### A. Payments page (`/portal/payments`)

Single page replacing the "Earnings: Coming soon" stub. Content varies by payout state:

**State 1 — not connected** (`mollie_org_id` is null):
Full-width "Set up payouts" banner with a "Connect with Mollie" link. No financial data shown.

**State 2 — connected, pending** (`mollie_org_id` set, `kyc_status != 'verified'`):
"Mollie is reviewing your account" notice at top. Earnings data shown below.

**State 3 — active** (`payout_enabled = true`):
No banner. Full earnings data.

Financial data sections (states 2 and 3):
1. Summary row — 4 stat cards: accrued / available / paid / pending payout
2. Earnings line items — recent `creator_earning` rows, limit 20
3. Payout history — `payout` rows, limit 10
4. Sourced bookings — `booking WHERE sourcing_creator_id = $1`, limit 10

### B. Mollie Connect OAuth

Two API routes:

**`GET /api/portal/mollie/connect`**
- Requires active portal session (call `getPortalSession()`, 401 if null)
- Generates a random state UUID
- Stores state in an httpOnly cookie (`mollie_oauth_state`, max-age 600s, SameSite=Lax)
- Scopes: `organizations.read onboarding.read`
- 302 redirect to `https://www.mollie.com/oauth2/authorize?...`

**`GET /api/portal/mollie/callback`**
- Validates `?state=` against `mollie_oauth_state` cookie; 400 on mismatch or missing
- Exchanges code via `@mollie/api-client` `mollieClient.oauth.create()`
- Creates a new Mollie client with the access token
- Calls `GET /v2/organizations/me` to retrieve `id` (the org ID)
- Raw SQL UPDATE (scoped, append-only payout columns):
  ```sql
  UPDATE creator
  SET mollie_org_id = $1, kyc_status = 'pending'
  WHERE id = $2
    AND mollie_org_id IS NULL
  ```
  The `AND mollie_org_id IS NULL` guard prevents overwriting an existing link.
- Clears the state cookie
- 302 redirect to `/portal/payments?connected=1`

**Write constraint note:** This is a canonical-table write. Scoped strictly to the session creator's own row, payout-identity columns only (`mollie_org_id`, `kyc_status`). `payout_enabled` is never written from ohana-web in this pass. Flagged for review — a future pass should consider routing through an ohana-infra/admin-owned endpoint.

### C. Data access (`lib/portal/payments.ts`)

All functions accept `creatorId: string`, use `getPool()`, raw parameterised SQL.

```typescript
getEarningsSummary(creatorId): Promise<EarningsSummary>
// SELECT status, SUM(creator_share_amount) FROM creator_earning WHERE creator_id = $1 GROUP BY status
// + SELECT SUM(total_amount) FROM payout WHERE creator_id = $1 AND status = 'pending'

getRecentEarnings(creatorId, limit = 20): Promise<EarningRow[]>
// SELECT id, source_type, gross_basis_amount, creator_share_amount, currency, status, accrued_at
// FROM creator_earning WHERE creator_id = $1 ORDER BY accrued_at DESC LIMIT $2

getPayoutHistory(creatorId, limit = 10): Promise<PayoutRow[]>
// SELECT id, total_amount, currency, status, period_start, period_end, mollie_reference, initiated_at, paid_at
// FROM payout WHERE creator_id = $1 ORDER BY initiated_at DESC LIMIT $2

getSourcedBookings(creatorId, limit = 10): Promise<SourcedBookingRow[]>
// SELECT id, gross_amount, status, booked_at
// FROM booking WHERE sourcing_creator_id = $1 ORDER BY booked_at DESC LIMIT $2
```

### D. Updates to existing files

**`lib/portal/ambassador.ts`** — add `mollie_org_id: string | null` to `CreatorRecord` type and to the SELECT.

**`app/portal/page.tsx`** — replace "Earnings: Coming soon" with a link to `/portal/payments`.

**`app/portal/_components/PortalNav.tsx`** — add "Payments" nav link.

## Environment variables

| Var | Purpose |
|-----|---------|
| `MOLLIE_CLIENT_ID` | OAuth app client ID from Mollie partner dashboard |
| `MOLLIE_CLIENT_SECRET` | OAuth app client secret |
| `MOLLIE_REDIRECT_URI` | Full callback URL, e.g. `https://ohana.place/api/portal/mollie/callback` |

## New dependency

`@mollie/api-client` — official Node.js SDK. Used only in the two API routes.

## Out of scope

- Webhook handling for `kyc_status` / `payout_enabled` updates (OHA-38)
- Token refresh / storing the Mollie refresh token
- `payout_enabled` write from ohana-web
- Admin endpoint routing (flagged for future review)

## Verify

With `PORTAL_DEV_CREATOR_ID` set to a creator that has `creator_earning`/`payout` rows:
- Payments page shows correct accrued/available/paid totals and line items
- Payments page shows "Set up payouts" banner when `mollie_org_id` is null
- Connect flow redirects to Mollie, callback writes `mollie_org_id`, redirects to `/portal/payments?connected=1`
- Banner updates to "pending review" state after connect
