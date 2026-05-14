import Link from "next/link"

const links = [
  {
    heading: "Product",
    items: [
      { label: "Experiences", href: "/#features" },
      { label: "Neighborhoods", href: "/#features" },
      { label: "Companions", href: "/#features" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "Ambassadors", href: "/ambassadors" },
      { label: "Press", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    heading: "Legal",
    items: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Cookies", href: "#" },
    ],
  },
  {
    heading: "Connect",
    items: [
      { label: "Instagram", href: "#" },
      { label: "Twitter / X", href: "#" },
      { label: "Newsletter", href: "#signup" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer
      className="px-8 py-16 md:px-20"
      style={{ borderTop: "1px solid var(--color-line)" }}
    >
      <div className="mb-12 grid gap-8 md:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
        {/* Brand */}
        <div className="md:pr-12">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-base" style={{ transform: "rotate(-10deg)", display: "inline-block" }}>🌺</span>
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontVariationSettings: '"opsz" 40',
                fontWeight: 300,
                fontSize: "18px",
                color: "var(--color-ink)",
              }}
            >
              Ohana
            </span>
          </div>
          <p className="text-[13px] leading-relaxed" style={{ color: "var(--color-muted)", maxWidth: 240 }}>
            A travel companion that knows who you are.
          </p>
          <p
            className="mt-4 text-[12px] italic"
            style={{ color: "oklch(0.75 0.01 80)", fontFamily: "var(--font-serif)" }}
          >
            Made with care, somewhere far from corporate.
          </p>
        </div>

        {/* Link columns */}
        {links.map((col) => (
          <div key={col.heading}>
            <p
              className="mb-4 text-[11px] uppercase tracking-widest"
              style={{ color: "var(--color-muted)" }}
            >
              {col.heading}
            </p>
            <ul className="space-y-2.5">
              {col.items.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[13px] no-underline transition-colors duration-150 hover:opacity-80"
                    style={{ color: "oklch(0.5 0.015 60)" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        className="flex flex-col items-start justify-between gap-4 border-t pt-8 text-[12px] md:flex-row md:items-center"
        style={{ borderColor: "var(--color-line)", color: "oklch(0.65 0.01 80)" }}
      >
        <span>© 2026 Skarnlabs. All rights reserved.</span>
        <span>Ohana is a travel companion. Not a booking engine. Not a search engine. Something better.</span>
      </div>
    </footer>
  )
}
