import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import { getPortalSession } from "@/lib/portal/session"

export async function GET() {
  const session = await getPortalSession()
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const clientId = process.env.MOLLIE_CLIENT_ID
  const redirectUri = process.env.MOLLIE_REDIRECT_URI
  if (!clientId || !redirectUri) {
    return new NextResponse("Mollie not configured", { status: 503 })
  }

  const state = randomUUID()

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "organizations.read onboarding.read",
    response_type: "code",
    state,
  })

  const mollieUrl = `https://www.mollie.com/oauth2/authorize?${params.toString()}`

  const response = NextResponse.redirect(mollieUrl)
  response.cookies.set("mollie_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  })
  return response
}
