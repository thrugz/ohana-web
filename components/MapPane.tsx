"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const PINS = [
  { label: "Alfama",        lat: 38.7139, lng: -9.1294 },
  { label: "Príncipe Real", lat: 38.7165, lng: -9.1501 },
  { label: "LX Factory",   lat: 38.7017, lng: -9.1764 },
]

// Pill marker matching the brand
function pillIcon(label: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      display:flex;align-items:center;gap:5px;
      background:white;border:1px solid oklch(0.92 0.01 80);
      border-radius:9999px;padding:5px 10px;
      font-size:12px;font-family:inherit;color:oklch(0.22 0.02 60);
      box-shadow:0 2px 8px rgba(0,0,0,.10);white-space:nowrap;
    ">
      <span style="width:8px;height:8px;border-radius:50%;background:oklch(0.62 0.14 45);flex-shrink:0"></span>
      ${label}
    </div>`,
    iconAnchor: [0, 0],
  })
}

export function MapPane() {
  // Fix leaflet's default icon paths broken by bundlers
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    })
  }, [])

  return (
    <MapContainer
      center={[38.711, -9.152]}
      zoom={13}
      zoomControl={false}
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={false}
      style={{ width: "100%", height: "100%" }}
      className="leaflet-map-pane"
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={19}
      />
      {PINS.map((pin) => (
        <Marker key={pin.label} position={[pin.lat, pin.lng]} icon={pillIcon(pin.label)}>
          <Popup>{pin.label}</Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
