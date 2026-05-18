import { expect, test } from "vitest"
import { buildWejQuery, buildWejQueryBiased, firstPhotoUrl, isThinWej, rowToCard } from "./route"

test("buildWejQuery filters poi_final by mood AND theme, caps 14, ranks by confidence", () => {
  const { text, values } = buildWejQuery("serene", "food")
  expect(text).toMatch(/moods @> /i)
  expect(text).toMatch(/themes @> /i)
  expect(text).toMatch(/order by confidence_score desc/i)
  expect(text).toMatch(/limit 14/i)
  expect(values).toEqual([["serene"], ["food"]])
})

test("firstPhotoUrl returns a bare URL string", () => {
  expect(firstPhotoUrl(["https://example.com/a.jpg"])).toBe("https://example.com/a.jpg")
})

test("firstPhotoUrl reads url / src / href object keys", () => {
  expect(firstPhotoUrl([{ url: "https://example.com/u.jpg" }])).toBe("https://example.com/u.jpg")
  expect(firstPhotoUrl([{ src: "https://example.com/s.jpg" }])).toBe("https://example.com/s.jpg")
  expect(firstPhotoUrl([{ href: "https://example.com/h.jpg" }])).toBe("https://example.com/h.jpg")
})

test("firstPhotoUrl falls back to null for empty, non-array, or unrecognised shapes", () => {
  expect(firstPhotoUrl([])).toBeNull()
  expect(firstPhotoUrl(null)).toBeNull()
  expect(firstPhotoUrl("not-an-array")).toBeNull()
  expect(firstPhotoUrl([{ caption: "no url here" }])).toBeNull()
  expect(firstPhotoUrl([42])).toBeNull()
})

test("isThinWej is true below 6 cards, false at or above", () => {
  expect(isThinWej(0)).toBe(true)
  expect(isThinWej(5)).toBe(true)
  expect(isThinWej(6)).toBe(false)
  expect(isThinWej(14)).toBe(false)
})

test("rowToCard maps poi_final columns to WejCard and echoes the queried mood/theme", () => {
  const card = rowToCard(
    {
      id: "poi-1",
      name: "Test Cafe",
      short_description: "A quiet corner",
      photos: [{ url: "https://example.com/p.jpg" }],
      source_id: "creator",
      city_name: "Lisbon",
    },
    "serene",
    "food",
  )
  expect(card).toEqual({
    poiId: "poi-1",
    name: "Test Cafe",
    shortDescription: "A quiet corner",
    photoUrl: "https://example.com/p.jpg",
    mood: "serene",
    theme: "food",
    source: "creator",
    city: "Lisbon",
  })
})

test("rowToCard defaults null short_description, source_id, city_name", () => {
  const card = rowToCard(
    {
      id: "poi-2",
      name: "Unnamed Spot",
      short_description: null,
      photos: [],
      source_id: null,
      city_name: null,
    },
    "wild",
    "nature",
  )
  expect(card.shortDescription).toBe("")
  expect(card.source).toBe("unknown")
  expect(card.city).toBeNull()
  expect(card.photoUrl).toBeNull()
})

test("buildWejQueryBiased adds OR branch for preferred moods", () => {
  const { text, values } = buildWejQueryBiased("serene", "food", ["calm", "adventurous"])
  expect(text).toMatch(/moods @> \$1 OR moods && \$3/i)
  expect(values[2]).toEqual(["calm", "adventurous"])
})

test("buildWejQueryBiased with empty preferred moods behaves like basic query", () => {
  const { text, values } = buildWejQueryBiased("serene", "food", [])
  expect(text).not.toMatch(/OR moods/)
  expect(values).toHaveLength(2)
})
