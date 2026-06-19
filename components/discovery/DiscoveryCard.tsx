"use client";

import React, { useState, useEffect, useRef } from "react";
import { Star, Eye, Trash2, Plus } from "lucide-react";
import type { TMDBSearchResult } from "@/lib/tmdb";
import type { Item, Status } from "@/lib/types";
import TMDBImage from "@/components/ui/TMDBImage";

/* ── COMPACT MEDIA CARD FOR DISCOVERY GRIDS ─────────────────────────── */
interface MediaDiscoverCardProps {
    item: TMDBSearchResult;
    isRetro: boolean;
    onOpen: () => void;
    onAdd: (status: Status) => void;
    onRemove: (id: string) => void;
    dbItem?: Item;
}

export default function MediaDiscoverCard({ item, isRetro, onOpen, onAdd, onRemove, dbItem }: MediaDiscoverCardProps) {
    const [quickMenuOpen, setQuickMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    /* Close quick menu when clicked outside */
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setQuickMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const meta = [item.year ? String(item.year) : "", item.genres?.[0] || ""].filter(Boolean).join(" • ");

    if (isRetro) {
        /* RETRO CRT CARD VARIATION */
        const borderClass = dbItem 
            ? "border-tui-green" 
            : item.mediaType === "movie" 
                ? "border-tui-border hover:border-tui-amber" 
                : item.mediaType === "tv" 
                    ? "border-tui-border hover:border-tui-purple" 
                    : "border-tui-border hover:border-tui-green";

        return (
            <div role="article" aria-label={`${item.title} ${item.year || ""}`} className={`border bg-tui-panel ${borderClass} font-mono text-left flex flex-col h-full`}>
                <div 
                    onClick={onOpen}
                    className="aspect-[2/3] w-full bg-tui-bg border-b border-tui-border overflow-hidden cursor-pointer relative"
                >
                    {item.posterUrl ? (
                        <TMDBImage src={item.posterUrl} alt={item.title} fill className="w-full h-full object-cover filter grayscale" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center p-3 text-[10px] text-tui-text-muted text-center uppercase">
                            {item.title}
                        </div>
                    )}
                    {dbItem && (
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 border border-tui-green bg-tui-bg text-tui-green text-[9px] font-bold uppercase">
                            [{dbItem.status.substring(0, 3)}]
                        </div>
                    )}
                </div>

                <div className="p-2.5 flex-1 flex flex-col justify-between">
                    <div>
                        <div 
                            onClick={onOpen}
                            className="text-[11px] font-bold text-tui-text truncate hover:text-tui-amber cursor-pointer uppercase tracking-wider"
                            title={item.title}
                        >
                            {item.title}
                        </div>
                        <div className="text-[9px] text-tui-text-muted uppercase truncate mt-0.5">
                            {meta || "\u00A0"}
                        </div>
                    </div>

                    <div className="mt-2.5 pt-1.5 border-t border-tui-border/50 flex items-center justify-between text-[9px]">
                        {dbItem ? (
                            <button
                                onClick={() => onRemove(dbItem.id)}
                                className="px-1.5 py-0.5 border border-red-950 text-red-500 bg-red-950/10 hover:border-red-600 transition-all uppercase"
                            >
                                [DEL]
                            </button>
                        ) : (
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setQuickMenuOpen(!quickMenuOpen)}
                                    className="px-1.5 py-0.5 border border-tui-border text-tui-text-muted hover:border-tui-text hover:text-tui-text bg-tui-bg transition-all uppercase"
                                >
                                    [+ADD]
                                </button>
                                {quickMenuOpen && (
                                    <div className="absolute left-0 bottom-full mb-1.5 z-40 bg-tui-panel border border-tui-border p-1 w-24 flex flex-col gap-0.5 shadow-2xl">
                                        {(["watched", "pending", "wishlist"] as Status[]).map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => {
                                                    onAdd(status);
                                                    setQuickMenuOpen(false);
                                                }}
                                                className="w-full text-left px-1.5 py-0.5 text-[8px] uppercase hover:bg-tui-input text-tui-text-muted hover:text-tui-text"
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        <span className="text-tui-text-muted">
                            {item.voteAverage ? `*${item.voteAverage.toFixed(1)}` : ""}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    /* MODERN GLASSMORPHIC CARD VARIATION (PosterCard Style) */
    return (
        <div 
            className="group relative cursor-pointer select-none text-left rounded-xl overflow-hidden border border-white/5 bg-zinc-950/40 hover:bg-zinc-900/50 hover:border-white/10 shadow-lg transition-all duration-300 animate-none"
            onClick={onOpen}
        >
            {/* Poster Image */}
            <div className="aspect-[2/3] w-full bg-white/[0.03] overflow-hidden relative border-b border-white/5">
                {item.posterUrl ? (
<TMDBImage src={item.posterUrl} alt={item.title} fill className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 filter brightness-90 group-hover:brightness-100" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center p-4 bg-zinc-900">
                        <span className="text-xs font-semibold text-white/30 text-center truncate">
                            {item.title}
                        </span>
                    </div>
                )}

                {/* Library status indicator */}
                {dbItem && (
                    <div className="absolute top-2 right-2 z-10 px-2.5 py-0.5 rounded-full bg-emerald-500/80 backdrop-blur-md text-[9px] text-zinc-950 font-bold uppercase tracking-wider shadow-md">
                        {dbItem.status}
                    </div>
                )}
            </div>

            {/* Hover Actions Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 pointer-events-none">
                <div className="pointer-events-auto flex items-center justify-between gap-1.5 w-full">
                    {dbItem ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(dbItem.id);
                            }}
                            className="flex-1 h-7 flex items-center justify-center gap-1 rounded bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/35 text-[10px] font-bold uppercase transition-all"
                        >
                            <Trash2 className="h-3 w-3" />
                            <span>REMOVE</span>
                        </button>
                    ) : (
                        <div className="flex-1 relative" ref={menuRef}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setQuickMenuOpen(!quickMenuOpen);
                                }}
                                className="w-full h-7 flex items-center justify-center gap-1 rounded bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[10px] font-bold uppercase transition-all"
                            >
                                <Plus className="h-3 w-3" />
                                <span>ADD</span>
                            </button>
                            {quickMenuOpen && (
                                <div className="absolute left-0 bottom-full mb-1.5 z-40 bg-zinc-950 border border-white/10 rounded-lg p-1.5 w-28 flex flex-col gap-1 shadow-xl">
                                    {(["watched", "pending", "wishlist"] as Status[]).map((status) => (
                                        <button
                                            key={status}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAdd(status);
                                                setQuickMenuOpen(false);
                                            }}
                                            className="w-full text-left px-2 py-1 text-[10px] uppercase rounded hover:bg-white/5 text-zinc-400 hover:text-white transition-all"
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpen();
                        }}
                        className="h-7 w-7 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all"
                        aria-label="View details" title="View details"
                    >
                        <Eye className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* Info details */}
            <div className="p-3">
                <div 
                    className="text-[12px] font-bold text-white truncate uppercase tracking-wider"
                    title={item.title}
                >
                    {item.title}
                </div>
                <div className="mt-0.5 flex items-center justify-between text-[10px] text-zinc-400">
                    <span className="truncate">{meta || "\u00A0"}</span>
                    {item.voteAverage && (
                        <span className="flex items-center gap-0.5 text-amber-400 font-bold shrink-0">
                            <Star className="h-3 w-3 fill-current" />
                            {item.voteAverage.toFixed(1)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
