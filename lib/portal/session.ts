// Returns the creator id for the currently signed-in portal user, or null.
//
// TODO: once Better-Auth is wired, read the session cookie here and resolve
// the logged-in user → creator id via the user_id link admin/infra will add
// to the creator table. This is the *only* function that needs to change when
// auth lands.
//
// In the meantime, PORTAL_DEV_CREATOR_ID can be set in .env.local to exercise
// the portal UI against a real creator row during development.
export async function getPortalSession(): Promise<{ creatorId: string } | null> {
  const devId = process.env.PORTAL_DEV_CREATOR_ID
  if (devId) return { creatorId: devId }
  return null
}
