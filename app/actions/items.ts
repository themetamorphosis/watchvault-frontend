"use server";

import { authedFetch } from "@/lib/serverFetch";
import type { MediaType, Status } from "@/lib/types";
import { safeParseWatchlistItems } from "@/lib/validators";

type ItemInput = {
  id?: string;
  title: string;
  mediaType: MediaType;
  status: Status;
  favorite: boolean;
  genres?: string[];
  notes?: string;
  description?: string;
  year?: number;
  endYear?: number;
  running?: boolean;
  coverUrl?: string;
  runtime?: number;
};

export async function getUserId(): Promise<string> {
  const res = await authedFetch(`/auth/me`, { cache: "no-store" });
  if (!res.ok) throw new Error("Unauthorized");
  const user = await res.json();
  return user.id;
}

export async function getItems() {
  const res = await authedFetch(`/watchlist`, { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  const raw = Array.isArray(json) ? json : (json.items ?? []);

  const parsed = safeParseWatchlistItems(raw);
  if (!parsed.success) {
    console.error("Watchlist items validation failed:", parsed.error);
    return [];
  }

  return parsed.data.map((item) => ({
    ...item,
    notes: item.notes ?? undefined,
    description: item.description ?? undefined,
    coverUrl: item.coverUrl ?? undefined,
    genres: item.genres ?? undefined,
    year: item.year ?? undefined,
    endYear: item.endYear ?? undefined,
    running: item.running ?? undefined,
    runtime: item.runtime ?? undefined,
    createdAt: item.createdAt ? new Date(item.createdAt).getTime() : Date.now(),
    updatedAt: item.updatedAt ? new Date(item.updatedAt).getTime() : Date.now(),
  }));
}

export async function upsertItem(data: ItemInput) {
  let res;
  if (data.id) {
    res = await authedFetch(`/watchlist/${data.id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  } else {
    res = await authedFetch(`/watchlist`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  if (res.ok) return { success: true };
  return { error: "Failed to save item" };
}

export async function deleteItem(id: string) {
  const res = await authedFetch(`/watchlist/${id}`, { method: "DELETE" });
  if (res.ok) return { success: true };
  return { error: "Failed to delete item" };
}

export async function toggleFavorite(id: string) {
  const res = await authedFetch(`/watchlist/${id}/toggle-favorite`, {
    method: "PATCH",
  });
  if (res.ok) {
    const data = await res.json();
    return { success: true, favorite: data.favorite };
  }
  return { error: "Failed to toggle favorite" };
}

export async function updateMetadata(
  id: string,
  payload: {
    coverUrl?: string;
    genres?: string[];
    description?: string;
    runtime?: number;
  },
) {
  const res = await authedFetch(`/watchlist/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  if (res.ok) return { success: true };
  return { error: "Failed to update metadata" };
}

export async function importItems(items: ItemInput[]) {
  // Use batch endpoint for bulk imports (single HTTP request instead of N sequential ones)
  const res = await authedFetch(`/watchlist/batch`, {
    method: "POST",
    body: JSON.stringify(items),
  });
  if (res.ok) {
    const data = await res.json();
    return { success: true, imported: data.imported ?? 0 };
  }
  // Fallback: if batch endpoint not available, try sequential (for old backends)
  let imported = 0;
  for (const item of items) {
    try {
      const r = await authedFetch(`/watchlist`, {
        method: "POST",
        body: JSON.stringify(item),
      });
      if (r.ok) imported++;
    } catch {
      // skip
    }
  }
  return { success: true, imported };
}
