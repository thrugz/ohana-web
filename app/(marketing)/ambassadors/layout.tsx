import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Ambassador Programme — Ohana",
  description: "Share the places you love. Join the Ohana Ambassador Programme and earn your next trip.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
