import { describe, it, expect, vi, beforeEach } from "vitest"

const mockQuery = vi.fn()
vi.mock("@/lib/moment/db", () => ({
  getPool: () => ({ query: mockQuery }),
}))

const CREATOR_ID = "11111111-1111-1111-1111-111111111111"

describe("getEarningsSummary", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns zeroes when creator has no earnings", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] })  // earnings by status
      .mockResolvedValueOnce({ rows: [{ total: "0" }] })  // pending payout
    const { getEarningsSummary } = await import("./payments")
    const result = await getEarningsSummary(CREATOR_ID)
    expect(result).toEqual({ accrued: "0", available: "0", paid: "0", pendingPayout: "0", currency: "EUR" })
  })

  it("maps earnings rows by status", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [
          { status: "accrued", total: "120.50", currency: "EUR" },
          { status: "paid", total: "500.00", currency: "EUR" },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ total: "75.00" }] })
    const { getEarningsSummary } = await import("./payments")
    const result = await getEarningsSummary(CREATOR_ID)
    expect(result.accrued).toBe("120.50")
    expect(result.paid).toBe("500.00")
    expect(result.available).toBe("0")
    expect(result.pendingPayout).toBe("75.00")
    expect(result.currency).toBe("EUR")
  })
})

describe("getRecentEarnings", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns rows from creator_earning", async () => {
    const row = {
      id: "abc",
      source_type: "booking_commission",
      gross_basis_amount: "200.00",
      creator_share_amount: "160.00",
      currency: "EUR",
      status: "accrued",
      accrued_at: new Date("2026-05-01"),
    }
    mockQuery.mockResolvedValueOnce({ rows: [row] })
    const { getRecentEarnings } = await import("./payments")
    const result = await getRecentEarnings(CREATOR_ID)
    expect(result).toHaveLength(1)
    expect(result[0].source_type).toBe("booking_commission")
  })

  it("passes limit to query", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    const { getRecentEarnings } = await import("./payments")
    await getRecentEarnings(CREATOR_ID, 5)
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [CREATOR_ID, 5])
  })
})

describe("getPayoutHistory", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns rows from payout table", async () => {
    const row = {
      id: "payout-1",
      total_amount: "300.00",
      currency: "EUR",
      status: "paid",
      period_start: new Date("2026-04-01"),
      period_end: new Date("2026-04-30"),
      mollie_reference: "tr_abc",
      initiated_at: new Date("2026-05-01"),
      paid_at: new Date("2026-05-03"),
    }
    mockQuery.mockResolvedValueOnce({ rows: [row] })
    const { getPayoutHistory } = await import("./payments")
    const result = await getPayoutHistory(CREATOR_ID)
    expect(result[0].mollie_reference).toBe("tr_abc")
  })
})

describe("getSourcedBookings", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns rows from booking table", async () => {
    const row = { id: "b-1", gross_amount: "500.00", status: "confirmed", booked_at: new Date("2026-05-10") }
    mockQuery.mockResolvedValueOnce({ rows: [row] })
    const { getSourcedBookings } = await import("./payments")
    const result = await getSourcedBookings(CREATOR_ID)
    expect(result[0].gross_amount).toBe("500.00")
  })
})
