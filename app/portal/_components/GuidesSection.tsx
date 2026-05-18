"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { GuideRow } from "@/lib/portal/guides"
import { CSV_TEMPLATE } from "@/lib/portal/csvParse"

type ImportResult = {
  inserted: number
  skipped: number
  errors: Array<{ row: number; field: string; message: string }>
}

const STATUS_LABELS: Record<string, string> = {
  staged: "Pending review",
  enriched: "Enriched",
  promoted: "Live",
  rejected: "Rejected",
}

export function GuidesSection({ initialGuides }: { initialGuides: GuideRow[] }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "ohana-places-template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setResult(null)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/portal/guides/import", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Import failed")
        return
      }
      setResult(data as ImportResult)
      startTransition(() => { router.refresh() })
    } catch {
      setError("Network error — please try again")
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={downloadTemplate}
          className="text-sm text-muted underline underline-offset-2 hover:text-ink transition-colors"
        >
          Download CSV template
        </button>
        <label className="cursor-pointer">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={handleFileChange}
            disabled={isPending}
          />
          <span className="inline-flex items-center rounded-full border border-line bg-surface px-4 py-1.5 text-sm text-ink hover:bg-canvas transition-colors">
            {isPending ? "Importing…" : "Import CSV"}
          </span>
        </label>
      </div>

      {error && (
        <div className="rounded-lg border border-line bg-surface px-4 py-3 text-sm text-clay">
          {error}
        </div>
      )}
      {result && (
        <div className="rounded-lg border border-line bg-surface px-4 py-3 space-y-2">
          <p className="text-sm text-ink">
            Imported {result.inserted} place{result.inserted !== 1 ? "s" : ""}.
            {result.skipped > 0 && ` ${result.skipped} row${result.skipped !== 1 ? "s" : ""} skipped.`}
          </p>
          {result.errors.length > 0 && (
            <ul className="text-sm text-clay space-y-1">
              {result.errors.map((e, i) => (
                <li key={i}>Row {e.row}: {e.field} — {e.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {initialGuides.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface p-8 text-center">
          <p className="text-sm text-muted">
            No places imported yet. Download the template, fill it in, and import your CSV above.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-line bg-surface divide-y divide-line">
          {initialGuides.map(g => (
            <div key={g.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm text-ink">{g.poi_name ?? "Unnamed place"}</p>
                <p className="text-xs text-muted mt-0.5">
                  {[g.city_raw, g.country_raw].filter(Boolean).join(", ") || g.address || "No location"}
                </p>
              </div>
              <span className="text-xs text-muted">{STATUS_LABELS[g.ai_status] ?? g.ai_status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
