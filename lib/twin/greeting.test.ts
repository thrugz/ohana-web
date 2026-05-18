import { describe, it, expect } from "vitest"
import { greeting } from "./greeting"

function date(month: number, day: number, hour: number): Date {
  return new Date(2025, month, day, hour, 0, 0)
}

describe("greeting — time bands (no holiday overlay)", () => {
  it("returns morning greeting at 06:00", () => {
    expect(greeting(date(2, 15, 6))).toBe("Good morning")
  })

  it("returns morning greeting at 11:59", () => {
    expect(greeting(date(2, 15, 11))).toBe("Good morning")
  })

  it("returns afternoon greeting at 12:00", () => {
    expect(greeting(date(2, 15, 12))).toBe("Good afternoon")
  })

  it("returns afternoon greeting at 16:59", () => {
    expect(greeting(date(2, 15, 16))).toBe("Good afternoon")
  })

  it("returns evening greeting at 17:00", () => {
    expect(greeting(date(2, 15, 17))).toBe("Good evening")
  })

  it("returns evening greeting at 20:59", () => {
    expect(greeting(date(2, 15, 20))).toBe("Good evening")
  })

  it("returns evening greeting at 21:00 (night band)", () => {
    expect(greeting(date(2, 15, 21))).toBe("Good evening")
  })

  it("returns evening greeting at 04:00 (late night / pre-dawn)", () => {
    expect(greeting(date(2, 15, 4))).toBe("Good evening")
  })
})

describe("greeting — with name", () => {
  it("appends name to time-based greeting", () => {
    expect(greeting(date(2, 15, 9), "Sam")).toBe("Good morning, Sam")
  })

  it("ignores null name", () => {
    expect(greeting(date(2, 15, 9), null)).toBe("Good morning")
  })

  it("ignores undefined name", () => {
    expect(greeting(date(2, 15, 9), undefined)).toBe("Good morning")
  })
})

describe("greeting — holiday overlays", () => {
  it("returns new-year greeting on 1 January", () => {
    expect(greeting(date(0, 1, 10))).toBe("Happy new beginnings")
  })

  it("returns new-year greeting on 31 December", () => {
    expect(greeting(date(11, 31, 10))).toBe("Happy new beginnings")
  })

  it("returns summer greeting on 15 July", () => {
    expect(greeting(date(6, 15, 10))).toBe("Hope you're having a brilliant summer")
  })

  it("returns halloween greeting on 28 October", () => {
    expect(greeting(date(9, 28, 10))).toBe("Spooky season greetings")
  })

  it("returns winter greeting on 20 December", () => {
    expect(greeting(date(11, 20, 10))).toBe("Warmest wishes this season")
  })

  it("includes name in holiday greeting", () => {
    expect(greeting(date(0, 1, 10), "Maya")).toBe("Happy new beginnings, Maya")
  })

  it("returns time greeting on a plain day (mid-March)", () => {
    expect(greeting(date(2, 15, 14))).toBe("Good afternoon")
  })
})
