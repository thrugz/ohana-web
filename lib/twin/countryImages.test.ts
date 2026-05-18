import { describe, it, expect } from "vitest"
import { countryImage, COUNTRY_PLACEHOLDER } from "./countryImages"

describe("countryImage", () => {
  it("returns a URL for a known country", () => {
    const url = countryImage("japan")
    expect(url).toMatch(/^https:\/\/images\.unsplash\.com/)
    expect(url).not.toBe(COUNTRY_PLACEHOLDER)
  })

  it("is case-insensitive", () => {
    expect(countryImage("Japan")).toBe(countryImage("japan"))
    expect(countryImage("FRANCE")).toBe(countryImage("france"))
  })

  it("returns placeholder for unknown country", () => {
    expect(countryImage("atlantis")).toBe(COUNTRY_PLACEHOLDER)
    expect(countryImage("")).toBe(COUNTRY_PLACEHOLDER)
  })

  it("COUNTRY_PLACEHOLDER is a valid Unsplash URL", () => {
    expect(COUNTRY_PLACEHOLDER).toMatch(/^https:\/\/images\.unsplash\.com/)
  })
})
