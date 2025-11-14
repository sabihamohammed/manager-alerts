import { screen, fireEvent, waitFor } from "@testing-library/react"
import { vi } from "vitest"
import App from "../App"
import { renderWithQuery } from "../test-setup"

vi.mock("../api", () => {
  let fail = true

  return {
    fetchAlerts: vi.fn().mockResolvedValue([
      {
        id: "A1",
        employee: { id: "E2", name: "Jordan Lee" },
        category: "retention",
        severity: "high",
        status: "open",
        created_at: "2025-09-01T09:00:00Z"
      }
    ]),

    // ⬅️ make this ASYNC with a small delay so optimistic UI can render
    dismissAlert: vi.fn().mockImplementation(() => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (fail) {
            reject(new Error("fail"))
          } else {
            resolve({ ok: true } as any)
          }
        }, 10) // tiny delay is enough
      })
    }),

    __setFail(v: boolean) {
      fail = v
    }
  }
})

import { __setFail } from "../api"

test("optimistic dismiss rolls back on API failure", async () => {
  renderWithQuery(<App />)

  // Wait for initial "open"
  await screen.findByText("open")

  const btn = screen.getByText("Dismiss")

  // 1) First click -> optimistic "dismissed"
  fireEvent.click(btn)

  await waitFor(() => {
    expect(screen.getByText("dismissed")).toBeInTheDocument()
  })

  // 2) API fails -> rollback -> "open"
  await screen.findByText("open")

  // 3) Make API succeed
  __setFail(false)
  fireEvent.click(btn)

  await waitFor(() => {
    expect(screen.getByText("dismissed")).toBeInTheDocument()
  })
})
