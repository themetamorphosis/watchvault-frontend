"use client";

import { useMemo, useRef } from "react";
import type { Item } from "@/lib/types";

export type DashboardStats = {
  hoursWatched: number;
  topGenre: string;
  longestSeriesName: string;
  counts: { movie: number; tv: number; anime: number; favorites: number };
  totalStatus: number;
  watchedCount: number;
  pendingCount: number;
  wishlistCount: number;
  addedThisWeekCount: number;
  completionRate: number;
  avgWatchedRuntime: number;
  activityLogs: {
    id: string;
    time: string;
    title: string;
    action: string;
    media: string;
  }[];
  favoritesList: Item[];
};

export function useDashboardStats(items: Item[]): DashboardStats {
  // eslint-disable-next-line react-hooks/purity -- stable timestamp for "this week" filter
  const nowRef = useRef(Date.now());
  return useMemo(() => {
    const watchedItems = items.filter((i) => i.status === "watched");
    const pendingItems = items.filter((i) => i.status === "pending");
    const wishlistItems = items.filter((i) => i.status === "wishlist");

    let totalRuntimeMinutes = 0;
    const genreCounts = new Map<string, number>();
    let longestSeriesName = "N/A";
    let maxSeriesRuntime = 0;

    watchedItems.forEach((i) => {
      if (i.runtime) totalRuntimeMinutes += i.runtime;
      (i.genres || []).forEach((g) => {
        genreCounts.set(g, (genreCounts.get(g) || 0) + 1);
      });
      if (
        (i.mediaType === "tv" || i.mediaType === "anime") &&
        i.runtime &&
        i.runtime > maxSeriesRuntime
      ) {
        maxSeriesRuntime = i.runtime;
        longestSeriesName = i.title;
      }
    });

    const hoursWatched = Math.round(totalRuntimeMinutes / 60);

    let topGenre = "N/A";
    let maxCount = 0;
    genreCounts.forEach((count, genre) => {
      if (count > maxCount) {
        maxCount = count;
        topGenre = genre;
      }
    });

    const oneWeekAgo = nowRef.current - 7 * 24 * 60 * 60 * 1000;
    const addedThisWeekCount = items.filter(
      (i) => i.createdAt > oneWeekAgo,
    ).length;
    const completionRate =
      items.length > 0
        ? Math.round((watchedItems.length / items.length) * 100)
        : 0;
    const avgWatchedRuntime =
      watchedItems.length > 0
        ? Math.round(totalRuntimeMinutes / watchedItems.length)
        : 0;

    const counts = {
      movie: items.filter((i) => i.mediaType === "movie").length,
      tv: items.filter((i) => i.mediaType === "tv").length,
      anime: items.filter((i) => i.mediaType === "anime").length,
      favorites: items.filter((i) => i.favorite).length,
    };

    const totalStatus =
      watchedItems.length + pendingItems.length + wishlistItems.length;

    const recentActivity = [...items]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 5)
      .map((item) => {
        const date = new Date(item.updatedAt);
        const timeStr = date.toTimeString().split(" ")[0];
        const action =
          item.status === "watched"
            ? "WATCH"
            : item.status === "wishlist"
              ? "WISHL"
              : "PENDG";
        return {
          id: item.id,
          time: timeStr,
          title: item.title.toUpperCase(),
          action,
          media: item.mediaType.toUpperCase(),
        };
      });

    const activityLogs =
      recentActivity.length > 0
        ? recentActivity
        : [
            {
              id: "empty",
              time: "00:00:00",
              title: "SYSTEM STABLE — NO RECENT ACTIVITY RECORDED",
              action: "INFO",
              media: "SYS",
            },
          ];

    const favoritesList = items.filter((i) => i.favorite).slice(0, 8);

    return {
      hoursWatched,
      topGenre,
      longestSeriesName,
      counts,
      totalStatus,
      watchedCount: watchedItems.length,
      pendingCount: pendingItems.length,
      wishlistCount: wishlistItems.length,
      addedThisWeekCount,
      completionRate,
      avgWatchedRuntime,
      activityLogs,
      favoritesList,
    };
  }, [items]);
}
