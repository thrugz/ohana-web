import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, test, vi } from "vitest"
import { WejCard } from "./WejCard"

const card = { poiId: "p1", name: "Café da Garagem", shortDescription: "A quiet terrace above Alfama.", photoUrl: null, mood: "serene", theme: "food", source: "Sergio", city: "Lisbon" }

test("source attribution is always visible", () => {
  render(<WejCard card={card} saved={false} onToggleSave={vi.fn()} />)
  expect(screen.getByText(/via Sergio/i)).toBeInTheDocument()
})
test("tapping the card expands it to show the description", async () => {
  render(<WejCard card={card} saved={false} onToggleSave={vi.fn()} />)
  await userEvent.click(screen.getByText("Café da Garagem"))
  expect(screen.getByText(/quiet terrace above Alfama/i)).toBeInTheDocument()
})
test("the save control fires onToggleSave", async () => {
  const onToggleSave = vi.fn()
  render(<WejCard card={card} saved={false} onToggleSave={onToggleSave} />)
  await userEvent.click(screen.getByRole("button", { name: /save/i }))
  expect(onToggleSave).toHaveBeenCalledWith("p1", true)
})
