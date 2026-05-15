"use client"

import { useEffect, useRef, useState } from "react"
import "maplibre-gl/dist/maplibre-gl.css"
import { COUNTRIES } from "@/lib/moment/countries"

interface GlobePickerProps {
  selected: string[]
  onChange: (codes: string[]) => void
}

// Minimal shape of the bits of the MapLibre map we use — keeps this file
// free of a hard type dependency on the dynamically imported module.
interface MapLike {
  remove: () => void
  setFilter: (layerId: string, filter: unknown) => void
  getLayer: (layerId: string) => unknown
  on: (...args: unknown[]) => void
  setProjection: (p: { type: string }) => void
  addSource: (id: string, source: unknown) => void
  addLayer: (layer: unknown) => void
}

// GeoJSON world borders with ISO-3166-1 codes in feature properties.
const COUNTRIES_GEOJSON =
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson"

// TODO(@bram): geo-countries property keys vary by dataset revision; verify
// the live ISO alpha-2 key against the deployed dataset.
const ISO_PROP = "ISO3166-1-Alpha-2"
const ISO_KEYS = [ISO_PROP, "ISO_A2", "iso_a2"]

function readIso(props: Record<string, unknown> | null | undefined): string | null {
  if (!props) return null
  for (const key of ISO_KEYS) {
    const value = props[key]
    if (typeof value === "string" && value.length === 2) return value.toUpperCase()
  }
  return null
}

function selectedFilter(codes: string[]): unknown {
  return ["in", ["get", ISO_PROP], ["literal", codes]]
}

// A MapLibre GL globe for picking visited countries. Falls back to a
// searchable country list if MapLibre (WebGL) fails to load — per spec §7.
export function GlobePicker({ selected, onChange }: GlobePickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLike | null>(null)
  const [mode, setMode] = useState<"loading" | "globe" | "fallback">("loading")

  // Keep the latest props reachable from inside long-lived map handlers.
  const selectedRef = useRef(selected)
  const onChangeRef = useRef(onChange)
  selectedRef.current = selected
  onChangeRef.current = onChange

  // Build the map once on mount.
  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const maplibregl = (await import("maplibre-gl")).default
        if (cancelled || !containerRef.current) return

        const map = new maplibregl.Map({
          container: containerRef.current,
          style: "https://demotiles.maplibre.org/style.json",
          center: [10, 25],
          zoom: 1.4,
          attributionControl: false,
        }) as unknown as MapLike
        mapRef.current = map

        map.on("style.load", () => {
          map.setProjection({ type: "globe" })
          map.addSource("countries", { type: "geojson", data: COUNTRIES_GEOJSON })
          map.addLayer({
            id: "country-hit",
            type: "fill",
            source: "countries",
            paint: { "fill-color": "#000000", "fill-opacity": 0 },
          })
          map.addLayer({
            id: "country-selected",
            type: "fill",
            source: "countries",
            paint: {
              "fill-color": "oklch(0.62 0.14 45)", // --color-clay
              "fill-opacity": 0.55,
            },
            filter: selectedFilter(selectedRef.current),
          })
        })

        map.on(
          "click",
          "country-hit",
          (e: { features?: { properties?: Record<string, unknown> }[] }) => {
            const iso = readIso(e.features?.[0]?.properties)
            if (!iso) return
            const current = selectedRef.current
            const next = current.includes(iso)
              ? current.filter((c) => c !== iso)
              : [...current, iso]
            onChangeRef.current(next)
          },
        )

        setMode("globe")
      } catch {
        if (!cancelled) setMode("fallback")
      }
    }

    init()
    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  // Reflect selection changes in the globe's highlight layer.
  useEffect(() => {
    const map = mapRef.current
    if (mode !== "globe" || !map) return
    try {
      if (map.getLayer("country-selected")) {
        map.setFilter("country-selected", selectedFilter(selected))
      }
    } catch {
      // Layer not ready yet; the style.load handler seeds the initial filter.
    }
  }, [mode, selected])

  if (mode === "fallback") {
    return <CountryFallback selected={selected} onChange={onChange} />
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" data-testid="globe-canvas" />
      {mode === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center text-muted">
          Spinning up the globe…
        </div>
      )}
    </div>
  )
}

// Searchable country list shown when the globe can't render.
function CountryFallback({ selected, onChange }: GlobePickerProps) {
  const [query, setQuery] = useState("")
  const q = query.trim().toLowerCase()
  const matches = q
    ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q)
    : COUNTRIES

  function toggle(code: string) {
    onChange(selected.includes(code) ? selected.filter((c) => c !== code) : [...selected, code])
  }

  return (
    <div className="flex h-full w-full flex-col gap-3 p-4" data-testid="country-fallback">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search countries…"
        className="rounded-lg border border-line bg-surface px-3 py-2 text-ink"
        aria-label="Search countries"
      />
      <ul className="flex flex-wrap gap-2 overflow-y-auto">
        {matches.map((c) => {
          const isOn = selected.includes(c.code)
          return (
            <li key={c.code}>
              <button
                type="button"
                onClick={() => toggle(c.code)}
                aria-pressed={isOn}
                className={[
                  "rounded-full border px-3 py-1 text-sm transition-colors",
                  isOn
                    ? "border-clay bg-clay text-primary-foreground"
                    : "border-line bg-surface text-ink hover:border-clay",
                ].join(" ")}
              >
                {c.name}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
