import type { MediaType } from "@/lib/types";
import { fetchApi } from "@/lib/apiClient";

export type TMDBSearchResult = {
    tmdbId: number;
    title: string;
    year: number | null;
    posterUrl: string | null;
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
    signal?: AbortSignal
): Promise<TMDBSearchResult[]> {
    if (!query || query.trim().length < 2) return [];

    const params = new URLSearchParams();
    params.set("query", query.trim());
    params.set("type", type);

    const res = await fetchApi(`/media/search?${params.toString()}`, { signal });
    if (!res.ok) return [];

    const data = (await res.json()) as { results: TMDBSearchResult[] };
    return data.results ?? [];
}
