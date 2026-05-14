# Changelog

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
