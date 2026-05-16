// The chat thread container. Stages append HokuMessage bubbles as children.
import type { ReactNode } from "react"

export function HokuThread({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-8">
      {children}
    </div>
  )
}
