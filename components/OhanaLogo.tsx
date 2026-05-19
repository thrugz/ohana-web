// OhanaLogo — brand flower mark (🌺) + gradient wordmark.
// Mandated on every page that shows the brand. Never use a plain text link
// or inline SVG in its place.
//
// Props:
//   variant  "dark"  — gradient wordmark on a dark/image background (default)
//            "light" — gradient wordmark on a light surface (ink-toned)
//   size     text-size token applied to the wordmark span (default "text-[18px]")
//
// The gradient runs from clay (#C56A3F ~ oklch(0.62 0.14 45)) to a warm
// amber, giving the wordmark its editorial warmth against both dark and light
// backgrounds.

interface OhanaLogoProps {
  variant?: "dark" | "light"
  size?: string
}

export function OhanaLogo({ variant = "dark", size = "text-[18px]" }: OhanaLogoProps) {
  const isDark = variant === "dark"

  return (
    <span className="flex items-center gap-2">
      <span
        className="inline-block"
        style={{ filter: "drop-shadow(0 3px 6px oklch(0.62 0.14 45 / 0.30))" }}
      >
        🌺
      </span>
      <span
        className={`${size} italic`}
        style={{
          fontFamily: "var(--font-serif)",
          fontVariationSettings: '"opsz" 40',
          fontWeight: 400,
          background: isDark
            ? "linear-gradient(90deg, oklch(0.90 0.09 60), oklch(0.80 0.12 48))"
            : "linear-gradient(90deg, oklch(0.62 0.14 45), oklch(0.52 0.14 35))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Ohana
      </span>
    </span>
  )
}
