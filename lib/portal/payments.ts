import { getPool } from "@/lib/moment/db"

export type EarningsSummary = {
  accrued: string
  available: string
  paid: string
  pendingPayout: string
  currency: string
}

export type EarningRow = {
  id: string
  source_type: string
  gross_basis_amount: string
  creator_share_amount: string
  currency: string
  status: string
  accrued_at: Date
}

export type PayoutRow = {
  id: string
  total_amount: string
  currency: string
  status: string
  period_start: Date | null
  period_end: Date | null
  mollie_reference: string | null
  initiated_at: Date
  paid_at: Date | null
}

export type SourcedBookingRow = {
  id: string
  gross_amount: string
  status: string
  booked_at: Date
}

export async function getEarningsSummary(creatorId: string): Promise<EarningsSummary> {
  const pool = getPool()
  const [earningsRes, payoutRes] = await Promise.all([
    pool.query<{ status: string; total: string; currency: string }>(
      `SELECT status, SUM(creator_share_amount)::text AS total, MAX(currency) AS currency
       FROM creator_earning
       WHERE creator_id = $1
       GROUP BY status`,
      [creatorId],
    ),
    pool.query<{ total: string }>(
      `SELECT COALESCE(SUM(total_amount), 0)::text AS total
       FROM payout
       WHERE creator_id = $1 AND status = 'pending'`,
      [creatorId],
    ),
  ])

  const byStatus: Record<string, string> = {}
  let currency = "EUR"
  for (const row of earningsRes.rows) {
    byStatus[row.status] = row.total
    currency = row.currency
  }

  return {
    accrued: byStatus["accrued"] ?? "0",
    available: byStatus["available"] ?? "0",
    paid: byStatus["paid"] ?? "0",
    pendingPayout: payoutRes.rows[0]?.total ?? "0",
    currency,
  }
}

export async function getRecentEarnings(creatorId: string, limit = 20): Promise<EarningRow[]> {
  const pool = getPool()
  const result = await pool.query<EarningRow>(
    `SELECT id, source_type, gross_basis_amount::text, creator_share_amount::text,
            currency, status, accrued_at
     FROM creator_earning
     WHERE creator_id = $1
     ORDER BY accrued_at DESC
     LIMIT $2`,
    [creatorId, limit],
  )
  return result.rows
}

export async function getPayoutHistory(creatorId: string, limit = 10): Promise<PayoutRow[]> {
  const pool = getPool()
  const result = await pool.query<PayoutRow>(
    `SELECT id, total_amount::text, currency, status, period_start, period_end,
            mollie_reference, initiated_at, paid_at
     FROM payout
     WHERE creator_id = $1
     ORDER BY initiated_at DESC
     LIMIT $2`,
    [creatorId, limit],
  )
  return result.rows
}

export async function getSourcedBookings(creatorId: string, limit = 10): Promise<SourcedBookingRow[]> {
  const pool = getPool()
  const result = await pool.query<SourcedBookingRow>(
    `SELECT id, gross_amount::text, status, booked_at
     FROM booking
     WHERE sourcing_creator_id = $1
     ORDER BY booked_at DESC
     LIMIT $2`,
    [creatorId, limit],
  )
  return result.rows
}
