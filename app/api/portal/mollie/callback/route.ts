import { NextRequest, NextResponse } from "next/server"
import createMollieClient, { OAuthGrantType } from "@mollie/api-client"
import { getPool } from "@/lib/moment/db"
import { getPortalSession } from "@/lib/portal/session"

// Canonical-table write: scoped to session creator's own row, payout columns only.
// Flagged for review — consider routing through ohana-infra/admin endpoint in a future pass.

export async function GET(request: NextRequest) {
  const session = await getPortalSession()
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const stateCookie = request.cookies.get("mollie_oauth_state")?.value

  if (!code || !state || !stateCookie || state !== stateCookie) {
    return NextResponse.redirect(new URL("/portal/payments?error=state_mismatch", request.url))
  }

  const clientId = process.env.MOLLIE_CLIENT_ID
  const clientSecret = process.env.MOLLIE_CLIENT_SECRET
  const redirectUri = process.env.MOLLIE_REDIRECT_URI
  if (!clientId || !clientSecret || !redirectUri) {
    return new NextResponse("Mollie not configured", { status: 503 })
  }

  try {
    // Exchange code for access token
    const oauthClient = createMollieClient({ apiKey: "" })
    const token = await oauthClient.oauth.create({
      clientId,
      clientSecret,
      grant_type: OAuthGrantType.authorization_code,
      code,
      redirect_uri: redirectUri,
    })

    // Fetch the connected Mollie organisation ID
    const orgClient = createMollieClient({ accessToken: token.access_token })
    const org = await orgClient.organizations.getCurrent()
    const mollieOrgId = org.id

    // Write to creator — session creator's row only, mollie_org_id + kyc_status only.
    // AND mollie_org_id IS NULL prevents overwriting an existing link.
    const pool = getPool()
    await pool.query(
      `UPDATE creator
       SET mollie_org_id = $1, kyc_status = 'pending'
       WHERE id = $2
         AND mollie_org_id IS NULL`,
      [mollieOrgId, session.creatorId],
    )

    const response = NextResponse.redirect(new URL("/portal/payments?connected=1", request.url))
    response.cookies.set("mollie_oauth_state", "", { maxAge: 0, path: "/" })
    return response
  } catch {
    return NextResponse.redirect(new URL("/portal/payments?error=connect_failed", request.url))
  }
}
