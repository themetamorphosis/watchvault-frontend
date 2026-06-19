import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// Mock Server Actions
vi.mock("@/app/actions/items", () => ({
  getItems: vi.fn(),
  upsertItem: vi.fn(),
  deleteItem: vi.fn(),
  toggleFavorite: vi.fn(),
  importItems: vi.fn(),
  updateMetadata: vi.fn(),
}));

vi.mock("@/lib/poster", () => ({
  fetchPoster: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { useLibraryData } from "@/hooks/useLibraryData";
import {
  getItems,
  upsertItem,
  deleteItem,
  toggleFavorite,
  importItems,
} from "@/app/actions/items";
import { toast } from "sonner";

const mockGetItems = vi.mocked(getItems);
const mockUpsertItem = vi.mocked(upsertItem);
const mockDeleteItem = vi.mocked(deleteItem);
const mockToggleFavorite = vi.mocked(toggleFavorite);
const mockImportItems = vi.mocked(importItems);
const mockToast = vi.mocked(toast);

const mockItem = {
  id: "item-1",
  title: "The Matrix",
  mediaType: "movie" as const,
  status: "pending" as const,
  favorite: false,
  genres: ["Sci-Fi"],
  year: 1999,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

describe("useLibraryData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetItems.mockResolvedValue([mockItem]);
    // Mock localStorage
    Storage.prototype.getItem = vi.fn(() => null);
    Storage.prototype.setItem = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads items on mount", async () => {
    const { result } = renderHook(() => useLibraryData("user-1"));

    await waitFor(() => {
      expect(result.current.ready).toBe(true);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].title).toBe("The Matrix");
  });

  it("handleDelete optimistic + success", async () => {
    mockDeleteItem.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useLibraryData("user-1"));

    await waitFor(() => expect(result.current.ready).toBe(true));

    act(() => {
      result.current.handleDelete("item-1");
    });

    expect(result.current.items).toHaveLength(0);
    expect(mockDeleteItem).toHaveBeenCalledWith("item-1");
  });

  it("handleDelete optimistic + failure reverts and shows toast", async () => {
    mockDeleteItem.mockResolvedValue({ error: "Failed to delete item" });
    const { result } = renderHook(() => useLibraryData("user-1"));

    await waitFor(() => expect(result.current.ready).toBe(true));

    act(() => {
      result.current.handleDelete("item-1");
    });

    await waitFor(() => {
      expect(result.current.items).toHaveLength(1);
    });
    expect(mockToast.error).toHaveBeenCalledWith(
      "Delete failed — item restored",
    );
  });

  it("handleUpsert updates existing item", async () => {
    mockUpsertItem.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useLibraryData("user-1"));

    await waitFor(() => expect(result.current.ready).toBe(true));

    act(() => {
      result.current.handleUpsert(
        {
          title: "Updated Title",
          mediaType: "movie",
          status: "watched",
          favorite: true,
        },
        "item-1",
      );
    });

    expect(result.current.items[0].title).toBe("Updated Title");
    expect(result.current.items[0].status).toBe("watched");
  });

  it("handleUpsert update failure reverts and shows toast", async () => {
    mockUpsertItem.mockResolvedValue({ error: "Failed to save item" });
    const { result } = renderHook(() => useLibraryData("user-1"));

    await waitFor(() => expect(result.current.ready).toBe(true));

    act(() => {
      result.current.handleUpsert(
        {
          title: "Bad Update",
          mediaType: "movie",
          status: "watched",
          favorite: false,
        },
        "item-1",
      );
    });

    await waitFor(() => {
      expect(result.current.items[0].title).toBe("The Matrix");
    });
    expect(mockToast.error).toHaveBeenCalledWith(
      "Update failed — changes reverted",
    );
  });

  it("handleToggleFav flips favorite", async () => {
    mockToggleFavorite.mockResolvedValue({ success: true, favorite: true });
    const { result } = renderHook(() => useLibraryData("user-1"));

    await waitFor(() => expect(result.current.ready).toBe(true));

    act(() => {
      result.current.handleToggleFav("item-1");
    });

    expect(result.current.items[0].favorite).toBe(true);
  });

  it("handleToggleFav failure reverts", async () => {
    mockToggleFavorite.mockResolvedValue({
      error: "Failed to toggle favorite",
    });
    const { result } = renderHook(() => useLibraryData("user-1"));

    await waitFor(() => expect(result.current.ready).toBe(true));

    act(() => {
      result.current.handleToggleFav("item-1");
    });

    await waitFor(() => {
      expect(result.current.items[0].favorite).toBe(false);
    });
    expect(mockToast.error).toHaveBeenCalledWith(
      "Favorite toggle failed — reverted",
    );
  });

  it("handleImport adds items and shows success toast", async () => {
    mockImportItems.mockResolvedValue({ success: true, imported: 2 });
    const { result } = renderHook(() => useLibraryData("user-1"));

    await waitFor(() => expect(result.current.ready).toBe(true));

    const newItem = {
      id: "item-2",
      title: "Inception",
      mediaType: "movie" as const,
      status: "pending" as const,
      favorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    act(() => {
      result.current.handleImport([newItem]);
    });

    expect(result.current.items).toHaveLength(2);
    expect(mockImportItems).toHaveBeenCalled();
  });

  it("handleImport failure shows toast and refreshes", async () => {
    mockImportItems.mockResolvedValue({ success: false, imported: 0 });
    const { result } = renderHook(() => useLibraryData("user-1"));

    await waitFor(() => expect(result.current.ready).toBe(true));

    act(() => {
      result.current.handleImport([
        {
          id: "item-2",
          title: "Inception",
          mediaType: "movie",
          status: "pending",
          favorite: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]);
    });

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Import failed — please try again",
      );
    });
  });
});
