"use client";

import { useState, useEffect, useCallback, useTransition, useRef } from "react";
import { toast } from "sonner";
import type { Item } from "@/lib/types";
import {
  getItems,
  upsertItem,
  deleteItem,
  toggleFavorite,
  importItems as importItemsAction,
  updateMetadata,
} from "@/app/actions/items";
import { fetchPoster } from "@/lib/poster";

export function useLibraryData(userId: string) {
  const [items, setItems] = useState<Item[]>([]);
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [, startTransition] = useTransition();
  const syncingRefs = useRef<Set<string>>(new Set());

  // Mount + load from cache then API
  useEffect(() => {
    const t1 = setTimeout(() => setMounted(true), 0);
    let t2: NodeJS.Timeout | undefined;

    try {
      const cached = localStorage.getItem(`wv-cache-items-${userId}`);
      if (cached) {
        t2 = setTimeout(() => {
          setItems(JSON.parse(cached));
          setReady(true);
        }, 0);
      }
    } catch (e) {
      console.error("Failed to read cache:", e);
    }

    getItems()
      .then((dbItems) => {
        setItems(dbItems);
        setReady(true);
      })
      .catch((e) => {
        console.error("Failed to fetch items:", e);
        setReady((prev) => prev || true);
      });

    return () => {
      clearTimeout(t1);
      if (t2) clearTimeout(t2);
    };
  }, [userId]);

  // Persist to cache
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(`wv-cache-items-${userId}`, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to write cache:", e);
    }
  }, [items, ready, userId]);

  const refreshItems = useCallback(() => {
    getItems()
      .then(setItems)
      .catch((e) => console.error("Refresh failed:", e));
  }, []);

  // Poster enrichment
  const ensureCover = useCallback(async (it: Item): Promise<void> => {
    if (it.coverUrl && it.genres && it.genres.length > 0 && it.description)
      return;

    let fetchResult;
    try {
      fetchResult = await fetchPoster(it.title, it.mediaType, it.year);
    } catch (e) {
      console.error("Poster fetch failed:", e);
      try {
        sessionStorage.setItem(`wv-poster-skip-${it.id}`, "1");
      } catch {}
      return;
    }

    if (!fetchResult) {
      try {
        sessionStorage.setItem(`wv-poster-skip-${it.id}`, "1");
      } catch {}
      return;
    }

    const { coverUrl, genres, description } = fetchResult;
    const hasNewCover = !it.coverUrl && coverUrl;
    const hasNewGenres =
      (!it.genres || it.genres.length === 0) && genres && genres.length > 0;
    const hasNewDesc = !it.description && description;

    if (!hasNewCover && !hasNewGenres && !hasNewDesc) {
      try {
        sessionStorage.setItem(`wv-poster-skip-${it.id}`, "1");
      } catch {}
      return;
    }

    setItems((prev) =>
      prev.map((x) =>
        x.id === it.id
          ? {
              ...x,
              ...(hasNewCover ? { coverUrl } : {}),
              ...(hasNewGenres ? { genres } : {}),
              ...(hasNewDesc ? { description } : {}),
            }
          : x,
      ),
    );

    startTransition(() => {
      updateMetadata(it.id, {
        ...(hasNewCover ? { coverUrl } : {}),
        ...(hasNewGenres ? { genres } : {}),
        ...(hasNewDesc ? { description } : {}),
      });
    });
  }, []);

  // CRUD operations
  const handleUpsert = useCallback(
    (next: Omit<Item, "id" | "createdAt" | "updatedAt">, id?: string) => {
      const now = Date.now();
      if (id) {
        const prev = items;
        setItems((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, ...next, updatedAt: now } : p,
          ),
        );
        startTransition(async () => {
          const result = await upsertItem({ ...next, id });
          if (!result.success) {
            setItems(prev);
            toast.error("Update failed — changes reverted");
          }
        });
      } else {
        const tempId = crypto.randomUUID?.() ?? String(now);
        const prev = items;
        setItems((prev) => [
          { id: tempId, createdAt: now, updatedAt: now, ...next },
          ...prev,
        ]);
        startTransition(async () => {
          const result = await upsertItem(next);
          if (!result.success) {
            setItems(prev);
            toast.error("Create failed — item removed");
          } else {
            refreshItems();
          }
        });
      }
    },
    [items, refreshItems],
  );

  const handleDelete = useCallback(
    (id: string) => {
      const prev = items;
      setItems((prev) => prev.filter((p) => p.id !== id));
      startTransition(async () => {
        const result = await deleteItem(id);
        if (!result.success) {
          setItems(prev);
          toast.error("Delete failed — item restored");
        }
      });
    },
    [items],
  );

  const handleToggleFav = useCallback(
    (id: string) => {
      const prev = items;
      setItems((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, favorite: !p.favorite, updatedAt: Date.now() }
            : p,
        ),
      );
      startTransition(async () => {
        const result = await toggleFavorite(id);
        if (!result.success) {
          setItems(prev);
          toast.error("Favorite toggle failed — reverted");
        }
      });
    },
    [items],
  );

  const handleImport = useCallback(
    (newItems: Item[]) => {
      // Add items to local state immediately for responsive UI
      setItems((prev) => {
        const map = new Map<string, Item>();
        for (const p of prev)
          map.set(
            `${p.mediaType}::${p.title.toLowerCase()}::${p.year ?? ""}`,
            p,
          );
        for (const n of newItems) {
          const k = `${n.mediaType}::${n.title.toLowerCase()}::${n.year ?? ""}`;
          if (!map.has(k)) map.set(k, n);
        }
        return Array.from(map.values());
      });
      startTransition(async () => {
        const result = await importItemsAction(
          newItems.map((n) => ({
            title: n.title,
            mediaType: n.mediaType,
            status: n.status,
            favorite: n.favorite,
            genres: n.genres,
            notes: n.notes,
            year: n.year,
            endYear: n.endYear,
            running: n.running,
            coverUrl: n.coverUrl,
            runtime: n.runtime,
          })),
        );
        if (!result || !("success" in result) || !result.success) {
          toast.error("Import failed — please try again");
          refreshItems();
          return;
        }
        if (
          "imported" in result &&
          (result as { imported: number }).imported > 0
        ) {
          toast.success(
            `Imported ${(result as { imported: number }).imported} items`,
          );
          setTimeout(() => refreshItems(), 1500);
        }
      });
    },
    [refreshItems],
  );

  return {
    items,
    setItems,
    ready,
    mounted,
    refreshItems,
    ensureCover,
    syncingRefs,
    handleUpsert,
    handleDelete,
    handleToggleFav,
    handleImport,
  };
}
