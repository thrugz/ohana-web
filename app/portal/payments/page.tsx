import Link from "next/link"
import { getAmbassadorRecord } from "@/lib/portal/ambassador"
import {
  getEarningsSummary,
  getRecentEarnings,
  getPayoutHistory,
  getSourcedBookings,
} from "@/lib/portal/payments"

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; connected?: string }>
}) {
  const params = await searchParams
  const record = await getAmbassadorRecord()
  if (!record) return null

  const notConnected = !record.mollie_org_id

  return (
    <div className="space-y-12">
      <header>
        <h1
          className="font-serif text-4xl text-ink"
          style={{ fontWeight: 400, fontVariationSettings: '"opsz" 144' }}
        >
          Payments
        </h1>
      </header>

      {params.error && (
        <div className="rounded-lg border border-line bg-surface px-6 py-4 text-sm text-clay">
          {params.error === "state_mismatch"
            ? "Connection failed: security check did not pass. Please try again."
            : "Could not connect to Mollie. Please try again."}
        </div>
      )}

      {params.connected === "1" && !notConnected && (
        <div className="rounded-lg border border-line bg-surface px-6 py-4 text-sm text-sage">
          Mollie account connected. Your account is now under review.
        </div>
      )}

      {notConnected && (
        <section className="rounded-lg border border-line bg-surface p-8 text-center space-y-4">
          <p className="text-sm text-muted">Connect your Mollie account to start receiving payouts.</p>
          <Link
            href="/api/portal/mollie/connect"
            className="inline-flex items-center rounded-full bg-ink px-5 py-2.5 text-sm text-canvas hover:opacity-80 transition-opacity"
          >
            Connect with Mollie
          </Link>
        </section>
      )}

      {!notConnected && record.kyc_status !== "verified" && (
        <div className="rounded-lg border border-line bg-surface px-6 py-4 text-sm text-muted">
          Mollie is reviewing your account — payouts will be enabled once verification is complete.
        </div>
      )}

      {!notConnected && <EarningsData creatorId={record.id} />}
    </div>
  )
}

async function EarningsData({ creatorId }: { creatorId: string }) {
  const [summary, earnings, payouts, bookings] = await Promise.all([
    getEarningsSummary(creatorId),
    getRecentEarnings(creatorId),
    getPayoutHistory(creatorId),
    getSourcedBookings(creatorId),
  ])

  const fmt = (amount: string) =>
    new Intl.NumberFormat("en-IE", { style: "currency", currency: summary.currency }).format(
      parseFloat(amount),
    )

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-xs uppercase tracking-widest text-muted mb-4">Summary</h2>
        <div className="rounded-lg border border-line bg-surface p-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Accrued">{fmt(summary.accrued)}</Stat>
          <Stat label="Available">{fmt(summary.available)}</Stat>
          <Stat label="Paid out">{fmt(summary.paid)}</Stat>
          <Stat label="Pending payout">{fmt(summary.pendingPayout)}</Stat>
        </div>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-widest text-muted mb-4">Earnings</h2>
        {earnings.length === 0 ? (
          <Empty>No earnings yet.</Empty>
        ) : (
          <Table
            head={["Date", "Type", "Gross", "Your share", "Status"]}
            rows={earnings.map((e) => [
              new Date(e.accrued_at).toLocaleDateString("en-GB"),
              e.source_type.replace(/_/g, " "),
              fmt(e.gross_basis_amount),
              fmt(e.creator_share_amount),
              <StatusBadge key={e.id} status={e.status} />,
            ])}
          />
        )}
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-widest text-muted mb-4">Payout history</h2>
        {payouts.length === 0 ? (
          <Empty>No payouts yet.</Empty>
        ) : (
          <Table
            head={["Period", "Amount", "Reference", "Status"]}
            rows={payouts.map((p) => [
              p.period_start && p.period_end
                ? `${new Date(p.period_start).toLocaleDateString("en-GB")} – ${new Date(p.period_end).toLocaleDateString("en-GB")}`
                : "—",
              fmt(p.total_amount),
              p.mollie_reference ?? "—",
              <StatusBadge key={p.id} status={p.status} />,
            ])}
          />
        )}
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-widest text-muted mb-4">Bookings sourced</h2>
        {bookings.length === 0 ? (
          <Empty>No sourced bookings yet.</Empty>
        ) : (
          <Table
            head={["Date", "Gross value", "Status"]}
            rows={bookings.map((b) => [
              new Date(b.booked_at).toLocaleDateString("en-GB"),
              fmt(b.gross_amount),
              <StatusBadge key={b.id} status={b.status} />,
            ])}
          />
        )}
      </section>
    </div>
  )
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted mb-1">{label}</dt>
      <dd className="text-sm font-medium text-ink">{children}</dd>
    </div>
  )
}

function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full text-sm">
        <thead className="border-b border-line bg-surface">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-widest text-muted font-normal">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row, i) => (
            <tr key={i} className="bg-canvas hover:bg-surface transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-ink">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const STATUS_COLORS: Record<string, string> = {
  accrued: "bg-clay-soft text-clay",
  available: "bg-sage-soft text-sage",
  paid: "bg-line text-muted",
  pending: "bg-clay-soft text-clay",
  processing: "bg-clay-soft text-clay",
  failed: "bg-clay-soft text-clay",
  confirmed: "bg-sage-soft text-sage",
  cancelled: "bg-line text-muted",
}

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_COLORS[status] ?? "bg-line text-muted"
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${style}`}>
      {status.replace(/_/g, " ")}
    </span>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-8 text-center">
      <p className="text-sm text-muted">{children}</p>
    </div>
  )
}
