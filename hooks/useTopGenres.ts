"use client";

import { useMemo } from "react";
import type { Item } from "@/lib/types";

export type GenreCount = { name: string; count: number };

export function useTopGenres(items: Item[], limit: number = 5): GenreCount[] {
    return useMemo(() => {
        const counts = new Map<string, number>();
        items.forEach(item => {
            (item.genres || []).forEach(g => {
                counts.set(g, (counts.get(g) || 0) + 1);
            });
        });
        return Array.from(counts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }, [items, limit]);
}
