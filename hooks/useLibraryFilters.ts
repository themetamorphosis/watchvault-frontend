"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { Item, MediaType } from "@/lib/types";

export function useLibraryFilters(items: Item[], mediaType: MediaType, mode: "library" | "wishlist") {
  const [query, setQuery] = useState("");
  const [onlyFav, setOnlyFav] = useState(false);
  const [sort, setSort] = useState<"recent" | "title" | "year">("recent");
  const [genreFilter, setGenreFilter] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(30);

  // Reset visible count on filter change
  useEffect(() => {
    const t = setTimeout(() => setVisibleCount(30), 0);
    return () => clearTimeout(t);
  }, [onlyFav, query, sort, mediaType, genreFilter]);

  // Infinite scroll observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) observerRef.current.disconnect();
    if (node) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setVisibleCount((prev) => prev + 30);
          }
        },
        { rootMargin: "1200px" },
      );
      observerRef.current.observe(node);
    }
  }, []);

  // Base items by type and mode
  const pageItems = useMemo(() => {
    const byType = items.filter((i) => i.mediaType === mediaType);
    if (mode === "wishlist") return byType.filter((i) => i.status === "wishlist");
    return byType.filter((i) => i.status !== "wishlist");
  }, [items, mediaType, mode]);

  // All genres for chip display
  const allGenres = useMemo(() => {
    const s = new Set<string>();
    for (const it of pageItems) {
      for (const g of it.genres ?? []) s.add(g);
    }
    return Array.from(s).sort();
  }, [pageItems]);

  // Filtered + sorted items
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = pageItems.slice();

    if (onlyFav) arr = arr.filter((i) => i.favorite);

    if (q) {
      arr = arr.filter((i) => {
        const g = (i.genres ?? []).join(" ").toLowerCase();
        return (
          i.title.toLowerCase().includes(q) ||
          (i.year?.toString().includes(q) ?? false) ||
          g.includes(q) ||
          (i.notes ?? "").toLowerCase().includes(q)
        );
      });
    }

    if (genreFilter) {
      arr = arr.filter((it) => (it.genres ?? []).includes(genreFilter));
    }

    if (sort === "recent") arr.sort((a, b) => b.updatedAt - a.updatedAt);
    if (sort === "title") arr.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "year") arr.sort((a, b) => (b.year ?? -1) - (a.year ?? -1));

    return arr;
  }, [pageItems, onlyFav, query, sort, genreFilter, mode]);

  const renderItems = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  return {
    query,
    setQuery,
    onlyFav,
    setOnlyFav,
    sort,
    setSort,
    genreFilter,
    setGenreFilter,
    allGenres,
    pageItems,
    filtered,
    renderItems,
    visibleCount,
    loadMoreRef,
  };
}
