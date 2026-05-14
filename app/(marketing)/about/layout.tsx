import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About — Ohana",
  description: "Why we built Ohana, what we stand for, and our commitment to travel that leaves places better than we found them.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
