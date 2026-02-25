export type MediaType = "movie" | "tv" | "anime";
export type Status = "watched" | "pending" | "wishlist";

export type Item = {
  id: string;
  title: string;
  mediaType: MediaType;
  status: Status;
  favorite: boolean;
  genres?: string[];
  notes?: string;

  year?: number;
  endYear?: number;
  running?: boolean;

  coverUrl?: string;
  runtime?: number;   // total runtime in minutes (cached from TMDB)

  createdAt: number;
  updatedAt: number;
};