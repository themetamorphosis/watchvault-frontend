"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Star, Heart, Eye } from "lucide-react";
import type { Item, Status } from "@/lib/types";

/* Deterministic progress from item id — avoids hydration mismatch */
function stableProgress(id: string): number {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = (hash * 31 + id.charCodeAt(i)) | 0;
    }
    return 20 + (Math.abs(hash) % 61); // 20–80
}

function statusLabel(s: Status) {
    if (s === "watched") return "Watched";
    if (s === "pending") return "Pending";
    return "Wishlisted";
}

function statusColor(s: Status) {
    if (s === "watched") return "bg-emerald-500/20 text-emerald-400/80";
    if (s === "pending") return "bg-amber-500/20 text-amber-400/80";
    return "bg-violet-500/20 text-violet-400/80";
}

interface PosterCardProps {
    item: Item;
    onOpen?: () => void;
    onFav?: () => void;
}

export default function PosterCard({ item, onOpen, onFav }: PosterCardProps) {
    const year = item.year ? String(item.year) : "";
    const genre = item.genres?.[0] || "";
    const meta = [year, genre].filter(Boolean).join(" • ");

    return (
        <motion.div
            className="poster-card group"
            whileTap={{ scale: 0.97 }}
            onClick={onOpen}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onOpen?.();
            }}
            aria-label={`Open ${item.title}`}
        >
            {/* Poster Image */}
            <div className="aspect-[2/3] w-full bg-white/[0.03]">
                {item.coverUrl ? (
                    <img
                        src={item.coverUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950">
                        <span className="text-sm font-medium text-white/30">
                            {item.title}
                        </span>
                    </div>
                )}
            </div>

            {/* Hover Overlay */}
            <div className="poster-overlay" />

            {/* Hover Actions */}
            <div className="poster-actions">
                <div className="mb-2">
                    <div className="text-sm font-semibold text-white truncate">
                        {item.title}
                    </div>
                    <div className="text-xs text-white/50 mt-0.5">{meta || "\u00A0"}</div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                            key={s}
                            className={`h-3 w-3 ${s <= 4 ? "fill-amber-400 text-amber-400" : "text-white/20"}`}
                        />
                    ))}
                </div>

                {/* Status chip */}
                <div className="flex items-center justify-between">
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusColor(item.status)}`}
                    >
                        {statusLabel(item.status)}
                    </span>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpen?.();
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            aria-label="View details"
                        >
                            <Eye className="h-3.5 w-3.5 text-white/70" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onFav?.();
                            }}
                            className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${item.favorite
                                ? "bg-rose-500/20 ring-1 ring-rose-400/40"
                                : "bg-white/10 hover:bg-white/20"
                                }`}
                            aria-label={item.favorite ? "Unfavorite" : "Favorite"}
                        >
                            <Heart
                                className={`h-3.5 w-3.5 ${item.favorite
                                    ? "fill-rose-400 text-rose-400"
                                    : "text-white/70"
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Progress bar (for pending items) */}
                {item.status === "pending" && (
                    <div className="mt-2 h-1 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
                            style={{ width: `${stableProgress(item.id)}%` }}
                        />
                    </div>
                )}
            </div>
        </motion.div>
    );
}
