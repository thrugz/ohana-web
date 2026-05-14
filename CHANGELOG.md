# Changelog

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
