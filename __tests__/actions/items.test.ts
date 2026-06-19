import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/serverFetch", () => ({
  authedFetch: vi.fn(),
}));

vi.mock("@/lib/validators", () => ({
  safeParseWatchlistItems: vi.fn(),
}));

import { authedFetch } from "@/lib/serverFetch";
import { safeParseWatchlistItems } from "@/lib/validators";
import {
  getItems,
  deleteItem,
  upsertItem,
  toggleFavorite,
  importItems,
} from "@/app/actions/items";

const mockAuthedFetch = vi.mocked(authedFetch);
const mockSafeParse = vi.mocked(safeParseWatchlistItems);

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Server Actions: items", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getItems", () => {
    it("returns parsed items on success", async () => {
      const rawItems = [
        {
          id: "1",
          title: "Test",
          mediaType: "movie",
          status: "pending",
          favorite: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      mockAuthedFetch.mockResolvedValue(jsonResponse(rawItems));
      mockSafeParse.mockReturnValue({ success: true, data: rawItems });

      const result = await getItems();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Test");
      expect(mockAuthedFetch).toHaveBeenCalledWith("/watchlist", {
        cache: "no-store",
      });
    });

    it("returns [] on fetch failure", async () => {
      mockAuthedFetch.mockResolvedValue(new Response("{}", { status: 500 }));

      const result = await getItems();

      expect(result).toEqual([]);
    });

    it("returns [] on validation failure", async () => {
      mockAuthedFetch.mockResolvedValue(jsonResponse([{ bad: "data" }]));
      mockSafeParse.mockReturnValue({
        success: false,
        error: "validation failed" as any,
      });

      const result = await getItems();

      expect(result).toEqual([]);
    });
  });

  describe("deleteItem", () => {
    it("returns success on ok", async () => {
      mockAuthedFetch.mockResolvedValue(new Response("{}", { status: 200 }));

      const result = await deleteItem("item-1");

      expect(result).toEqual({ success: true });
      expect(mockAuthedFetch).toHaveBeenCalledWith("/watchlist/item-1", {
        method: "DELETE",
      });
    });

    it("returns error on failure", async () => {
      mockAuthedFetch.mockResolvedValue(new Response("{}", { status: 500 }));

      const result = await deleteItem("item-1");

      expect(result).toEqual({ error: "Failed to delete item" });
    });
  });

  describe("upsertItem", () => {
    it("sends POST for new item", async () => {
      mockAuthedFetch.mockResolvedValue(jsonResponse({ id: "new-1" }));

      const result = await upsertItem({
        title: "New",
        mediaType: "movie",
        status: "pending",
        favorite: false,
      });

      expect(result).toEqual({ success: true });
      expect(mockAuthedFetch).toHaveBeenCalledWith(
        "/watchlist",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("sends PATCH for existing item", async () => {
      mockAuthedFetch.mockResolvedValue(jsonResponse({ id: "existing-1" }));

      const result = await upsertItem({
        id: "existing-1",
        title: "Updated",
        mediaType: "movie",
        status: "watched",
        favorite: true,
      });

      expect(result).toEqual({ success: true });
      expect(mockAuthedFetch).toHaveBeenCalledWith(
        "/watchlist/existing-1",
        expect.objectContaining({ method: "PATCH" }),
      );
    });

    it("returns error on failure", async () => {
      mockAuthedFetch.mockResolvedValue(new Response("{}", { status: 400 }));

      const result = await upsertItem({
        title: "Bad",
        mediaType: "movie",
        status: "pending",
        favorite: false,
      });

      expect(result).toEqual({ error: "Failed to save item" });
    });
  });

  describe("toggleFavorite", () => {
    it("returns success and favorite state on ok", async () => {
      mockAuthedFetch.mockResolvedValue(
        jsonResponse({ id: "1", favorite: true }),
      );

      const result = await toggleFavorite("1");

      expect(result).toEqual({ success: true, favorite: true });
      expect(mockAuthedFetch).toHaveBeenCalledWith(
        "/watchlist/1/toggle-favorite",
        { method: "PATCH" },
      );
    });

    it("returns error on failure", async () => {
      mockAuthedFetch.mockResolvedValue(new Response("{}", { status: 500 }));

      const result = await toggleFavorite("1");

      expect(result).toEqual({ error: "Failed to toggle favorite" });
    });
  });

  describe("importItems", () => {
    it("sends batch and returns imported count", async () => {
      mockAuthedFetch.mockResolvedValue(
        jsonResponse({ success: true, imported: 3 }),
      );

      const items = [
        {
          title: "A",
          mediaType: "movie" as const,
          status: "pending" as const,
          favorite: false,
        },
        {
          title: "B",
          mediaType: "movie" as const,
          status: "pending" as const,
          favorite: false,
        },
        {
          title: "C",
          mediaType: "movie" as const,
          status: "pending" as const,
          favorite: false,
        },
      ];

      const result = await importItems(items);

      expect(result).toEqual({ success: true, imported: 3 });
      expect(mockAuthedFetch).toHaveBeenCalledWith(
        "/watchlist/batch",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("falls back to sequential on batch failure", async () => {
      // First call (batch) fails
      mockAuthedFetch.mockResolvedValueOnce(
        new Response("{}", { status: 404 }),
      );
      // Sequential calls succeed
      mockAuthedFetch.mockResolvedValue(new Response("{}", { status: 200 }));

      const items = [
        {
          title: "A",
          mediaType: "movie" as const,
          status: "pending" as const,
          favorite: false,
        },
        {
          title: "B",
          mediaType: "movie" as const,
          status: "pending" as const,
          favorite: false,
        },
      ];

      const result = await importItems(items);

      expect(result).toEqual({ success: true, imported: 2 });
    });
  });
});
