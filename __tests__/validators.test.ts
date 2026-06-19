import { describe, it, expect } from "vitest";
import {
    WatchlistItemSchema,
    WatchlistItemsSchema,
    safeParseWatchlistItems,
    TMDBSearchResultSchema,
    MediaTypeSchema,
    StatusSchema,
} from "@/lib/validators";

describe("MediaTypeSchema", () => {
    it("accepts movie, tv, anime", () => {
        expect(MediaTypeSchema.parse("movie")).toBe("movie");
        expect(MediaTypeSchema.parse("tv")).toBe("tv");
        expect(MediaTypeSchema.parse("anime")).toBe("anime");
    });

    it("rejects invalid values", () => {
        expect(() => MediaTypeSchema.parse("book")).toThrow();
        expect(() => MediaTypeSchema.parse("")).toThrow();
    });
});

describe("StatusSchema", () => {
    it("accepts watched, pending, wishlist", () => {
        expect(StatusSchema.parse("watched")).toBe("watched");
        expect(StatusSchema.parse("pending")).toBe("pending");
        expect(StatusSchema.parse("wishlist")).toBe("wishlist");
    });

    it("rejects invalid values", () => {
        expect(() => StatusSchema.parse("completed")).toThrow();
    });
});

describe("WatchlistItemSchema", () => {
    const validItem = {
        id: "abc-123",
        userId: "user-1",
        title: "Inception",
        mediaType: "movie",
        status: "watched",
        favorite: false,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
    };

    it("accepts a minimal valid item", () => {
        const result = WatchlistItemSchema.safeParse(validItem);
        expect(result.success).toBe(true);
    });

    it("accepts null updatedAt (post-cleanup resilience)", () => {
        const result = WatchlistItemSchema.safeParse({
            ...validItem,
            updatedAt: null,
        });
        expect(result.success).toBe(true);
    });

    it("accepts null createdAt", () => {
        const result = WatchlistItemSchema.safeParse({
            ...validItem,
            createdAt: null,
        });
        expect(result.success).toBe(true);
    });

    it("accepts all optional fields", () => {
        const result = WatchlistItemSchema.safeParse({
            ...validItem,
            genres: ["Sci-Fi", "Action"],
            notes: "Great movie",
            description: "A mind-bending thriller",
            year: 2010,
            endYear: undefined,
            running: false,
            coverUrl: "https://image.tmdb.org/t/p/w500/poster.jpg",
            runtime: 148,
        });
        expect(result.success).toBe(true);
    });

    it("rejects missing required fields", () => {
        expect(WatchlistItemSchema.safeParse({ id: "x" }).success).toBe(false);
        expect(WatchlistItemSchema.safeParse({ ...validItem, mediaType: undefined }).success).toBe(false);
        expect(WatchlistItemSchema.safeParse({ ...validItem, status: undefined }).success).toBe(false);
    });

    it("rejects invalid mediaType", () => {
        expect(WatchlistItemSchema.safeParse({ ...validItem, mediaType: "book" }).success).toBe(false);
    });

    it("rejects invalid status", () => {
        expect(WatchlistItemSchema.safeParse({ ...validItem, status: "done" }).success).toBe(false);
    });
});

describe("TMDBSearchResultSchema", () => {
    it("accepts a valid TMDB result", () => {
        const result = TMDBSearchResultSchema.safeParse({
            tmdbId: 27205,
            title: "Inception",
            year: 2010,
            posterUrl: "https://image.tmdb.org/t/p/w500/poster.jpg",
            backdropUrl: null,
            overview: "A mind-bending thriller",
            mediaType: "movie",
            genres: ["Sci-Fi"],
            voteAverage: 8.4,
        });
        expect(result.success).toBe(true);
    });

    it("accepts null optional fields", () => {
        const result = TMDBSearchResultSchema.safeParse({
            tmdbId: 1,
            title: "Test",
            year: null,
            posterUrl: null,
            backdropUrl: null,
            overview: null,
            mediaType: "tv",
            genres: [],
            voteAverage: null,
        });
        expect(result.success).toBe(true);
    });
});

describe("safeParseWatchlistItems", () => {
    it("returns success for valid array", () => {
        const items = [
            {
                id: "1", userId: "u1", title: "Movie A", mediaType: "movie",
                status: "watched", favorite: false, createdAt: "2026-01-01T00:00:00Z",
                updatedAt: "2026-01-01T00:00:00Z",
            },
            {
                id: "2", userId: "u1", title: "Show B", mediaType: "tv",
                status: "pending", favorite: true, createdAt: "2026-01-01T00:00:00Z",
                updatedAt: "2026-01-01T00:00:00Z",
            },
        ];
        const result = safeParseWatchlistItems(items);
        expect(result.success).toBe(true);
        if (result.success) expect(result.data).toHaveLength(2);
    });

    it("returns failure for non-array input", () => {
        const result = safeParseWatchlistItems({ not: "an array" });
        expect(result.success).toBe(false);
    });

    it("returns failure for invalid items in array", () => {
        const result = safeParseWatchlistItems([{ id: "x" }]);
        expect(result.success).toBe(false);
    });
});
