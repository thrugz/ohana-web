import { type NextRequest, NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "node:crypto"
import { getPool } from "@/lib/moment/db"

// POST /api/portal/mollie/webhook
//
// Receives Mollie Connect webhook events. Mollie webhooks are thin: the body
// is application/x-www-form-urlencoded with a single `id` field identifying
// the mutated resource. The resource type is inferred from the id prefix.
//
// For KYC / onboarding completion: Mollie sends `id=org_xxx` when a connected
// organisation's KYC status changes. We match on creator.mollie_org_id and
// flip payout_enabled=true + kyc_status='verified' when the event arrives.
//
// Idempotency: every event is deduped via mollie_webhook_event
// (migration 049, dedupe key fixed in migration 064).
//
// Signature: if MOLLIE_WEBHOOK_SECRET is set, the x-mollie-signature header
// is verified (HMAC-SHA256 over the raw request body). If the env var is
// absent the check is skipped — development fallback only.

async function verifySignature(rawBody: string, signatureHeader: string | null): Promise<boolean> {
  const secret = process.env.MOLLIE_WEBHOOK_SECRET
  if (!secret) {
    // No secret configured: allow the request (development fallback).
    return true
  }
  if (!signatureHeader) {
    return false
  }
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex")
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signatureHeader, "hex"))
  } catch {
    // timingSafeEqual throws if buffers differ in length — treat as mismatch.
    return false
  }
}

export async function POST(request: NextRequest) {
  // Read raw body once — signature must be computed over the original bytes.
  const rawBody = await request.text()

  const signatureHeader = request.headers.get("x-mollie-signature")
  const signatureValid = await verifySignature(rawBody, signatureHeader)
  if (!signatureValid) {
    console.warn("[mollie/webhook] signature verification failed")
    return new NextResponse("Unauthorized", { status: 401 })
  }

  // Mollie encodes the body as application/x-www-form-urlencoded.
  const params = new URLSearchParams(rawBody)
  const eventId = params.get("id")

  if (!eventId) {
    // Malformed payload — return 200 to prevent Mollie retries.
    console.warn("[mollie/webhook] missing id in payload")
    return new NextResponse("OK", { status: 200 })
  }

  // Determine the object type from the id prefix.
  // org_xxx → organisation KYC event
  // pfl_xxx → profile event (not currently actionable)
  // tr_xxx  → payment event (not currently actionable here)
  const objectType = eventId.startsWith("org_")
    ? "organisation"
    : eventId.startsWith("pfl_")
      ? "profile"
      : eventId.startsWith("tr_")
        ? "payment"
        : "unknown"

  const pool = getPool()

  // Idempotency guard: insert event row. If the unique constraint fires the
  // event was already processed — exit early with 200.
  const idempotencyResult = await pool.query<{ id: string }>(
    `INSERT INTO mollie_webhook_event (object_type, object_id)
     VALUES ($1, $2)
     ON CONFLICT (object_type, object_id) DO NOTHING
     RETURNING id`,
    [objectType, eventId],
  )

  if (idempotencyResult.rowCount === 0) {
    // Already processed — acknowledge without re-processing.
    return new NextResponse("OK", { status: 200 })
  }

  const webhookRowId = idempotencyResult.rows[0].id

  try {
    if (objectType === "organisation") {
      await handleOrganisationEvent(pool, eventId)
    }
    // Profile and payment events: log and no-op for now.

    // Mark processed.
    await pool.query(
      `UPDATE mollie_webhook_event
       SET processing_status = 'processed', processed_at = NOW()
       WHERE id = $1`,
      [webhookRowId],
    )
  } catch (err) {
    console.error(`[mollie/webhook] failed to process event ${eventId}:`, err)

    await pool.query(
      `UPDATE mollie_webhook_event
       SET processing_status = 'failed', error = $1
       WHERE id = $2`,
      [String(err), webhookRowId],
    )

    // Return 200 so Mollie does not retry. The event row is persisted for
    // manual inspection. Retrying would hit the idempotency guard above and
    // exit early anyway once the constraint is in place.
    return new NextResponse("OK", { status: 200 })
  }

  return new NextResponse("OK", { status: 200 })
}

async function handleOrganisationEvent(
  pool: ReturnType<typeof getPool>,
  orgId: string,
): Promise<void> {
  // Mollie sends `id=org_xxx` when a connected organisation completes KYC.
  // We match on creator.mollie_org_id and flip payout_enabled + kyc_status.
  // No re-fetch is performed here because access tokens are not stored
  // (the OAuth callback stores mollie_org_id but discards the token).
  // Webhook arrival is treated as the authoritative KYC completion signal.
  const result = await pool.query<{ id: string }>(
    `UPDATE creator
     SET kyc_status = 'verified', payout_enabled = TRUE
     WHERE mollie_org_id = $1
       AND (kyc_status != 'verified' OR payout_enabled = FALSE)
     RETURNING id`,
    [orgId],
  )

  if (result.rowCount === 0) {
    console.info(`[mollie/webhook] org ${orgId}: no matching creator or already verified — no update`)
  } else {
    console.info(`[mollie/webhook] org ${orgId}: payout_enabled=true for creator ${result.rows[0].id}`)
  }
}
