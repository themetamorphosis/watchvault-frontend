import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the auth module
vi.mock("@/lib/auth", () => ({
  API_BASE: "http://127.0.0.1:8000/api/v1",
  signOut: vi.fn(),
}));

import { fetchApi } from "@/lib/apiClient";
import { signOut } from "@/lib/auth";

const mockSignOut = vi.mocked(signOut);

describe("fetchApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("constructs URL from relative endpoint", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 200 }));

    await fetchApi("/auth/me");

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/api/v1/auth/me",
      expect.objectContaining({
        credentials: "include",
      }),
    );
  });

  it("uses absolute URL as-is", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 200 }));

    await fetchApi("https://example.com/api");

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://example.com/api",
      expect.any(Object),
    );
  });

  it("sets Content-Type for POST with JSON body", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 200 }));

    await fetchApi("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name: "test" }),
    });

    const callHeaders = fetchSpy.mock.calls[0][1]?.headers as Headers;
    expect(callHeaders.get("Content-Type")).toBe("application/json");
  });

  it("does not set Content-Type for FormData", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 200 }));
    const fd = new FormData();
    fd.append("file", new Blob());

    await fetchApi("/upload", { method: "POST", body: fd });

    const callHeaders = fetchSpy.mock.calls[0][1]?.headers as Headers;
    expect(callHeaders.get("Content-Type")).toBeNull();
  });

  it("calls signOut on 401 for protected routes", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 401 }));

    await fetchApi("/watchlist");

    expect(mockSignOut).toHaveBeenCalled();
  });

  it("does not call signOut on 401 for login route", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 401 }));

    await fetchApi("/auth/login", { method: "POST" });

    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it("includes credentials", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 200 }));

    await fetchApi("/auth/me");

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ credentials: "include" }),
    );
  });
});
