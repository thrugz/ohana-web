import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, test, vi } from "vitest"
import { Stage1World } from "./Stage1World"

vi.mock("../GlobePicker", () => ({
  GlobePicker: ({ onChange }: { onChange: (c: string[]) => void }) => (
    <button onClick={() => onChange(["PT"])}>pick-pt</button>
  ),
}))

test("advance is disabled until a country is picked", async () => {
  const commit = vi.fn(); const advance = vi.fn()
  render(<Stage1World signal={{ visitedCountries: [], moods: [], freeText: {}, resonatedClusters: [], manaSummary: null }} commit={commit} advanceStage={advance} />)
  expect(screen.getByRole("button", { name: /continue/i })).toBeDisabled()
  await userEvent.click(screen.getByText("pick-pt"))
  expect(commit).toHaveBeenCalledWith({ visitedCountries: ["PT"] })
})
