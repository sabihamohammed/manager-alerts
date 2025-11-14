import { screen, fireEvent, waitFor } from "@testing-library/react"
import { vi } from "vitest"
import App from "../App"
import { renderWithQuery } from "../test-setup"

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch as any

beforeEach(() => {
  vi.resetAllMocks()

  mockFetch.mockImplementation((url: RequestInfo) => {
    const u = new URL(url.toString())
    const sev = u.searchParams.get("severity")

    const data = [
      {
        id: "A1",
        employee: { id: "E3", name: "Jordan Lee" },
        severity: "high",
        category: "retention",
        created_at: "2025-09-01T09:00:00Z",
        status: "open",
      },
      {
        id: "A2",
        employee: { id: "E4", name: "Casey Kim" },
        severity: "medium",
        category: "engagement",
        created_at: "2025-09-02T09:00:00Z",
        status: "open",
      },
    ]

    const filtered = sev ? data.filter((d) => d.severity === sev) : data
    return Promise.resolve(
      new Response(JSON.stringify(filtered), { status: 200 })
    )
  })
})

test("filters to high severity", async () => {
  // ⬅ FIX: use renderWithQuery
  renderWithQuery(<App />)

  fireEvent.change(screen.getByLabelText("Manager ID"), {
    target: { value: "E2" },
  })

  await screen.findByText("Jordan Lee")

  fireEvent.change(screen.getByLabelText("Severity"), {
    target: { value: "high" },
  })

  await waitFor(() => {
    expect(screen.getByText("high")).toBeInTheDocument()
  })

  // Should NOT show medium alerts
  expect(screen.queryByText("medium", { selector: "td" })).toBeNull()
})
