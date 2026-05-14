# ohana-web

Marketing site for [Ohana](https://ohana.travel) — a travel companion that knows who you are.

Built on Next.js 16, Tailwind CSS v4, shadcn/ui (base-ui), and Motion (motion/react). Warm Scandinavian editorial aesthetic: OKLCH colour tokens, Fraunces variable font, spring physics throughout.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.6 (App Router, TypeScript strict) |
| Styles | Tailwind CSS v4 — CSS-first `@theme` config, no tailwind.config.js |
| Components | shadcn/ui (uses `@base-ui/react`, not Radix) |
| Animation | Motion (`motion/react`) + native CSS `animation-timeline: view()` |
| Fonts | Fraunces (variable, axes: opsz/SOFT/WONK) + Inter via `next/font/google` |
| Colour | OKLCH perceptual scale — canvas, clay (#C56A3F), sage, ink |

## Pages

| Route | File | Description |
|---|---|---|
| `/` | `app/(marketing)/page.tsx` | Homepage — hero, marquee, demo, bento, scroll, FAQ, signup |
| `/about` | `app/(marketing)/about/page.tsx` | Mission, origin story, values, giving-back, team |
| `/pricing` | `app/(marketing)/pricing/page.tsx` | Free/Premium cards, comparison table, billing toggle, FAQ |
| `/ambassadors` | `app/(marketing)/ambassadors/page.tsx` | Ambassador programme hero, perks, apply form |
| `*` | `app/not-found.tsx` | 404 — "This page doesn't exist. Yet." |

## Key conventions

- `preload` (not `priority`) on `next/image` for above-fold images — Next.js 16 change
- Fraunces always at `fontWeight: 400`, never 700+. Display sizes use `fontVariationSettings: '"opsz" 144'`
- Accordion from `@base-ui/react` does not accept `type` or `collapsible` props — just `<Accordion className="...">`
- Motion values (`MotionValue`) work directly in `motion.*` style props — no `as React.CSSProperties` cast needed
- Scroll-driven animations use `@supports (animation-timeline: view())` with IntersectionObserver fallback in `components/ScrollReveal.tsx` for Safari/Firefox
- Page transitions via `app/(marketing)/template.tsx` (re-mounts on every navigation)
- Design tokens live in `app/globals.css` under `@theme inline {}`

## Dev

```bash
npm install
npm run dev        # http://localhost:3100
npx tsc --noEmit   # type-check
```

## Project photos

Destination photos live in `public/`: `bali.jpg`, `alentejo.jpg`, `kyoto.jpg`, `marrakech.jpg`, `sacred-valley.jpg`.
