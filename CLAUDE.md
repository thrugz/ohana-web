@AGENTS.md

## Next.js 16 specifics
- `preload` (not `priority`) on `<Image>` for above-fold images
- Page metadata requires a Server Component — wrap "use client" pages with a layout.tsx that exports `metadata`
- Page transitions: use `template.tsx` (not `layout.tsx`) — it re-mounts on every navigation

## shadcn/ui (base-ui) accordion
- Uses `@base-ui/react`, not Radix. No `type` or `collapsible` props. Just `<Accordion className="...">`

## Motion (motion/react)
- `MotionValue` works directly in `motion.*` style props — never cast to `as React.CSSProperties` (breaks TS)
- `useSpring` only accepts `number | string`, not `boolean` — use `useRef<boolean>` for flags
- Duplicate `style` props on the same JSX element silently discard all but one

## Git
- `ohana-web/` is gitignored in the parent repo — it has its own git history, run `git` from inside `ohana-web/`

## Linear workflow
- Updating Linear is MANDATORY after: feature completion, adding a comment to an issue, creating a new task, merging a PR, or opening/closing an issue. Never skip this.
- Use `mcp__claude_ai_Linear__save_issue` to set state to Done and attach the PR link via `links`.
- Use `mcp__claude_ai_Linear__save_comment` to add a comment to an issue.
- After concluding a main feature, ALWAYS run `/release-prep` — it updates README, captures session learnings in CLAUDE.md, generates a changelog entry, and is the standard wrap-up before starting the next cycle.

## Creator portal (`/portal`)
- Auth gate: `requireAmbassador()` in `app/portal/layout.tsx` — covers all portal routes. API routes call `getPortalSession()` directly for a 401 on auth failure.
- DB access uses raw `pg` via `getPool()` from `lib/moment/db` — no Drizzle in this repo.
- Creator slug is the stable identifier for portal data (e.g. `creators[]` column on `raw_pois`). Always fetch it from `getAmbassadorRecord().slug`, not the creator UUID.
- CSV import writes to `raw_pois` with `source='creator'` and `creators=[slug]`. Dedup is via `ON CONFLICT (source, source_id) DO NOTHING` where `source_id = buildSourceId(slug, name, addressOrCoords)`.
- `PORTAL_DEV_CREATOR_ID` env var bypasses auth in dev only — never set in deployed environments.

## Design system
- Fraunces: always `fontWeight: 400`, never 700+. Use `fontVariationSettings: '"opsz" 144'` at display sizes
- All colour tokens are in `app/globals.css` under `@theme inline {}` — do not hardcode hex values
- Scroll-driven animations: `@supports (animation-timeline: view())` block in globals.css + IntersectionObserver fallback in `components/ScrollReveal.tsx`

## next/og (ImageResponse)
- Do NOT use `export const runtime = "edge"` — crashes Turbopack dev silently (empty reply). Node.js runtime works.
- Satori doesn't support `userSelect` or `inset` shorthand CSS. Pass `Buffer` directly to `fonts[].data`, not `data.buffer as ArrayBuffer`.
- Satori rejects `width: "fit-content"` (build warning, ignored value). To shrink-wrap a flex item use `alignSelf: "flex-start"` instead.
- Set `metadataBase` in the root `app/layout.tsx` metadata (`new URL("https://ohana.travel")`) or OG/Twitter image URLs fall back to `localhost:3000`.
- Load fonts with `readFile` from `node:fs/promises` (file in `public/fonts/`) — Google Fonts fetch hangs unreliably in OG routes.

## Scroll animations
- Prefer `data-reveal="toss"` (CSS `animation-timeline: view()`) over `useInView` + spring for scroll-linked feel.
- Adding a new `data-reveal` variant needs three edits: observer selector in `ScrollReveal.tsx`, `@supports not` fallback, `@media (prefers-reduced-motion)` block.

## Leaflet / react-leaflet
- Always load with `dynamic(() => import(...), { ssr: false })` — Leaflet accesses `window` at import time and crashes SSR.
- Default marker icons break in Next.js; patch with `delete L.Icon.Default.prototype._getIconUrl` + `L.Icon.Default.mergeOptions(...)` in a `useEffect`.
- CartoDB Positron tiles (`https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`, subdomains `abcd`) give a clean minimal aesthetic matching the brand.

