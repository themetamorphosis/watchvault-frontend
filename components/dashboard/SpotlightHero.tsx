"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Shuffle, ChevronRight, Film, Heart } from "lucide-react";
import type { Item } from "@/lib/types";

interface SpotlightHeroProps {
  item: Item | null;
  onShuffle: () => void;
}

export default function SpotlightHero({ item, onShuffle }: SpotlightHeroProps) {
  return (
    <div className="col-span-full md:col-span-4 min-h-[380px] relative overflow-hidden bg-neutral-900/30 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-500 hover:border-white/15 hover:shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
      {item ? (
        <>
          {/* Blurred Backdrop */}
          <div className="absolute inset-0 z-0 select-none pointer-events-none">
            <div
              className="absolute inset-0 bg-cover bg-center filter blur-3xl brightness-[0.25] opacity-60 scale-125 transition-all duration-700"
              style={{ backgroundImage: `url(${item.coverUrl || ""})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-start justify-between h-full w-full">
            {/* Poster Display */}
            <div className="relative shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:border-amber-500/40 aspect-[2/3] w-[130px] md:w-[160px]">
              {item.coverUrl ? (
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-[10px] text-neutral-400 font-mono uppercase">
                  No Poster
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="flex-1 min-w-0 flex flex-col justify-between h-full mt-4 sm:mt-0">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-neutral-400 font-mono uppercase tracking-widest mb-3">
                  <span className="bg-amber-500/10 border border-amber-500/25 text-amber-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Sparkles className="h-3 w-3 animate-pulse" /> Spotlight
                  </span>
                  <span>•</span>
                  <span className="font-semibold">{item.mediaType}</span>
                  <span>•</span>
                  <span>{item.year || "N/A"}</span>
                  {item.runtime && (
                    <>
                      <span>•</span>
                      <span>{item.runtime} mins</span>
                    </>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase leading-tight mb-2 truncate">
                  {item.title}
                </h1>

                <p className="text-xs sm:text-sm text-neutral-400 line-clamp-3 mb-4 max-w-2xl leading-relaxed">
                  {item.description ||
                    "No description logged. This cinematic entry is safely cataloged inside your digital WatchVault."}
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  {item.favorite && (
                    <div className="flex items-center gap-1 text-xs text-rose-500 font-semibold">
                      <Heart className="h-3.5 w-3.5 fill-current" /> Favorited
                    </div>
                  )}
                  {item.genres &&
                    item.genres.length > 0 &&
                    item.genres.slice(0, 3).map((genre) => (
                      <span
                        key={genre}
                        className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-neutral-300 font-mono uppercase"
                      >
                        {genre}
                      </span>
                    ))}
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={onShuffle}
                  className="px-4 py-2 border border-white/10 hover:border-amber-500/40 rounded-xl text-xs font-semibold text-neutral-300 hover:text-amber-400 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Shuffle className="h-3.5 w-3.5 text-amber-400" />
                  Shuffle
                </button>
                <Link
                  href={`/library/${item.mediaType === "movie" ? "movies" : item.mediaType === "tv" ? "tv" : "anime"}`}
                  className="px-4 py-2 bg-white text-black hover:bg-neutral-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                >
                  Open Library
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center h-full py-12">
          <Film className="h-12 w-12 text-neutral-600 mb-3" />
          <h2 className="text-lg font-bold text-white uppercase tracking-wide">
            WatchVault Spotlight
          </h2>
          <p className="text-xs text-neutral-400 max-w-xs mt-1">
            Log titles to your catalog and highlight your favorites to showcase
            them here!
          </p>
        </div>
      )}
    </div>
  );
}
