"use client";

import React from "react";
import type { Item, MediaType } from "@/lib/types";
import { Play, Clock } from "lucide-react";

/* Deterministic progress from item id */
function stableProgress(id: string): number {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = (hash * 31 + id.charCodeAt(i)) | 0;
    }
    return 20 + (Math.abs(hash) % 61);
}

const CONTINUE_WATCHING_MOCK: Item[] = [
    {
        id: "cw-1",
        title: "Breaking Bad",
        mediaType: "tv",
        status: "pending",
        favorite: true,
        genres: ["Crime", "Drama"],
        year: 2008,
        endYear: 2013,
        coverUrl: "https://picsum.photos/seed/cw-bb/300/450",
        runtime: 2940,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    },
    {
        id: "cw-2",
        title: "Jujutsu Kaisen",
        mediaType: "anime",
        status: "pending",
        favorite: false,
        genres: ["Action", "Fantasy"],
        year: 2020,
        running: true,
        coverUrl: "https://picsum.photos/seed/cw-jjk/300/450",
        runtime: 1200,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    },
    {
        id: "cw-3",
        title: "Dune: Part Two",
        mediaType: "movie",
        status: "pending",
        favorite: false,
        genres: ["Sci-Fi", "Adventure"],
        year: 2024,
        coverUrl: "https://picsum.photos/seed/cw-dune/300/450",
        runtime: 166,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    },
    {
        id: "cw-4",
        title: "Severance",
        mediaType: "tv",
        status: "pending",
        favorite: true,
        genres: ["Thriller", "Drama"],
        year: 2022,
        running: true,
        coverUrl: "https://picsum.photos/seed/cw-sev/300/450",
        runtime: 450,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    },
    {
        id: "cw-5",
        title: "Spy x Family",
        mediaType: "anime",
        status: "pending",
        favorite: false,
        genres: ["Comedy", "Action"],
        year: 2022,
        running: true,
        coverUrl: "https://picsum.photos/seed/cw-spy/300/450",
        runtime: 600,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    },
    {
        id: "cw-6",
        title: "Oppenheimer",
        mediaType: "movie",
        status: "pending",
        favorite: true,
        genres: ["Drama", "History"],
        year: 2023,
        coverUrl: "https://picsum.photos/seed/cw-opp/300/450",
        runtime: 180,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    },
];

interface ContinueWatchingRowProps {
    mediaType?: MediaType;
}

export default function ContinueWatchingRow({ mediaType }: ContinueWatchingRowProps) {
    /* Filter by media type if provided */
    const items = mediaType
        ? CONTINUE_WATCHING_MOCK.filter((i) => i.mediaType === mediaType)
        : CONTINUE_WATCHING_MOCK;

    if (items.length === 0) return null;

    return (
        <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-white/30" />
                <h3 className="text-sm font-semibold tracking-wide text-white/50 uppercase">
                    Continue Watching
                </h3>
            </div>

            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                {items.map((item) => {
                    const progress = stableProgress(item.id);
                    return (
                        <div key={item.id} className="cw-card">
                            {/* Thumbnail */}
                            <div className="relative h-36 bg-white/[0.03]">
                                {item.coverUrl && (
                                    <img
                                        src={item.coverUrl}
                                        alt={item.title}
                                        className="h-full w-full object-cover"
                                    />
                                )}
                                {/* Play overlay */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-md">
                                        <Play className="h-5 w-5 text-white fill-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-3">
                                <div className="text-sm font-medium text-white/80 truncate">
                                    {item.title}
                                </div>
                                <div className="text-xs text-white/35 mt-0.5">
                                    {item.genres?.[0]} • {item.year}
                                </div>

                                {/* Progress bar */}
                                <div className="mt-2.5 h-1 w-full rounded-full bg-white/10 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="text-[10px] text-white/25 mt-1">
                                    {progress}% complete
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
