import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "./config"

export async function getTwinSession() {
  return auth.api.getSession({ headers: await headers() })
}

export async function requireTwin() {
  const session = await getTwinSession()
  if (!session?.user?.id) redirect("/sign-in")
  return session.user
}
