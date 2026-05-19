# Changelog

## [v0.12.0] — 2026-05-19

### Features
- Add `OhanaLogo` component (`components/OhanaLogo.tsx`) — gradient wordmark with `variant` prop for dark/light backgrounds. Replaces plain-text logo links in `SiteNav` and `PortalNav`. (A-12/A-13)
- Wire Stage 4 "Save it" CTA to inline passkey registration — email field + `passkeyRegister` call appears directly in `SaveManaPrompt`; on success links the anonymous session to the new account and dismisses the prompt. Flow never blocks on failure. (OHA follow-up from audit)
- Extract `passkeyRegister` and `passkeyAuthenticate` into `lib/auth/passkey-client.ts` — single import source for both `sign-in/page.tsx` and `SaveManaPrompt`

### Fixes
- Align all production domain references to `ohana.place` — `metadataBase` in `app/layout.tsx`, the QR code URL in `GetTheApp`, and the itinerary email sender and footer link (OHA-57)
- Gate `POST /api/feedback` behind a session check — anonymous callers now receive 401; `FeedbackWidget` surfaces a "Sign in to send feedback" message rather than failing silently (OHA-59)
- Mount `FeedbackWidget` only when a session exists — prevents the auth wall from appearing to unauthenticated visitors on public marketing pages
- Correct team location on `/about` to Copenhagen only (was: Copenhagen, Lisbon, Tokyo)
- Revert Stage 4 hard `/sign-in` redirect to spec-compliant dismiss behaviour — hard signup gate belongs at the itinerary step per spec §5, not the Stage 4 emotional peak

### Changes
- Expand README env-var table with `BREVO_SMTP_*`, `MOLLIE_*`, `LINEAR_*`, `HAYSTACK_URL`, and `PORTAL_DEV_CREATOR_ID` (A-02)
- Fix README itinerary API description from "via Resend" to "Brevo SMTP" (A-01)

## [v0.11.0] — 2026-05-19

### Features
- Add Mollie KYC webhook — `POST /api/portal/mollie/webhook` verifies HMAC-SHA256 signatures, dedupes via `mollie_webhook_event`, and flips `creator.payout_enabled` + `kyc_status` on KYC completion (OHA-47)
- Apply v1 partnership copy to `/ambassadors` — earnings streams, payment schedule, FAQ, principles sections
- Wire `/ambassadors` application form to `POST /api/ambassadors/apply` — writes to `creator_application`

### Changes
- Migrate transactional email from Resend to Brevo SMTP (EU data residency) — `nodemailer` over STARTTLS, configured via `BREVO_SMTP_*` env vars

## [v0.10.0] — 2026-05-19

### Features
- Add itinerary planner — `/plan/[id]` page with day-by-day view and email send button
- Add `POST /api/plan/generate` — deterministic bin-packing itinerary from destination list
- Add `GET /api/plan/[id]` and `POST /api/plan/[id]/send` — fetch and email itineraries via Resend
- Add itinerary DB layer — `createItinerary`, `getItinerary`, `listItineraries`
- Add creator CSV import — `POST /api/portal/guides/import` validates and stages rows into `raw_pois`
- Wire "Your journeys" section on traveller home to `listItineraries`

### Fixes
- Fix XSS vulnerability in itinerary email by escaping HTML in place names
- Fix plan send route error handling and add design token for error colour
- Fix day header city casing and simplify `SendEmailButton`
- Fix `createItinerary` to be atomic with UUID validation

## [v0.9.0] — 2026-05-18

### Features

