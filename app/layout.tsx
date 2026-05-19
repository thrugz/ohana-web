import type { Metadata } from "next"
import { Fraunces, Inter } from "next/font/google"
import "./globals.css"
import { CustomCursor } from "@/components/CustomCursor"
import { FeedbackWidget } from "@/components/FeedbackWidget"
import { ScrollReveal } from "@/components/ScrollReveal"
import { getTwinSession } from "@/lib/auth/session"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT", "WONK"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://ohana.place"),
  title: "Ohana — Your kind of place, found for you",
  description:
    "Ohana finds the neighborhoods, experiences, and people that match how you actually want to travel.",
  openGraph: {
    title: "Ohana — Your kind of place",
    description: "A travel companion that knows who you are.",
    type: "website",
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getTwinSession()
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        <CustomCursor />
        <ScrollReveal />
        {session?.user?.id && <FeedbackWidget />}
        {children}
      </body>
    </html>
  )
}