## Scroll container hover clip
- `overflow-x: scroll` forces `overflow-y: auto` per CSS spec — cards animated upward with `whileHover={{ y: -N }}` will be clipped. Fix: add `pt-4` (or sufficient padding-top) to the scroll container so the overflow is inside the padding box.

## Coolify deployment
- Coolify cannot clone private GitHub repos without GitHub App auth configured — make the repo public or set up the GitHub App integration.
- `COOLIFY_TOKEN` is not available in the shell env; use MCP Coolify tools for all API calls (curl with `$COOLIFY_TOKEN` returns 401).
- ohana-web auto-deploys from `main` (ohana-admin deploys from `staging` — different convention per repo).

## Testing
- Test runner is Vitest + React Testing Library. `npm test` (run once), `npm run test:watch`.
- Config: `vitest.config.ts` (jsdom env, `@` alias). Setup: `vitest.setup.ts` imports `@testing-library/jest-dom/vitest`.
- Mock external boundaries — no live LLM, DB, or WebGL calls in tests. `maplibre-gl` touches WebGL; mock it in component tests.

## Moment Site (`/moment`)
- Traveller onboarding: a 5-stage Hoku-led interview producing the Mana (the user-facing name for the Digital Twin). Code under `app/moment/`, `components/moment/`, `lib/moment/`, `app/api/moment/`.
- The flow is a client-side state machine (`lib/moment/momentMachine.ts`) — deterministic, instant, no LLM in the stage loop.
- The `hoku_agent` LLM is called at exactly two moments: Stage 2 free-text reflection (`mode: "reflect"`) and Stage 4 mood portrait (`mode: "portrait"`). A failed/empty Hoku reply must fall back to a pre-authored line — the flow never blocks on the LLM.
- Anonymous data accumulates in the PostgreSQL `anonymous_session` table (ohana-infra migration 043), keyed by an httpOnly cookie token. Better-Auth links it to a real account on signup.
- Brand vocabulary: engineering says *Twin*, the UI/Hoku say **Mana**. The Stage 4 reveal is the **Moods Atlas**. **Explorer Badge** is a deterministic tier from countries-visited count (The Curious / Explorer / Adventurer / Wanderer / Nomad / Legend) — "Wanderer" is a tier, never a generated name.

## Better-Auth (`lib/auth/`)
- `advanced: { database: { generateId: "uuid" } }` is load-bearing. Without it, Better-Auth generates base62 IDs that crash UUID columns in Postgres.
- Better-Auth 1.6.x has no built-in passkey plugin. The custom `travellerPasskeyPlugin` in `lib/auth/passkey-plugin.ts` uses `createAuthEndpoint` + `@simplewebauthn/server` v13 directly.
- `lib/db/client.ts` creates the pg Pool with `process.env.DATABASE_URL ?? ""` (no throw at module load). Connection errors surface at query time, not import time — Next.js build loads the module early.
- Challenge storage for WebAuthn uses `internalAdapter.createVerificationValue` / `consumeVerificationValue` on the existing `traveller_verifications` table. Keys: `passkey-reg:${email}` for registration, `passkey-auth:${challengeId}` for sign-in.
- Anonymous session linking (`UPDATE anonymous_session SET linked_user_id = $1 WHERE id = $2 AND linked_user_id IS NULL`) runs in both register and authenticate endpoints after a session is created.

## @simplewebauthn/server v13
- `verifyRegistrationResponse` returns `registrationInfo.credential` (not `credential.deviceType`). Device type and backed-up flag are at `registrationInfo.credentialDeviceType` and `registrationInfo.credentialBackedUp`.
- `registrationInfo.aaguid` is available directly on the registrationInfo object.

