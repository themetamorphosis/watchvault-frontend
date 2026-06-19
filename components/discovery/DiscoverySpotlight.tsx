"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Plus, Check, Trash2, Bookmark } from "lucide-react";
import type { TMDBSearchResult } from "@/lib/tmdb";
import type { Item, Status, MediaType } from "@/lib/types";
import TMDBImage from "@/components/ui/TMDBImage";

interface DiscoverySpotlightProps {
  spotlightItem: TMDBSearchResult | undefined;
  spotlightItems: TMDBSearchResult[];
  spotlightIdx: number;
  loadingSpotlight: boolean;
  mediaType: MediaType;
  isRetro: boolean;
  watchlistItem?: Item;
  onSelect: (item: TMDBSearchResult) => void;
  onAdd: (media: TMDBSearchResult, status: Status) => void;
  onRemove: (itemId: string) => void;
}

export default function DiscoverySpotlight({
  spotlightItem,
  spotlightItems,
  spotlightIdx,
  loadingSpotlight,
  mediaType,
  isRetro,
  watchlistItem,
  onSelect,
  onAdd,
  onRemove,
}: DiscoverySpotlightProps) {
  if (loadingSpotlight || !spotlightItem) {
    if (loadingSpotlight) {
      return isRetro ? (
        <div className="border border-tui-border bg-tui-panel p-4 font-mono text-xs text-tui-text-muted mb-6">
          *** LOADING SPOTLIGHT METADATA ***
        </div>
      ) : (
        <div className="min-h-[340px] flex items-center justify-center font-mono text-xs text-tui-text-muted uppercase">
          [ FETCHING SPOTLIGHT METADATA... ]
        </div>
      );
    }
    return null;
  }

  return (
    <div className="relative min-h-[340px] mb-8">
      {!isRetro ? (
        /* Modern Spotlight */
        <AnimatePresence mode="wait">
          <motion.div
            key={spotlightItem.tmdbId}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full flex items-center pt-8 pb-8"
          >
            <div className="max-w-4xl text-left space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-0.5 rounded-full bg-tui-amber/20 border border-tui-amber/30 text-tui-amber font-mono text-[10px] tracking-widest uppercase">
                  SPOTLIGHT // {mediaType.toUpperCase()}
                </span>
                {spotlightItem.voteAverage && (
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-400 font-mono">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {spotlightItem.voteAverage.toFixed(1)} SCORE
                  </span>
                )}
                <span className="text-white/40 text-xs font-mono">
                  {spotlightItem.year || "N/A"}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {spotlightItem.title}
              </h1>

              <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl line-clamp-3">
                {spotlightItem.overview || "No description available."}
              </p>

              <div className="flex flex-wrap gap-2">
                {spotlightItem.genres.slice(0, 3).map((g) => (
                  <span
                    key={g}
                    className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-zinc-300 font-mono uppercase"
                  >
                    {g}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2">
                {watchlistItem ? (
                  <>
                    <button
                      onClick={() => onRemove(watchlistItem.id)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                    <button
                      onClick={() => onSelect(spotlightItem)}
                      className="flex items-center gap-2 px-5 py-2.5 border border-white/10 rounded-xl text-zinc-300 text-sm font-semibold hover:border-white/20 transition-all cursor-pointer"
                    >
                      <Bookmark className="h-4 w-4" /> Details
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onAdd(spotlightItem, "watched")}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white text-zinc-950 rounded-xl text-sm font-bold hover:bg-neutral-100 transition-all cursor-pointer"
                    >
                      <Check className="h-4 w-4" /> Mark Watched
                    </button>
                    <button
                      onClick={() => onAdd(spotlightItem, "wishlist")}
                      className="flex items-center gap-2 px-5 py-2.5 border border-white/10 rounded-xl text-zinc-300 text-sm font-semibold hover:border-amber-500/30 hover:text-amber-400 transition-all cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Add to Wishlist
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Poster */}
            {spotlightItem.posterUrl && (
              <div
                onClick={() => onSelect(spotlightItem)}
                className="hidden md:block ml-auto w-[180px] shrink-0 cursor-pointer"
              >
                <TMDBImage
                  src={spotlightItem.posterUrl}
                  alt={spotlightItem.title}
                  width={180}
                  height={270}
                  className="w-full rounded-xl border border-white/10 shadow-2xl"
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      ) : (
        /* Retro Spotlight */
        <div className="border border-tui-border bg-tui-panel p-5 font-mono space-y-4">
          <div className="text-tui-amber font-bold uppercase tracking-wider text-sm">
            *** FEATURED SPOTLIGHT ***
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div
              onClick={() => onSelect(spotlightItem)}
              className="relative md:col-span-1 border border-tui-border bg-tui-bg aspect-[2/3] overflow-hidden cursor-pointer hover:border-tui-amber transition-colors"
            >
              {spotlightItem.posterUrl ? (
                <TMDBImage
                  src={spotlightItem.posterUrl}
                  alt={spotlightItem.title}
                  fill
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-tui-text-muted uppercase">
                  No Image
                </div>
              )}
            </div>
            <div className="md:col-span-3 space-y-3">
              <div
                onClick={() => onSelect(spotlightItem)}
                className="text-tui-text font-bold uppercase text-lg cursor-pointer hover:text-tui-amber transition-colors"
              >
                {spotlightItem.title}
              </div>
              <div className="text-tui-text-muted text-sm">
                {spotlightItem.year || "N/A"}{" "}
                {spotlightItem.voteAverage
                  ? `| RATING: ${spotlightItem.voteAverage.toFixed(1)}`
                  : ""}
              </div>
              <div className="text-tui-text-muted leading-relaxed line-clamp-3 text-sm">
                {spotlightItem.overview || "No description available."}
              </div>
              {spotlightItem.genres && spotlightItem.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {spotlightItem.genres.slice(0, 3).map((g) => (
                    <span
                      key={g}
                      className="px-2 py-0.5 border border-tui-border text-tui-text-muted text-[10px] uppercase"
                    >
                      [{g}]
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                {watchlistItem ? (
                  <button
                    onClick={() => onRemove(watchlistItem.id)}
                    className="px-4 py-1.5 border border-red-950 text-red-500 bg-red-950/10 hover:border-red-600 uppercase text-xs"
                  >
                    [DEL]
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => onAdd(spotlightItem, "watched")}
                      className="px-4 py-1.5 border border-tui-border text-tui-green hover:border-tui-green uppercase text-xs"
                    >
                      [+WATCHED]
                    </button>
                    <button
                      onClick={() => onAdd(spotlightItem, "wishlist")}
                      className="px-4 py-1.5 border border-tui-border text-tui-text-muted hover:border-tui-amber uppercase text-xs"
                    >
                      [+WISHLIST]
                    </button>
                  </>
                )}
                <button
                  onClick={() => onSelect(spotlightItem)}
                  className="px-4 py-1.5 border border-tui-border text-tui-text-muted hover:border-tui-text uppercase text-xs"
                >
                  [DETAILS]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spotlight pagination dots */}
      {!isRetro && spotlightItems.length > 1 && !loadingSpotlight && (
        <div className="flex justify-center gap-2 pt-4">
          {spotlightItems.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 rounded-full transition-all duration-300 ${
                idx === spotlightIdx ? "w-6 bg-white" : "w-2 bg-white/20"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
