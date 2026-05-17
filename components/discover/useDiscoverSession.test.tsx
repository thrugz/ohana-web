import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"
import { applySaveToList, useDiscoverSession } from "./useDiscoverSession"

afterEach(() => {
  vi.restoreAllMocks()
})

describe("applySaveToList", () => {
  test("adds a poiId, deduped", () => {
    expect(applySaveToList([], "p1", true)).toEqual(["p1"])
    expect(applySaveToList(["p1"], "p1", true)).toEqual(["p1"])
  })

  test("removes a poiId", () => {
    expect(applySaveToList(["p1", "p2"], "p1", false)).toEqual(["p2"])
    expect(applySaveToList([], "p1", false)).toEqual([])
  })

  test("does not mutate the input array", () => {
    const input = ["p1"]
    applySaveToList(input, "p2", true)
    expect(input).toEqual(["p1"])
  })
})

// A mounted session with no saved POIs.
const SESSION_RESPONSE = {
  sessionId: "11111111-1111-1111-1111-111111111111",
  signal: { moods: ["serene"], resonatedClusters: [] },
  savedPoiIds: [],
}

function mockFetch(handler: (url: string, init?: RequestInit) => unknown) {
  global.fetch = vi.fn(async (url: string, init?: RequestInit) => {
    const body = handler(String(url), init)
    return { ok: true, json: async () => body }
  }) as unknown as typeof fetch
}

describe("useDiscoverSession toggleSave", () => {
  test("optimistically adds a poiId before the server responds", async () => {
    let resolveSave: ((v: unknown) => void) | undefined
    global.fetch = vi.fn((url: string) => {
      if (String(url).includes("/api/moment/session")) {
        return Promise.resolve({ ok: true, json: async () => SESSION_RESPONSE })
      }
      // Save request hangs until we resolve it manually.
      return new Promise((resolve) => {
        resolveSave = resolve
      })
    }) as unknown as typeof fetch

    const { result } = renderHook(() => useDiscoverSession())
    await waitFor(() => expect(result.current.state).not.toBeNull())

    act(() => {
      void result.current.toggleSave("poi-a", true)
    })
    // Optimistic: reflected immediately, before the save resolves.
    expect(result.current.state?.savedPoiIds).toEqual(["poi-a"])

    act(() => {
      resolveSave?.({ ok: true, json: async () => ({ savedPoiIds: ["poi-a"] }) })
    })
  })

  test("optimistically removes a poiId", async () => {
    mockFetch((url) => {
      if (url.includes("/api/moment/session")) {
        return { ...SESSION_RESPONSE, savedPoiIds: ["poi-a", "poi-b"] }
      }
      return { savedPoiIds: ["poi-b"] }
    })

    const { result } = renderHook(() => useDiscoverSession())
    await waitFor(() => expect(result.current.state?.savedPoiIds).toEqual(["poi-a", "poi-b"]))

    await act(async () => {
      await result.current.toggleSave("poi-a", false)
    })
    expect(result.current.state?.savedPoiIds).toEqual(["poi-b"])
  })

  test("reconciles savedPoiIds against the server response", async () => {
    // Server returns a different list than the optimistic guess (e.g. another
    // tab also saved a POI); the hook must adopt the server's truth.
    mockFetch((url) => {
      if (url.includes("/api/moment/session")) return SESSION_RESPONSE
      return { savedPoiIds: ["poi-a", "poi-from-other-tab"] }
    })

    const { result } = renderHook(() => useDiscoverSession())
    await waitFor(() => expect(result.current.state).not.toBeNull())

    await act(async () => {
      await result.current.toggleSave("poi-a", true)
    })
    expect(result.current.state?.savedPoiIds).toEqual(["poi-a", "poi-from-other-tab"])
  })
})

describe("useDiscoverSession mount error", () => {
  test("surfaces error on a non-OK session fetch", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch

    const { result } = renderHook(() => useDiscoverSession())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe(true)
    expect(result.current.state).toBeNull()
  })
})
