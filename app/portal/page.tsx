import { getAmbassadorRecord, humanizeCreatorType } from "@/lib/portal/ambassador"

const TIER_LABELS: Record<string, string> = {
  "80_20_creator": "80/20",
  "70_30_creator": "70/30",
  "65_35_creator": "65/35",
  "55_45_ohana": "55/45",
}

const STATUS_STYLES: Record<string, string> = {
  live: "bg-sage-soft text-sage",
  onboarding: "bg-clay-soft text-clay",
}

export default async function PortalPage() {
  // layout already enforces the gate; record is guaranteed non-null and active here
  const record = await getAmbassadorRecord()
  if (!record) return null

  const tierLabel = record.revenue_share_tier ? TIER_LABELS[record.revenue_share_tier] : null
  const statusStyle = STATUS_STYLES[record.status] ?? "bg-line text-muted"

  return (
    <div className="space-y-12">
      <header>
        <p className="text-sm uppercase tracking-widest text-muted mb-2">
          {humanizeCreatorType(record.creator_type)}
        </p>
        <h1
          className="font-serif text-4xl text-ink"
          style={{ fontWeight: 400, fontVariationSettings: '"opsz" 144' }}
        >
          Welcome back,<br />{record.display_name}
        </h1>
      </header>

      <section>
        <h2 className="text-xs uppercase tracking-widest text-muted mb-4">Your profile</h2>
        <div className="rounded-lg border border-line bg-surface p-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Status">
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle}`}>
              {record.status}
            </span>
          </Stat>
          <Stat label="Revenue share">{tierLabel ?? "—"}</Stat>
          <Stat label="KYC">{record.kyc_status.replace(/_/g, " ")}</Stat>
          <Stat label="Payouts">{record.payout_enabled ? "Enabled" : "Not yet enabled"}</Stat>
        </div>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-widest text-muted mb-4">Your guides</h2>
        <ComingSoon />
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-widest text-muted mb-4">Earnings</h2>
        <ComingSoon />
      </section>
    </div>
  )
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted mb-1">{label}</dt>
      <dd className="text-sm text-ink">{children}</dd>
    </div>
  )
}

function ComingSoon() {
  return (
    <div className="rounded-lg border border-line bg-surface p-8 text-center">
      <p className="text-sm text-muted">Coming soon</p>
    </div>
  )
}