- **Twin profile editor** (`/home/profile`) — auth-gated page to edit visited countries, preferred moods, and themes. Changes autosave via a 500 ms debounce calling `PATCH /api/twin/profile`. Vocabulary (available moods/themes) is fetched live from `poi_final`.
- **`PATCH /api/twin/profile`** — upsert endpoint for `traveller_profile`. Accepts partial payloads; fields not sent are preserved via COALESCE. 401 on missing session.
- **`GET /api/twin/export`** — download Twin report as JSON (`twin-report.json`). Includes name, Explorer Badge, visited countries, preferred moods/themes, and saved place names.
- **`/home` completeness bar** — progress indicator (0/3, 1/3, 2/3, 3/3) based on countries, moods, and themes being filled. Links to `/home/profile` when incomplete.
- **Profile nav link** — "Profile" link added to `HomeNav.tsx` pointing to `/home/profile`.
- **Discovery biasing** (`GET /api/discover/wej`) — when the authenticated user has `preferredMoods` in their profile, the Wej query widens results with `OR moods && $preferred_moods` instead of exact-match only. Falls back silently if the profile fetch fails.
- **`lib/twin/profile.ts`** — `getProfile` / `upsertProfile` data layer; `TravellerProfile` and `ProfilePatch` types.
- **Portal payments page** (`/portal/payments`) — earnings summary, payout history, and sourced bookings list. Data layer in `lib/portal/payments.ts`.
- **Mollie Connect OAuth** — `/api/portal/mollie/connect` redirect and `/api/portal/mollie/callback` exchange. Writes `mollie_org_id` to the `creator` row on success. Error banners surfaced on the portal OAuth page.
- **`ohana-infra` migrations 057–071** applied to production: traveller auth tables (058), creator consolidation (062), merge hardening (068), passkey table (069), traveller profile table (070), `event_final` materialized view (071).

### Fixes

- Portal: `isUuid` guard on `creatorId`, error logging, `period_end` null safety, OAuth error banners.
- Portal: `getPortalSession` resolves from the live traveller session correctly.
- Lockfile regenerated on Linux to include `wasm` optional deps.

## [v0.8.0] — 2026-05-18

### Features

- **Better-Auth wiring** — full traveller auth stack: `lib/db/schema.ts` (Drizzle pgTable definitions for all `traveller_*` tables), `lib/db/client.ts` (pooled pg singleton), `lib/auth/config.ts` (betterAuth + drizzleAdapter), `app/api/auth/[...all]/route.ts`. UUID generation is forced via `advanced.database.generateId: "uuid"` — base62 IDs crash Postgres UUID columns.
- **Custom passkey plugin** (`lib/auth/passkey-plugin.ts`) — Better-Auth 1.6.x has no built-in passkey plugin; implemented `travellerPasskeyPlugin` with four endpoints (`/passkey/register-options`, `/passkey/register`, `/passkey/auth-options`, `/passkey/authenticate`) using `@simplewebauthn/server` v13. Challenges stored via Better-Auth's internal adapter on `traveller_verifications`.
- **Anonymous session linking** — after passkey register or authenticate, the `moment_session` cookie is read and `anonymous_session.linked_user_id` is set, connecting the anonymous Mana to the new account.
- **`/home` route** (auth-gated) — traveller home with time-of-day and holiday-aware Hoku greeting, "Where you've been" country image strip, Explorer Badge, Mana portrait, saved places, and a stubbed "Your journeys" section (tracked OHA-36).
- **Infra migration 066** (`ohana-infra`) — `traveller_passkey` table for WebAuthn credential storage.
- **Sign-in page rewired** — `passkeyRegister` and `passkeyAuthenticate` now call the real Better-Auth endpoints via `@simplewebauthn/browser`. Email/password routes through `authClient.signIn.email` / `authClient.signUp.email`. On success redirects to `/home`.

### Notes

- Apply `ohana-infra/migrations/066_traveller_passkey.sql` before passkey registration works in dev.
- Set `NEXT_PUBLIC_PASSKEY_RP_ID=ohana.place` and `NEXT_PUBLIC_SITE_ORIGIN=https://ohana.place` before any production registrations.
- Journeys section is stubbed pending the Itinerary Builder (W22+, OHA-36).

## [v0.7.0] — 2026-05-18

### Features

- **Ambassador portal** (`/portal`) — auth-gated section for users with `ambassador` role: stats, links, content tools.
- **Discover route** (`/discover`) — destination discovery with mood/theme filtering, cluster cards, and map view. Cold-start mood pick when no Mana exists; thin-data framing when session has too few signals.
- **Save/unsave POIs** — `/api/moment/save` route writes to `anonymous_session.saved_pois`; Discover feed has a save tray.
- **Wej feed** — scored-and-ranked POI cards with collapsed/expanded states and source attribution.

