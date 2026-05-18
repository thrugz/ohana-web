// Returns the creator id for the currently signed-in portal user, or null.
//
// Resolves the live Better-Auth traveller session to a creator row via
// creator.user_id (ohana-infra migration 059). A signed-in traveller who is
// not a creator resolves to null.
//
// PORTAL_DEV_CREATOR_ID remains as a development-only fallback: when no
// traveller session is present it lets the portal UI be exercised against a
// real creator row. It must never be set in a deployed environment.
import { getTwinSession } from "@/lib/auth/session"
import { getPool, isUuid } from "@/lib/moment/db"

export async function getPortalSession(): Promise<{ creatorId: string } | null> {
  const session = await getTwinSession()
  const userId = session?.user?.id

  if (isUuid(userId)) {
    const { rows } = await getPool().query<{ id: string }>(
      "SELECT id FROM creator WHERE user_id = $1 LIMIT 1",
      [userId],
    )
    return rows[0] ? { creatorId: rows[0].id } : null
  }

  const devId = process.env.PORTAL_DEV_CREATOR_ID
  if (devId) return { creatorId: devId }
  return null
}
