# Changelog

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
