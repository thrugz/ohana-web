@AGENTS.md

# CLAUDE.md — ohana-web coding agent

## Role

You are the implementation agent for **ohana-web** — the traveller-facing Next.js 16 app. Your job is to write, fix, and ship code in this repo. You do not touch ohana-infra migrations, ohana-admin, or ohana-haystack. When a task requires a schema change, stop and say so — that work belongs to the infra agent.

**Live routes:** `/` (marketing), `/moment` (Twin onboarding), `/home` (dashboard), `/discover` (Wej feed), `/plan` (itinerary builder), `/portal` (creator hub), `/ambassadors` (creator landing), `/sign-in`

**Demo path (F&F, 19 June):** `/moment` → `/home` → `/discover` → `/plan`

---

## Before you write anything

1. Run `npx tsc --noEmit` to see the current error baseline.
2. Read `node_modules/next/dist/docs/` for any Next.js API you're about to use — this version has breaking changes from training data.
3. For any external library (motion, better-auth, @base-ui/react, @simplewebauthn/server): check `node_modules/<pkg>/dist/` or query Context7 MCP. APIs drift between minors.

---

## Non-negotiable patterns

### Canonical domain
- The production domain is `ohana.place`. Never write `ohana.travel` or `ohana.world` anywhere — in code, comments, strings, or docs. Both are stale.
- `metadataBase` in `app/layout.tsx`, `NEXT_PUBLIC_PASSKEY_RP_ID`, `NEXT_PUBLIC_SITE_ORIGIN`, `MOLLIE_REDIRECT_URI`, and the Brevo sender address must all reference `ohana.place`.

### OhanaLogo
- Always use `<OhanaLogo />` from `components/OhanaLogo.tsx` wherever the Ohana wordmark appears (nav, footers, auth pages).
- Use the `variant` prop: `"dark"` for light backgrounds (default), `"light"` for dark/hero backgrounds.
- Never use plain text, a raw `<img>`, or inline SVG as the logo. This is non-negotiable on every page.

### Auth
- `getTwinSession()` → returns session or null, never throws. Use in API routes.
- `requireTwin()` → redirects to `/sign-in` if not authenticated. Use in `layout.tsx` for auth-gated routes.
- `getPortalSession()` → for portal API routes, returns 401 on failure.
- `requireAmbassador()` → for portal layout gate.
- Never expose `DATABASE_URL` or session secrets to client components.

### DB access
- `getPool()` from `lib/moment/db` — raw `pg` Pool. No Drizzle in this repo.
- All queries use parameterised values (`$1`, `$2`). No string interpolation.
- Read from `poi_final` (materialized view), never from `pois` directly.
- `poi_final.operational_status` is the lifecycle column — filter `= 'active'`, never `= 'open'`.

### Design system
- All colour tokens: `var(--color-*)` from `app/globals.css @theme inline`. Never hardcode hex.
- Fraunces (serif): always `fontWeight: 400`, never 700+. Use `fontVariationSettings: '"opsz" 144'` at display sizes.
- Tailwind utility classes for layout. `style={{}}` only for runtime-computed values (data-driven colours, motion values).

### Next.js 16 specifics
- `preload` (not `priority`) on `<Image>` for above-fold images.
- Page metadata needs a Server Component — wrap `"use client"` pages with a `layout.tsx` that exports `metadata`.
- `searchParams` in page components is a `Promise` — always `await searchParams` before destructuring.
- `export const runtime = "edge"` crashes Turbopack silently. Use Node.js runtime.
- Page transitions: `template.tsx` (not `layout.tsx`) — it re-mounts on every navigation.

### Motion (motion/react)
- `MotionValue` works directly in `motion.*` style props — never cast to `as React.CSSProperties`.
- `useSpring` accepts `number | string` only — use `useRef<boolean>` for flags.
- Duplicate `style` props on the same JSX element silently discard all but one.

### shadcn/ui accordion
- Uses `@base-ui/react`, not Radix. No `type` or `collapsible` props. Just `<Accordion className="...">`.

### Leaflet / MapLibre
- Always `dynamic(() => import(...), { ssr: false })` — both access `window` at import time.
- MapLibre: if it fails to load, `GlobePicker` degrades to a country `<select>`.

### Moment Site state machine
- `lib/moment/momentMachine.ts` is deterministic — no LLM in the stage loop.
- `hoku_agent` LLM is called at exactly two points: Stage 2 reflect and Stage 4 portrait.
- A failed/empty Hoku reply must fall back to a pre-authored line — the flow never blocks on the LLM.

### Better-Auth
- `advanced: { database: { generateId: "uuid" } }` is load-bearing — without it, base62 IDs crash UUID columns.
- Challenge storage for WebAuthn uses `internalAdapter.createVerificationValue` / `consumeVerificationValue`.
- Anonymous session linking runs in both register and authenticate endpoints.

### Email (Brevo SMTP)
- Env vars required: `BREVO_SMTP_HOST`, `BREVO_SMTP_PORT`, `BREVO_SMTP_USER`, `BREVO_SMTP_PASS`. If any are absent, `sendItineraryEmail` is a no-op (console.log in dev, returns early). Never throw.
- Uses `nodemailer` with STARTTLS (port 587, `secure: false`, `requireTLS: true`). Sender: `hello@ohana.place` / `Ohana`. (Requires `ohana.place` to be a verified Brevo sending domain — OHA-64.)

### Dev server
- Port 3002: `npm run dev -- -p 3002`
- DB tunnel: `ssh -L 5433:10.10.16.3:5432 bla@10.0.0.42 -N -f`
- `DATABASE_URL=postgresql://ohana:KSNpxLGDNbO9fJmgWW7dN8qbajcghlNk@localhost:5433/ohana` + `DATABASE_SSL=disable`

---

## Terminology (brand vs code)
- Code: **Twin** / UI/Hoku: **Mana**
- Stage 4 reveal: **Moods Atlas**
- Explorer Badge tiers: The Curious / Explorer / Adventurer / Wanderer / Nomad / Legend — deterministic from countries-visited count
- Everyone who contributes POIs: **creator** (DB entity). "Ambassador" is the brand name for the first cohort.
- DB spelling: `traveller` (double-L) always. Single-L is wrong.

---

## Verification gate

Never say a task is done without:
1. `npx tsc --noEmit` — zero new errors.
2. Manually hitting the affected route with `npm run dev -- -p 3002` if it's a UI change.
3. Running `npm test` if there are existing tests for the affected module.

"It should work" is not evidence.

---

## Next.js 16 specifics (from AGENTS.md)
Read `node_modules/next/dist/docs/` before writing any Next.js code. Breaking changes from training data exist. Heed deprecation notices.
