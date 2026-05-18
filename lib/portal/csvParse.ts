export const CSV_TEMPLATE =
  "name,address,city,country,latitude,longitude,notes,website\n" +
  "Café Central,Rua do Ouro 12,Lisbon,Portugal,,,Great espresso,\n" +
  "Viewpoint Sintra,,Sintra,Portugal,38.7975,-9.3909,,\n"

export type CsvRow = {
  name: string
  address: string
  city: string
  country: string
  latitude: string
  longitude: string
  notes: string
  website: string
}

export type ValidationError = {
  row: number
  field: string
  message: string
}

export type ParsedPlace = {
  name: string
  address: string | null
  city: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  notes: string | null
  website: string | null
}

function splitCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim())
      current = ""
    } else {
      current += ch
    }
  }
  fields.push(current.trim())
  return fields
}

export function parseCsvText(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/)
  if (lines.length < 2) return []
  const headers = splitCsvLine(lines[0]).map(h => h.toLowerCase().trim())
  const rows: CsvRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const values = splitCsvLine(line)
    const obj: Record<string, string> = {}
    headers.forEach((h, idx) => { obj[h] = values[idx] ?? "" })
    rows.push({
      name: obj["name"] ?? "",
      address: obj["address"] ?? "",
      city: obj["city"] ?? "",
      country: obj["country"] ?? "",
      latitude: obj["latitude"] ?? "",
      longitude: obj["longitude"] ?? "",
      notes: obj["notes"] ?? "",
      website: obj["website"] ?? "",
    })
  }
  return rows
}

export function validateRow(row: CsvRow, rowNumber: number): ValidationError[] {
  const errors: ValidationError[] = []
  if (!row.name) {
    errors.push({ row: rowNumber, field: "name", message: "name is required" })
  }
  const hasAddress = !!row.address
  const hasLat = !!row.latitude
  const hasLng = !!row.longitude
  if (!hasAddress && !hasLat && !hasLng) {
    errors.push({ row: rowNumber, field: "address", message: "address or latitude+longitude is required" })
  }
  if (hasLat && !hasLng) {
    errors.push({ row: rowNumber, field: "longitude", message: "longitude is required when latitude is provided" })
  }
  if (!hasLat && hasLng) {
    errors.push({ row: rowNumber, field: "latitude", message: "latitude is required when longitude is provided" })
  }
  if (hasLat && isNaN(parseFloat(row.latitude))) {
    errors.push({ row: rowNumber, field: "latitude", message: "latitude must be a number" })
  }
  if (hasLng && isNaN(parseFloat(row.longitude))) {
    errors.push({ row: rowNumber, field: "longitude", message: "longitude must be a number" })
  }
  return errors
}

export function buildSourceId(creatorSlug: string, name: string, addressOrCoords: string): string {
  const input = `${creatorSlug}:${name}:${addressOrCoords}`
  return Buffer.from(input).toString("base64url").slice(0, 48)
}

export function toPlace(row: CsvRow): ParsedPlace {
  return {
    name: row.name,
    address: row.address || null,
    city: row.city || null,
    country: row.country || null,
    latitude: row.latitude ? parseFloat(row.latitude) : null,
    longitude: row.longitude ? parseFloat(row.longitude) : null,
    notes: row.notes || null,
    website: row.website || null,
  }
}
