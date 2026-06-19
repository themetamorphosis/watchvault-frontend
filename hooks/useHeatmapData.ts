"use client";

import { useMemo } from "react";
import type { Item } from "@/lib/types";

export type HeatmapDay = { date: Date; count: number; dayLabel: string };

export function useHeatmapData(items: Item[]): HeatmapDay[] {
    return useMemo(() => {
        const data: HeatmapDay[] = [];
        const now = new Date();
        const startDate = new Date();
        startDate.setDate(now.getDate() - 83);
        startDate.setHours(0, 0, 0, 0);

        const dateCounts = new Map<string, number>();
        items.forEach(item => {
            const d = new Date(item.createdAt || item.updatedAt);
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            dateCounts.set(key, (dateCounts.get(key) || 0) + 1);
        });

        for (let i = 0; i <= 83; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            const count = dateCounts.get(key) || 0;
            const formatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
            data.push({ date: d, count, dayLabel: formatter.format(d) });
        }
        return data;
    }, [items]);
}
