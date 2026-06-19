import type { Status } from "@/lib/types";

/**
 * Convert a Status value to a human-readable label.
 */
export function statusText(s: Status): string {
    if (s === "watched") return "Watched";
    if (s === "pending") return "Pending";
    return "Wishlist";
}

/**
 * Format a year range for display (TV shows / anime).
 */
export function yearLabel(item: { mediaType: string; year?: number; endYear?: number; running?: boolean }): string {
    if (item.mediaType === "movie") return item.year ? String(item.year) : "";
    const start = item.year;
    const end = item.endYear;
    const running = item.running;
    if (start && end) return `${start}–${end}`;
    if (start && running) return `${start}–Running`;
    if (!start && running) return "Running";
    if (start) return String(start);
    return "";
}
