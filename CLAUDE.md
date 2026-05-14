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
