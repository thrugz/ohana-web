import { cache } from "react"
import { redirect } from "next/navigation"
import { getPool, isUuid } from "@/lib/moment/db"
import { getPortalSession } from "./session"

export type CreatorRecord = {
  id: string
  slug: string
  display_name: string
  creator_type: string | null
  status: string
  revenue_share_tier: string | null
  kyc_status: string
  payout_enabled: boolean
}

const ACTIVE_STATUSES = new Set(["onboarding", "live"])

export function isActiveAmbassador(status: string): boolean {
  return ACTIVE_STATUSES.has(status)
}

const CREATOR_TYPE_LABELS: Record<string, string> = {
  country_ambassador: "Country Ambassador",
  city_ambassador: "City Ambassador",
  guide: "Guide",
  photographer: "Photographer",
  local_expert: "Local Expert",
  travel_creator: "Travel Creator",
}

export function humanizeCreatorType(type: string | null): string {
  if (!type) return "Creator"
  return CREATOR_TYPE_LABELS[type] ?? type
}

// Cached per request — layout gate and dashboard page share one DB query.
export const getAmbassadorRecord = cache(async (): Promise<CreatorRecord | null> => {
  const session = await getPortalSession()
  if (!session) return null

  const { creatorId } = session
  if (!isUuid(creatorId)) return null

  const pool = getPool()
  const result = await pool.query<CreatorRecord>(
    `SELECT id, slug, display_name, creator_type, status,
            revenue_share_tier, kyc_status, payout_enabled
     FROM creator
     WHERE id = $1`,
    [creatorId],
  )
  return result.rows[0] ?? null
})

// Use in layout to enforce the gate. Redirects non-ambassadors to /sign-in.
export async function requireAmbassador(): Promise<CreatorRecord> {
  const record = await getAmbassadorRecord()
  if (!record || !isActiveAmbassador(record.status)) {
    redirect("/sign-in")
  }
  return record
}
