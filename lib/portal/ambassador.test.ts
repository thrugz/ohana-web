import { describe, expect, test } from "vitest"
import { isActiveAmbassador, humanizeCreatorType } from "./ambassador"

describe("isActiveAmbassador", () => {
  test("onboarding and live grant access", () => {
    expect(isActiveAmbassador("onboarding")).toBe(true)
    expect(isActiveAmbassador("live")).toBe(true)
  })

  test("prospect and paused deny access", () => {
    expect(isActiveAmbassador("prospect")).toBe(false)
    expect(isActiveAmbassador("paused")).toBe(false)
  })

  test("unknown status denies access", () => {
    expect(isActiveAmbassador("")).toBe(false)
    expect(isActiveAmbassador("admin")).toBe(false)
  })
})

describe("humanizeCreatorType", () => {
  test("maps known types to readable labels", () => {
    expect(humanizeCreatorType("country_ambassador")).toBe("Country Ambassador")
    expect(humanizeCreatorType("city_ambassador")).toBe("City Ambassador")
    expect(humanizeCreatorType("guide")).toBe("Guide")
    expect(humanizeCreatorType("photographer")).toBe("Photographer")
    expect(humanizeCreatorType("local_expert")).toBe("Local Expert")
    expect(humanizeCreatorType("travel_creator")).toBe("Travel Creator")
  })

  test("returns Creator for null", () => {
    expect(humanizeCreatorType(null)).toBe("Creator")
  })

  test("echoes unknown type as-is", () => {
    expect(humanizeCreatorType("super_host")).toBe("super_host")
  })
})
