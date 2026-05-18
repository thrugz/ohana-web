import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign in — Ohana",
  description: "Sign in or create your Ohana account.",
}

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
