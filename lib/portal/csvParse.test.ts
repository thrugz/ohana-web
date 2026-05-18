import { describe, it, expect } from "vitest"
import { parseCsvText, validateRow, buildSourceId, CSV_TEMPLATE } from "./csvParse"

describe("parseCsvText", () => {
  it("parses header + one data row", () => {
    const csv = "name,address,city,country,latitude,longitude,notes,website\nCafé Central,Rua do Ouro 12,,Portugal,,,Good coffee,"
    const rows = parseCsvText(csv)
    expect(rows).toHaveLength(1)
    expect(rows[0].name).toBe("Café Central")
    expect(rows[0].address).toBe("Rua do Ouro 12")
    expect(rows[0].country).toBe("Portugal")
  })

  it("trims whitespace from values", () => {
    const csv = "name,address,city,country,latitude,longitude,notes,website\n  Spot  ,  Rua 1  ,,,,,,"
    const rows = parseCsvText(csv)
    expect(rows[0].name).toBe("Spot")
    expect(rows[0].address).toBe("Rua 1")
  })

  it("handles quoted fields with commas", () => {
    const csv = `name,address,city,country,latitude,longitude,notes,website\n"Café, Lisboa","Rua do Ouro, 12",Lisbon,Portugal,,,,`
    const rows = parseCsvText(csv)
    expect(rows[0].name).toBe("Café, Lisboa")
    expect(rows[0].address).toBe("Rua do Ouro, 12")
  })

  it("skips blank lines", () => {
    const csv = "name,address,city,country,latitude,longitude,notes,website\nSpot,Rua 1,,,,,,\n\n"
    expect(parseCsvText(csv)).toHaveLength(1)
  })

  it("returns empty array for header-only CSV", () => {
    const csv = "name,address,city,country,latitude,longitude,notes,website"
    expect(parseCsvText(csv)).toHaveLength(0)
  })
})

describe("validateRow", () => {
  const base = { name: "Spot", address: "Rua 1", city: "", country: "Portugal", latitude: "", longitude: "", notes: "", website: "" }

  it("passes when name + address provided", () => {
    expect(validateRow(base, 1)).toHaveLength(0)
  })

  it("passes when name + lat + lng provided", () => {
    expect(validateRow({ ...base, address: "", latitude: "38.72", longitude: "-9.14" }, 1)).toHaveLength(0)
  })

  it("errors when name is missing", () => {
    const errs = validateRow({ ...base, name: "" }, 1)
    expect(errs).toContainEqual({ row: 1, field: "name", message: "name is required" })
  })

  it("errors when neither address nor coordinates provided", () => {
    const errs = validateRow({ ...base, address: "" }, 1)
    expect(errs).toContainEqual({ row: 1, field: "address", message: "address or latitude+longitude is required" })
  })

  it("errors when only latitude provided without longitude", () => {
    const errs = validateRow({ ...base, address: "", latitude: "38.72", longitude: "" }, 1)
    expect(errs.some(e => e.field === "longitude")).toBe(true)
  })

  it("errors on non-numeric latitude", () => {
    const errs = validateRow({ ...base, latitude: "not-a-number", longitude: "-9.14" }, 1)
    expect(errs.some(e => e.field === "latitude")).toBe(true)
  })
})

describe("buildSourceId", () => {
  it("returns a deterministic non-empty string", () => {
    const a = buildSourceId("ada", "Café Central", "Rua do Ouro 12")
    const b = buildSourceId("ada", "Café Central", "Rua do Ouro 12")
    expect(a).toBe(b)
    expect(a.length).toBeGreaterThan(0)
  })

  it("differs for different creators", () => {
    expect(buildSourceId("ada", "Spot", "Rua 1")).not.toBe(buildSourceId("bob", "Spot", "Rua 1"))
  })
})

describe("CSV_TEMPLATE", () => {
  it("is a non-empty string with the expected header", () => {
    expect(CSV_TEMPLATE).toContain("name,address")
  })
})
