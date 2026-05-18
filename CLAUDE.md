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
- `getTwinData()` in `lib/twin/data.ts` reads the most recent `anonymous_session` row linked to the user, plus POI details for saved places.
- `greeting()` in `lib/twin/greeting.ts` is a pure function (no I/O) — safe to call in Server Components with `new Date()`.
- The "Your journeys" section is stubbed; tracked as Linear OHA-36. Itinerary builder is not available until W22+.

## MapLibre GL JS
- Used for the Stage 1 globe (`components/moment/GlobePicker.tsx`). Open-source — no Mapbox account, OSM vector tiles, globe projection.
- Like Leaflet, it accesses `window` at import time — load via `dynamic(..., { ssr: false })` or import inside `useEffect`, never at module top level.
- If MapLibre fails to load, `GlobePicker` degrades to a searchable country `<select>` driving the same `onChange`.
