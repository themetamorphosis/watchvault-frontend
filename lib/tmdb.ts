import type { MediaType } from "@/lib/types";
import { fetchApi } from "@/lib/apiClient";
import {
  TMDBSearchResponseSchema,
  TMDBMediaDetailsSchema,
} from "@/lib/validators";

export type TMDBSearchResult = {
  tmdbId: number;
  title: string;
  year: number | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  overview: string | null;
  mediaType: string;
  genres: string[];
  voteAverage: number | null;
};

/**
 * Search TMDB via our backend proxy.
 * Returns up to 8 results for the autocomplete dropdown.
 */
export async function searchTmdb(
  query: string,
  type: MediaType,
  signal?: AbortSignal,
): Promise<TMDBSearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const params = new URLSearchParams();
    params.set("query", query.trim());
    params.set("type", type);

    const res = await fetchApi(`/media/search?${params.toString()}`, {
      signal,
    });
    if (!res.ok) {
      console.error("[TMDB] search request failed:", res.status);
      return [];
    }

    const raw = await res.json();
    const parsed = TMDBSearchResponseSchema.safeParse(raw);
    if (!parsed.success) {
      console.error("TMDB search response validation failed:", parsed.error);
      return [];
    }
    return parsed.data.results;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return [];
    console.error("[TMDB] search fetch error:", err);
    return [];
  }
}

/**
 * Fetch trending media.
 */
export async function getTrendingMedia(
  type: MediaType,
  timeWindow: "day" | "week" = "day",
  signal?: AbortSignal,
): Promise<TMDBSearchResult[]> {
  try {
    const params = new URLSearchParams();
    params.set("type", type);
    params.set("time_window", timeWindow);

    const res = await fetchApi(`/media/trending?${params.toString()}`, {
      signal,
    });
    if (!res.ok) {
      console.error("[TMDB] trending request failed:", res.status);
      return [];
    }

    const raw = await res.json();
    const parsed = TMDBSearchResponseSchema.safeParse(raw);
    if (!parsed.success) {
      console.error(
        "[TMDB] trending response validation failed:",
        parsed.error,
      );
      return [];
    }
    return parsed.data.results;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return [];
    console.error("[TMDB] trending fetch error:", err);
    return [];
  }
}

/**
 * Fetch popular media.
 */
export async function getPopularMedia(
  type: MediaType,
  page: number = 1,
  signal?: AbortSignal,
): Promise<TMDBSearchResult[]> {
  try {
    const params = new URLSearchParams();
    params.set("type", type);
    params.set("page", String(page));

    const res = await fetchApi(`/media/popular?${params.toString()}`, {
      signal,
    });
    if (!res.ok) {
      console.error("[TMDB] popular request failed:", res.status);
      return [];
    }

    const raw = await res.json();
    const parsed = TMDBSearchResponseSchema.safeParse(raw);
    if (!parsed.success) {
      console.error("[TMDB] popular response validation failed:", parsed.error);
      return [];
    }
    return parsed.data.results;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return [];
    console.error("[TMDB] popular fetch error:", err);
    return [];
  }
}

/**
 * Fetch top rated media.
 */
export async function getTopRatedMedia(
  type: MediaType,
  page: number = 1,
  signal?: AbortSignal,
): Promise<TMDBSearchResult[]> {
  try {
    const params = new URLSearchParams();
    params.set("type", type);
    params.set("page", String(page));

    const res = await fetchApi(`/media/top-rated?${params.toString()}`, {
      signal,
    });
    if (!res.ok) {
      console.error("[TMDB] top-rated request failed:", res.status);
      return [];
    }

    const raw = await res.json();
    const parsed = TMDBSearchResponseSchema.safeParse(raw);
    if (!parsed.success) {
      console.error(
        "[TMDB] top-rated response validation failed:",
        parsed.error,
      );
      return [];
    }
    return parsed.data.results;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return [];
    console.error("[TMDB] top-rated fetch error:", err);
    return [];
  }
}

/**
 * Discover media with advanced filters.
 */
export async function discoverMedia(
  params: {
    type: MediaType;
    genre?: string;
    year?: number;
    decade?: number;
    sortBy?: string;
    page?: number;
  },
  signal?: AbortSignal,
): Promise<TMDBSearchResult[]> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.set("type", params.type);
    if (params.genre) queryParams.set("genre", params.genre);
    if (params.year) queryParams.set("year", String(params.year));
    if (params.decade) queryParams.set("decade", String(params.decade));
    if (params.sortBy) queryParams.set("sort_by", params.sortBy);
    if (params.page) queryParams.set("page", String(params.page));

    const res = await fetchApi(`/media/discover?${queryParams.toString()}`, {
      signal,
    });
    if (!res.ok) {
      console.error("[TMDB] discover request failed:", res.status);
      return [];
    }

    const raw = await res.json();
    const parsed = TMDBSearchResponseSchema.safeParse(raw);
    if (!parsed.success) {
      console.error(
        "[TMDB] discover response validation failed:",
        parsed.error,
      );
      return [];
    }
    return parsed.data.results;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return [];
    console.error("[TMDB] discover fetch error:", err);
    return [];
  }
}

export type TMDBCastMember = {
  name: string;
  character: string;
  profileUrl: string | null;
};

export type TMDBMediaDetails = {
  tmdbId: number;
  title: string;
  year: number | null;
  overview: string | null;
  genres: string[];
  voteAverage: number | null;
  voteCount: number | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  runtime: number | null;
  directors: string[];
  writers: string[];
  composers: string[];
  cast: TMDBCastMember[];
  trailerKey: string | null;
};

/**
 * Fetch detailed media information, credits, and videos.
 */
export async function getMediaDetails(
  tmdbId: number,
  type: MediaType,
  signal?: AbortSignal,
): Promise<TMDBMediaDetails | null> {
  try {
    const params = new URLSearchParams();
    params.set("tmdb_id", String(tmdbId));
    params.set("type", type);

    const res = await fetchApi(`/media/details?${params.toString()}`, {
      signal,
    });
    if (!res.ok) {
      console.error("[TMDB] details request failed:", res.status);
      return null;
    }

    const raw = await res.json();
    const parsed = TMDBMediaDetailsSchema.safeParse(raw);
    if (!parsed.success) {
      console.error("TMDB details response validation failed:", parsed.error);
      return null;
    }
    return parsed.data;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return null;
    console.error("[TMDB] details fetch error:", err);
    return null;
  }
}
