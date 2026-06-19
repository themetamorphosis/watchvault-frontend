import { z } from "zod";

// --- Media type / status enums ---
export const MediaTypeSchema = z.enum(["movie", "tv", "anime"]);
export const StatusSchema = z.enum(["watched", "pending", "wishlist"]);

// --- Watchlist item from backend ---
export const WatchlistItemSchema = z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    mediaType: MediaTypeSchema,
    status: StatusSchema,
    favorite: z.boolean(),
    genres: z.array(z.string()).optional(),
    notes: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    year: z.number().nullable().optional(),
    endYear: z.number().nullable().optional(),
    running: z.boolean().optional(),
    coverUrl: z.string().nullable().optional(),
    runtime: z.number().nullable().optional(),
    createdAt: z.string().or(z.number()).nullable().optional(),
    updatedAt: z.string().or(z.number()).nullable().optional(),
});

export const WatchlistItemsSchema = z.array(WatchlistItemSchema);

// --- Auth ---
export const UserSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    emailVerified: z.string().nullable().optional(),
    createdAt: z.string().nullable().optional(),
    updatedAt: z.string().nullable().optional(),
});

export const TokenSchema = z.object({
    access_token: z.string(),
    refresh_token: z.string().optional(),
    token_type: z.string(),
});

// --- TMDB search ---
export const TMDBSearchResultSchema = z.object({
    tmdbId: z.number(),
    title: z.string(),
    year: z.number().nullable(),
    posterUrl: z.string().nullable(),
    backdropUrl: z.string().nullable(),
    overview: z.string().nullable(),
    mediaType: z.string(),
    genres: z.array(z.string()),
    voteAverage: z.number().nullable(),
});

export const TMDBSearchResponseSchema = z.object({
    results: z.array(TMDBSearchResultSchema),
});

// --- TMDB details ---
export const TMDBCastMemberSchema = z.object({
    name: z.string(),
    character: z.string(),
    profileUrl: z.string().nullable(),
});

export const TMDBMediaDetailsSchema = z.object({
    tmdbId: z.number(),
    title: z.string(),
    year: z.number().nullable(),
    overview: z.string().nullable(),
    genres: z.array(z.string()),
    voteAverage: z.number().nullable(),
    voteCount: z.number().nullable(),
    posterUrl: z.string().nullable(),
    backdropUrl: z.string().nullable(),
    runtime: z.number().nullable(),
    directors: z.array(z.string()),
    writers: z.array(z.string()),
    composers: z.array(z.string()),
    cast: z.array(TMDBCastMemberSchema),
    trailerKey: z.string().nullable(),
});

// --- Upload response ---
export const UploadResponseSchema = z.object({
    success: z.boolean(),
    imageUrl: z.string(),
});

// --- Safe parse helpers ---
export function safeParseWatchlistItems(data: unknown) {
    return WatchlistItemsSchema.safeParse(data);
}

export function safeParseUser(data: unknown) {
    return UserSchema.safeParse(data);
}

export function safeParseToken(data: unknown) {
    return TokenSchema.safeParse(data);
}

export function safeParseTMDBResults(data: unknown) {
    return TMDBSearchResponseSchema.safeParse(data);
}

export function safeParseMediaDetails(data: unknown) {
    return TMDBMediaDetailsSchema.safeParse(data);
}