### Fixes

- Discover themes route now honours cold-start mood override.
- Slugify free-text steer; surface themes-fetch errors with user-visible message; a11y fixes on save button.
- Stable save `aria-label`, deduplicated city display, null-photo guard.
- Session cookie linked correctly to Moment sign-up.

## [v0.6.0] — 2026-05-18

### Features

- **Sign-in page** (`/sign-in`) — split-layout auth page matching the marketing aesthetic: Bali hero photo panel on the left, clean form on the right. Tabs for "Sign in" / "Create account" with a spring-animated underline indicator.
- **Passkey authentication** — WebAuthn/FIDO2 via raw browser API (`navigator.credentials.create/get`). Platform authenticators only (`authenticatorAttachment: "platform"`), discoverable credentials required. Sign-in fires the native credential picker with no email needed; sign-up binds the passkey to the provided email + name. RP ID is driven by `NEXT_PUBLIC_PASSKEY_RP_ID` (defaults to `hostname`).
- **Email/password fallback** — password form with floating-label inputs sits below the passkey button with an "or" divider.

### Fixes

- **Nav contrast** — link opacity over the hero increased from 55–65% white to 88% white; scrolled state upgraded from `--color-muted` to `--color-ink` for sharper legibility.
- **Sign in link** — `href="#"` replaced with `/sign-in` (both desktop and mobile nav).

### Notes

- Passkey credential persistence is a stub (`localStorage` + `TODO` comment). Wire to Better Auth when the backend is ready.
- WebAuthn credentials are domain-bound — set `NEXT_PUBLIC_PASSKEY_RP_ID=ohana.place` before any registrations go live in production to avoid a forced re-registration at cutover.

## [v0.5.0] — 2026-05-16

### Features