## WebAuthn / Passkeys (`/sign-in`)
- RP ID is `NEXT_PUBLIC_PASSKEY_RP_ID` env var, defaulting to `window.location.hostname`. Set it to `ohana.place` before any passkey registration goes live in production — credentials are bound to the RP ID at creation and cannot be migrated across domains.
- Origin for WebAuthn verification is `NEXT_PUBLIC_SITE_ORIGIN`, defaulting to `https://${rpID}`.
- `authenticatorAttachment: "platform"` + `residentKey: "required"` — device-bound, discoverable credentials only (Face ID / Touch ID / Windows Hello). No roaming hardware keys.
- Sign-in tab calls `/api/auth/passkey/auth-options` (no allowCredentials) → browser shows native account picker. No email field needed on that path.
- `NotAllowedError` from `credentials.create/get` = user cancelled; treat as idle, not an error.

## Traveller home (`/home`)
- Gated by `requireTwin()` from `lib/auth/session.ts` — redirects to `/sign-in` if not authenticated.
- `getTwinData()` in `lib/twin/data.ts` reads the most recent `anonymous_session` row linked to the user, plus POI details for saved places. It also calls `getProfile()` in parallel — profile data takes priority over anonymous session data for `visitedCountries`.
- `greeting()` in `lib/twin/greeting.ts` is a pure function (no I/O) — safe to call in Server Components with `new Date()`.
- The "Your journeys" section is stubbed; tracked as Linear OHA-36. Itinerary builder is not available until W22+.

## Traveller Twin profile (`lib/twin/profile.ts`)
- `getProfile(userId)` returns `TravellerProfile | null` — null means no row yet, always use `?? []` defaults at call sites.
- `upsertProfile(userId, patch)` does `INSERT ... ON CONFLICT (user_id) DO UPDATE SET visited_countries = COALESCE($2, EXCLUDED.visited_countries), ...` — pass only the fields you want to update; omitted fields are preserved via COALESCE.
- `traveller_profile.user_id` has a UNIQUE constraint — one row per user, never insert duplicates.
- The Profile page fetches POI vocabulary (moods/themes) via `SELECT DISTINCT unnest(moods) FROM poi_final WHERE operational_status = 'active'` — this can return empty arrays in dev if no POIs are enriched.

## Discovery (`app/api/discover/wej/route.ts`)
- `poi_final` has an `operational_status` column (not `status`) — the lifecycle column introduced in migration 043. Filter with `operational_status = 'active'`.
- `poi_final.moods` and `poi_final.themes` are TEXT[] GIN-indexed — use `@>` (array containment) for exact single-value filtering, `&&` (overlap) for OR-style biasing.
- `buildWejQueryBiased` widens the mood filter to `(moods @> $1 OR moods && $3)` when `preferredMoods` is non-empty — `$3` is the full preferred moods array. Returns to exact match when the array is empty.
- The GET handler silently falls back to unbiased results if the session or profile fetch throws — discovery must never block on auth errors.

## MapLibre GL JS
- Used for the Stage 1 globe (`components/moment/GlobePicker.tsx`). Open-source — no Mapbox account, OSM vector tiles, globe projection.
- Like Leaflet, it accesses `window` at import time — load via `dynamic(..., { ssr: false })` or import inside `useEffect`, never at module top level.
- If MapLibre fails to load, `GlobePicker` degrades to a searchable country `<select>` driving the same `onChange`.

## Dev ports
- ohana-web runs on port 3002 (`npm run dev -- -p 3002`) — port 3000 is kawa, 3001 is ohana-admin.

## Postgres (local dev tunnel)
- The DB container is not port-exposed. Tunnel: `ssh -L 5433:10.10.16.3:5432 bla@10.0.0.42 -N -f`
- Then set in `.env.local`: `DATABASE_URL=postgresql://ohana:KSNpxLGDNbO9fJmgWW7dN8qbajcghlNk@localhost:5433/ohana` and `DATABASE_SSL=disable`
- Container name: `postgres-g6bos38cwqg7pjuit7c2yg0i-210604697309`

## Creator portal (`/portal`)
- `PORTAL_DEV_CREATOR_ID` in `.env.local` bypasses the creator auth gate in dev — set to a valid creator UUID.
- A `dev-test` creator (UUID `2045ad69-8bf7-44a9-8c01-55355b47bf53`, slug `dev-test`) exists for local testing.
- `stageImport` returns `inserted: 0` on re-import — correct behaviour, not a bug (`ON CONFLICT DO NOTHING`).
