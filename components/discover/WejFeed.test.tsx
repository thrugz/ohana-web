import { render, screen } from "@testing-library/react"
import { expect, test, vi } from "vitest"
import { WejFeed } from "./WejFeed"

const wej = { mood: "serene", theme: "food", title: "Slow Food", cards: [
  { poiId: "p1", name: "A", shortDescription: "", photoUrl: null, mood: "serene", theme: "food", source: "Sergio", city: "Lisbon" },
] }

test("WejFeed shows the Hoku intro line and the cards", () => {
  render(<WejFeed wej={wej} savedPoiIds={[]} onToggleSave={vi.fn()} />)
  expect(screen.getByText(/Slow Food/i)).toBeInTheDocument()
  expect(screen.getByText("A")).toBeInTheDocument()
})