- **Moment Site** (`/moment`) — the 5-stage Hoku-led traveller onboarding flow, producing the anonymous Mana (Digital Twin). Built across 7 phases:
  - **Foundation** — client-side state machine, anonymous-session API (`anonymous_session` table, httpOnly cookie token, Better-Auth link-on-signup), Hoku client, chat-thread shell
  - **Stage 1 "Your World"** — MapLibre GL JS globe; tap visited countries
  - **Stage 2 "Mood Match"** — image selection (the founder's "Act 0" set — pick the scene that resonates), each image mapping to canonical mood slugs, plus one free-text beat Hoku reflects on
  - **Stage 3 "Feel Something"** — cluster cards across the 8 canonical Mood Clusters, mood-matched from `poi_final`
  - **Stage 4 "Moods Atlas"** — computed Explorer Badge tier + Hoku-generated mood portrait
  - **Stage 5 "Moments"** — bridge to Discovery
  - **Signup** — soft, skippable "Save your Mana" prompt after the Stage 4 reveal
- **Vitest** test runner added (`npm test`) — 25 tests across the Moment Site
- **MapLibre GL JS** — open-source globe for Stage 1 (no Mapbox account; OSM vector tiles)

### Notes

- Hoku LLM calls degrade gracefully — a failed/empty reply falls back to a pre-authored line; the flow never blocks
- Deferred (intended): the "Save it" signup button is a stub pending Better-Auth setup; the Stage 5 Discovery CTA links to `/discover` (Sprint 5)

## [v0.4.0] — 2026-05-15

### Features

- **Feedback widget** — floating `FeedbackWidget` in the root layout; captures a screenshot (`html-to-image`) and the current page URL, posts to `/api/feedback`, which files a Linear issue in the Ohana project and auto-creates a `web` label

### Fixes

- Removed `app/page.tsx` so `/` resolves through the `(marketing)` route group layout
- Escaped unbalanced quotes/apostrophes in `Companions`, `about`, `ambassadors`, and `not-found` (10 `react/no-unescaped-entities` lint errors); now renders proper curly quotes
- Removed unused `useEffect`/`useState` imports and the dead `primary` prop from `Hero`
- OG image: `width: "fit-content"` is invalid in Satori — swapped to `alignSelf: "flex-start"`
- Set `metadataBase` to `https://ohana.travel` so OG/Twitter image URLs resolve absolutely instead of falling back to `localhost:3000`

## [v0.3.0] — 2026-05-14

### Features

- **OpenStreetMap** — real Leaflet map in DemoStrip replacing fake CSS grid; CartoDB Positron tiles, branded pill markers for Alfama, Príncipe Real, LX Factory; loaded with `ssr: false` dynamic import
- **Auto-scroll neighbourhood strip** — 12 destinations (up from 6) with RAF-based infinite loop at 0.55 px/frame; pauses on hover/drag; seamless reset at the halfway point of a duplicated array
- **Unsplash photos** — all 12 neighbourhood cards and 5 site hero images replaced with real Unsplash photos via `scripts/fetch-unsplash.mjs`

### Fixes

- Neighbourhood card hover clip: `overflow-x: scroll` was forcing `overflow-y: auto` and clipping upward hover animation — fixed with `pt-4` padding buffer on the scroll container

## [v0.2.0] — 2026-05-14

### Features

- **OG image** — `app/opengraph-image.tsx` with Fraunces italic, ghost watermark, clay top bar, destination pills; font loaded from `public/fonts/fraunces-italic.ttf` via `readFile` (Node.js runtime — edge runtime crashes Turbopack dev)
- **TossReveal** — `components/TossReveal.tsx` scroll-linked panel entrance using CSS `animation-timeline: view()` (Chromium) with IntersectionObserver fallback; applied to bento tiles, press cards, HowItWorks steps, testimonial cards, neighbourhood photo cards
- **Bento tile illustrations** — per-tile inline components: ExperienceCard, NeighborhoodPins (SVG grid + pulsing dots), CompanionAvatars, ItineraryList, OfflineBadge
- **GetTheApp section** — phone mockup with fake status bar and itinerary content, QR code (qrcode.react), App Store + Google Play buttons with spring hover
- **Press strip** — 4-card grid: Condé Nast Traveller, Monocle, Travel + Leisure, Wallpaper*

### Fixes

- Scroll reveal feel: replaced `useInView` + spring (fires independently of scroll) with `data-reveal="toss"` CSS scroll-driven animation for panels that track scroll position
- OG image: removed unsupported Satori CSS (`userSelect`, `inset` shorthand); pass `Buffer` directly to `fonts[].data`

## [v0.1.0] — 2026-05-14

Initial build of the Ohana marketing site.

### Features

- **Homepage** — cinematic full-bleed hero (Bali, mouse-tracking parallax, word-by-word headline stagger, magnetic CTA), dual-track marquee destination ticker, typewriter demo strip with pseudo-map, 5-tile feature bento grid (mouse-tracking spotlight), 3-step how-it-works with animated hairline, draggable neighbourhood scroll (6 cards), testimonials, 4-card press strip, FAQ accordion, confetti email signup, footer
- **`/about`** — mission statement at display scale, 2-col editorial pull-quote, 4-value grid, full-bleed giving-back section, team note
- **`/pricing`** — free/premium card pair with monthly/annual billing toggle, feature comparison table with staggered row animation, FAQ
- **`/ambassadors`** — hero with alentejo photo, perks bento, 3-step how-to-join, application form with confetti burst on submit
- **404** — "This page doesn't exist. Yet." with ghost numerals, spring-pop destination pills, clay CTA
- **SiteNav** — transparent → frosted on scroll, mobile hamburger with animated X, Fraunces slide-in links
- **Page transitions** — `template.tsx` fade+lift on every route change
- **Design system** — OKLCH colour tokens (canvas, clay, sage, ink, muted, line), Fraunces variable font (opsz/SOFT/WONK axes), spring easing variables, scroll-reveal keyframes with `animation-timeline: view()` + IntersectionObserver fallback
- **Custom cursor** — lerp morphing cursor with 5 context states (`default`, `dark`, `button`, `photo`, `drag`)
- Per-page metadata, real nav/footer links, social proof avatar fix
