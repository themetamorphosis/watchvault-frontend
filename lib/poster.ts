import type { MediaType } from "@/lib/types";
import { API_BASE } from "@/lib/auth";

export async function fetchPoster(title: string, mediaType: MediaType, year?: number) {
  const params = new URLSearchParams();
  params.set("title", title);
  params.set("type", mediaType);
  if (year) params.set("year", String(year));

  const r = await fetch(`${API_BASE}/media/poster?${params.toString()}`);
  if (!r.ok) return null;

  const data = (await r.json()) as { coverUrl: string | null; genres: string[]; description: string | null };
  return { coverUrl: data?.coverUrl ?? null, genres: data?.genres ?? [], description: data?.description ?? null };
}
