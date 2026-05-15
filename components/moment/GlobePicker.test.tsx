import { render } from "@testing-library/react"
import { expect, test, vi } from "vitest"
import { GlobePicker } from "./GlobePicker"

// maplibre-gl touches WebGL; mock it for the unit test.
vi.mock("maplibre-gl", () => ({ default: { Map: vi.fn(() => ({ on: vi.fn(), addLayer: vi.fn(), remove: vi.fn() })) } }))

test("GlobePicker mounts without throwing", () => {
  const onChange = vi.fn()
  expect(() => render(<GlobePicker selected={[]} onChange={onChange} />)).not.toThrow()
})
