"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, Heart, Plus, Check, Bookmark } from "lucide-react";
import type { TMDBSearchResult } from "@/lib/tmdb";
import type { Item, Status } from "@/lib/types";

interface SpotlightHeroProps {
    items: TMDBSearchResult[];
    currentIdx: number;
    loading: boolean;
    watchlist: Item[];
    onAdd: (media: TMDBSearchResult, status: Status) => void;
    onRemove: (itemId: string) => void;
    onToggleFav: (itemId: string) => void;
    onSelect: (item: TMDBSearchResult) => void;
}

function getWatchlistItem(watchlist: Item[], res: TMDBSearchResult | null) {
    if (!res) return undefined;
    return watchlist.find(w => w.title.toLowerCase() === res.title.toLowerCase() && w.mediaType === res.mediaType);
}

export default function SpotlightHero({ items, currentIdx, loading, watchlist, onAdd, onRemove, onToggleFav, onSelect }: SpotlightHeroProps) {
    if (loading) {
        return (
            <div className="h-[340px] w-full flex items-center justify-center font-mono text-xs text-tui-text-muted uppercase">
                [ LOADING SPOTLIGHT... ]
            </div>
        );
    }

    if (items.length === 0) return null;

    const item = items[currentIdx];
    const addedItem = getWatchlistItem(watchlist, item);

    return (
        <div className="relative min-h-[340px] mb-8">
            <AnimatePresence mode="wait">
                <motion.div
                    key={item.tmdbId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col md:flex-row items-start gap-6"
                >
                    <div className="w-[140px] shrink-0 cursor-pointer" onClick={() => onSelect(item)}>
                        {item.posterUrl ? (
                            <img src={item.posterUrl} alt={item.title} className="w-full rounded-xl border border-white/10 shadow-2xl" />
                        ) : (
                            <div className="w-full aspect-[2/3] bg-neutral-800 rounded-xl flex items-center justify-center text-[10px] text-neutral-400 font-mono">No Poster</div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-neutral-400 font-mono uppercase tracking-widest mb-2">
                            <span className="bg-amber-500/10 border border-amber-500/25 text-amber-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <Sparkles className="h-3 w-3 animate-pulse" /> Spotlight
                            </span>
                            <span>•</span>
                            <span className="font-semibold">{item.mediaType}</span>
                            <span>•</span>
                            <span>{item.year || "N/A"}</span>
                            {item.voteAverage != null && (
                                <><span>•</span><span className="flex items-center gap-0.5"><Star className="h-3 w-3 text-amber-400" />{item.voteAverage.toFixed(1)}</span></>
                            )}
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase leading-tight mb-2 truncate">{item.title}</h2>
                        <p className="text-xs sm:text-sm text-neutral-400 line-clamp-3 mb-4 max-w-2xl leading-relaxed">{item.overview || "No description available."}</p>

                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            {item.genres.slice(0, 3).map(g => (
                                <span key={g} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-neutral-300 font-mono uppercase">{g}</span>
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            {addedItem ? (
                                <>
                                    <button onClick={() => onToggleFav(addedItem.id)} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${addedItem.favorite ? "bg-rose-500/10 border border-rose-500/25 text-rose-400" : "border border-white/10 text-neutral-300 hover:text-rose-400"}`}>
                                        <Heart className={`h-3.5 w-3.5 ${addedItem.favorite ? "fill-current" : ""}`} />{addedItem.favorite ? "Favorited" : "Favorite"}
                                    </button>
                                    <button onClick={() => onRemove(addedItem.id)} className="px-4 py-2 border border-white/10 hover:border-red-500/40 rounded-xl text-xs font-semibold text-neutral-300 hover:text-red-400 transition-all flex items-center gap-1 cursor-pointer">
                                        <Bookmark className="h-3.5 w-3.5" /> Remove
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => onAdd(item, "watched")} className="px-4 py-2 bg-white text-black hover:bg-neutral-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"><Check className="h-3.5 w-3.5" /> Mark Watched</button>
                                    <button onClick={() => onAdd(item, "wishlist")} className="px-4 py-2 border border-white/10 hover:border-amber-500/40 rounded-xl text-xs font-semibold text-neutral-300 hover:text-amber-400 transition-all flex items-center gap-1 cursor-pointer"><Plus className="h-3.5 w-3.5" /> Add to Wishlist</button>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
