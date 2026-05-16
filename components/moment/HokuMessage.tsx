// A single chat bubble. Hoku speaks from the left, the traveller from the right.
import type { ReactNode } from "react"

export function HokuMessage({
  from,
  children,
}: {
  from: "hoku" | "traveller"
  children: ReactNode
}) {
  const isHoku = from === "hoku"
  return (
    <div className={`flex ${isHoku ? "justify-start" : "justify-end"}`}>
      <div
        className={[
          "max-w-[80%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed",
          isHoku
            ? "bg-surface text-ink rounded-bl-sm border border-line"
            : "bg-clay text-primary-foreground rounded-br-sm",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  )
}
