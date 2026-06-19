"use client";

import React from "react";
import Link from "next/link";
import { Heart, ChevronRight, Star } from "lucide-react";
import type { Item } from "@/lib/types";

interface FavoritesDeckProps {
    items: Item[];
}

export default function FavoritesDeck({ items }: FavoritesDeckProps) {
    return (
        <div className="col-span-full bg-neutral-900/30 border border-white/10 rounded-3xl p-6 flex flex-col justify-between transition-all duration-500 hover:border-white/15 hover:shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-widest flex items-center gap-1.5">
                    <Heart className="h-4 w-4 text-rose-500 fill-current" />
                    Favorites Spotlight Deck
                </h3>
                <Link href="/library/movies?favorite=true" className="text-[10px] font-bold text-amber-400 hover:underline flex items-center gap-0.5 uppercase tracking-wider">
                    Manage Favorites <ChevronRight className="h-3.5 w-3.5" />
                </Link>
            </div>

            {items.length > 0 ? (
                <div className="flex overflow-x-auto gap-5 pb-3 scrollbar-hide">
                    {items.map((item) => (
                        <Link
                            href={`/library/${item.mediaType === 'movie' ? 'movies' : item.mediaType === 'tv' ? 'tv' : 'anime'}`}
                            key={item.id}
                            className="w-[120px] shrink-0 group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-800/40 transition-all duration-500 hover:scale-[1.04] hover:border-amber-500/50 cursor-pointer"
                        >
                            <div className="aspect-[2/3] w-full bg-neutral-950 overflow-hidden relative">
                                {item.coverUrl ? (
                                    <img
                                        src={item.coverUrl}
                                        alt={item.title}
                                        className="w-full h-full object-cover filter brightness-95 group-hover:brightness-100 transition-all duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400 uppercase font-mono bg-neutral-900">
                                        No Poster
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2.5">
                                    <span className="text-[8px] text-amber-400 font-mono font-bold uppercase tracking-wider mb-0.5">{item.mediaType}</span>
                                    <h4 className="text-[10px] font-extrabold text-white truncate uppercase tracking-tight">{item.title}</h4>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="border border-dashed border-white/10 py-12 text-center bg-white/5 rounded-2xl">
                    <Star className="h-8 w-8 text-neutral-600 mx-auto mb-2 animate-pulse" />
                    <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">No Favorites Spotlighted</div>
                    <p className="text-[10px] text-neutral-500 mt-1 uppercase">Mark entries in your libraries as favorite to highlight them here.</p>
                </div>
            )}
        </div>
    );
}
