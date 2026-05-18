# ohana-web

Marketing site and traveller onboarding for [Ohana](https://ohana.travel) — a travel companion that knows who you are.

Built on Next.js 16, Tailwind CSS v4, shadcn/ui (base-ui), and Motion (motion/react). Warm Scandinavian editorial aesthetic: OKLCH colour tokens, Fraunces variable font, spring physics throughout.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.6 (App Router, TypeScript strict) |
| Styles | Tailwind CSS v4 — CSS-first `@theme` config, no tailwind.config.js |
| Components | shadcn/ui (uses `@base-ui/react`, not Radix) |
| Animation | Motion (`motion/react`) + native CSS `animation-timeline: view()` |
| Map | Leaflet (marketing) + MapLibre GL JS globe (Moment Site); CartoDB Positron tiles; `ssr: false` dynamic import |
| Fonts | Fraunces (variable, axes: opsz/SOFT/WONK) + Inter via `next/font/google` |
| Colour | OKLCH perceptual scale — canvas, clay (#C56A3F), sage, ink |
| Auth | Better-Auth v1.6 + Drizzle adapter (`traveller_*` tables) + custom passkey plugin (`@simplewebauthn/server` v13) |
| Testing | Vitest + React Testing Library (`npm test`) |

## Pages

| Route | File | Description |
|---|---|---|
| `/` | `app/(marketing)/page.tsx` | Homepage — hero, marquee, demo, bento, scroll, FAQ, signup |
| `/about` | `app/(marketing)/about/page.tsx` | Mission, origin story, values, giving-back, team |
| `/pricing` | `app/(marketing)/pricing/page.tsx` | Free/Premium cards, comparison table, billing toggle, FAQ |
| `/ambassadors` | `app/(marketing)/ambassadors/page.tsx` | Ambassador programme hero, perks, apply form |
| `/moment` | `app/moment/page.tsx` | Traveller onboarding — 5-stage Hoku-led interview producing the Mana (Digital Twin) |
| `/discover` | `app/discover/page.tsx` | Destination discovery — mood/theme filtering, cluster cards, map |
| `/home` | `app/home/page.tsx` | Traveller home (auth-gated) — Hoku greeting, completeness bar, visited countries, Explorer Badge, saved places, Twin report export |
| `/home/profile` | `app/home/profile/page.tsx` | Twin profile editor (auth-gated) — countries, preferred moods, themes; autosaves via PATCH `/api/twin/profile` |
| `/portal` | `app/portal/page.tsx` | Ambassador portal (auth-gated, ambassador role required) — stats, payments, Mollie Connect |
| `/sign-in` | `app/sign-in/page.tsx` | Authentication — sign in or create account; passkey (WebAuthn/FIDO2) + email/password fallback |
| `*` | `app/not-found.tsx` | 404 — "This page doesn't exist. Yet." |

The Moment flow is backed by four API routes under `app/api/moment/` — `session` (anonymous session), `commit` (per-stage signal), `hoku` (LLM proxy), `clusters` (mood-matched destinations).

Twin profile API: `PATCH /api/twin/profile` (upsert visited countries / preferred moods / themes into `traveller_profile`), `GET /api/twin/export` (download JSON report). Discovery biasing: `GET /api/discover/wej` widens results with `OR moods && $preferred_moods` when the authenticated user has profile preferences.

## Key conventions

- `preload` (not `priority`) on `next/image` for above-fold images — Next.js 16 change
- Fraunces always at `fontWeight: 400`, never 700+. Display sizes use `fontVariationSettings: '"opsz" 144'`
- Accordion from `@base-ui/react` does not accept `type` or `collapsible` props — just `<Accordion className="...">`
- Motion values (`MotionValue`) work directly in `motion.*` style props — no `as React.CSSProperties` cast needed
- Scroll-driven animations use `@supports (animation-timeline: view())` with IntersectionObserver fallback in `components/ScrollReveal.tsx` for Safari/Firefox
- Page transitions via `app/(marketing)/template.tsx` (re-mounts on every navigation)
- Design tokens live in `app/globals.css` under `@theme inline {}`
- `FeedbackWidget` (global, in root layout) — floating button captures a screenshot + page URL and files a Linear issue in the Ohana project via `/api/feedback`

## Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_PASSKEY_RP_ID` | WebAuthn relying-party domain. Defaults to `window.location.hostname`. Set to `ohana.place` in production before launching passkey registration — credentials are domain-bound and cannot be migrated. |
| `NEXT_PUBLIC_SITE_ORIGIN` | Full origin used by the passkey plugin for WebAuthn verification (e.g. `https://ohana.place`). Defaults to `https://${NEXT_PUBLIC_PASSKEY_RP_ID}`. |
| `DATABASE_URL` | PostgreSQL connection string for the Drizzle adapter (traveller auth tables). Same DB as the Moment API. |

## Dev

```bash
npm install
npm run dev        # http://localhost:3100
npx tsc --noEmit   # type-check
```

## Project photos

Hero/destination photos live in `public/`: `bali.jpg`, `alentejo.jpg`, `kyoto.jpg`, `marrakech.jpg`, `sacred-valley.jpg`.

Neighbourhood card photos live in `public/neighborhoods/` (12 portrait-oriented JPEGs from Unsplash): `alfama`, `shimokitazawa`, `roma-norte`, `croix-rousse`, `sacred-valley`, `yeonnam-dong`, `pigneto`, `hauz-khas`, `le-marais`, `williamsburg`, `fushimi`, `paarel`.

To refresh photos: `node scripts/fetch-unsplash.mjs` (requires Unsplash API key in script).
