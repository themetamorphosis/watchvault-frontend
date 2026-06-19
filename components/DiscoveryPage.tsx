"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Film, Tv, Sparkles, SlidersHorizontal, Compass } from "lucide-react";
import { useRetroTheme } from "@/components/layout/RetroThemeContext";
import {
  getTrendingMedia,
  getPopularMedia,
  getTopRatedMedia,
  discoverMedia,
  getMediaDetails,
  type TMDBSearchResult,
  type TMDBMediaDetails,
} from "@/lib/tmdb";
import {
  getItems,
  upsertItem,
  deleteItem,
  toggleFavorite,
} from "@/app/actions/items";
import type { Item, MediaType, Status } from "@/lib/types";
import {
  MOVIE_GENRES,
  TV_GENRES,
  type ListType,
} from "@/lib/discovery-constants";
import ExplorerFilters from "@/components/discovery/ExplorerFilters";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import DetailOverlay from "@/components/discovery/DetailOverlay";
import MediaDiscoverCard from "@/components/discovery/DiscoveryCard";
import DiscoverySpotlight from "@/components/discovery/DiscoverySpotlight";

export default function DiscoveryPage() {
  const { theme, scanlines } = useRetroTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isRetro = mounted && theme.startsWith("retro");

  /* Tab navigation */
  const [activeTab, setActiveTab] = useState<ListType>("trending");
  const [mediaType, setMediaType] = useState<MediaType>("movie");

  /* Data lists & Pagination */
  const [results, setResults] = useState<TMDBSearchResult[]>([]);
  const [watchlist, setWatchlist] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState(true);

  /* Featured Spotlight Carousel */
  const [spotlightItems, setSpotlightItems] = useState<TMDBSearchResult[]>([]);
  const [spotlightIdx, setSpotlightIdx] = useState<number>(0);
  const [loadingSpotlight, setLoadingSpotlight] = useState(true);

  /* Custom Explorer Filter states */
  const [genreFilter, setGenreFilter] = useState<string>("");
  const [decadeFilter, setDecadeFilter] = useState<number | "">("");
  const [sortBy, setSortBy] = useState<string>("popularity.desc");
  const [showFilters, setShowFilters] = useState(true);

  /* Deep Details state */
  const [selectedItem, setSelectedItem] = useState<TMDBSearchResult | null>(
    null,
  );
  const [details, setDetails] = useState<TMDBMediaDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [playTrailer, setPlayTrailer] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [showRatingSelector, setShowRatingSelector] = useState(false);

  const handleSelectItem = (item: TMDBSearchResult | null) => {
    setSelectedItem(item);
    setPlayTrailer(false);
    setShowRatingSelector(false);
    setDetails(null);
    if (item) {
      setLoadingDetails(true);
      const saved = localStorage.getItem(`user_rating_${item.tmdbId}`);
      setUserRating(saved ? Number(saved) : null);
    } else {
      setLoadingDetails(false);
      setUserRating(null);
    }
  };

  const handleRate = (rating: number) => {
    setUserRating(rating);
    if (selectedItem) {
      localStorage.setItem(
        `user_rating_${selectedItem.tmdbId}`,
        String(rating),
      );
    }
    setShowRatingSelector(false);
  };

  const handleClearRate = () => {
    setUserRating(null);
    if (selectedItem) {
      localStorage.removeItem(`user_rating_${selectedItem.tmdbId}`);
    }
    setShowRatingSelector(false);
  };

  /* ── Fetch User Watchlist ─────────────────────────────────── */
  const loadWatchlist = useCallback(() => {
    getItems()
      .then((items) => setWatchlist(items))
      .catch((err) => console.error("Failed to load watchlist:", err));
  }, []);

  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  /* Check if item is already in watchlist */
  const getWatchlistItem = useCallback(
    (res: TMDBSearchResult | null) => {
      if (!res) return undefined;
      return watchlist.find(
        (w) =>
          w.title.toLowerCase() === res.title.toLowerCase() &&
          w.mediaType === res.mediaType,
      );
    },
    [watchlist],
  );

  /* ── Fetch Spotlight Items (Top Trending) ─────────────────── */
  useEffect(() => {
    const controller = new AbortController();
    getTrendingMedia(mediaType, "week", controller.signal)
      .then((res) => {
        if (!controller.signal.aborted && res.length > 0) {
          setSpotlightItems(res.slice(0, 5));
          setSpotlightIdx(0);
          setLoadingSpotlight(false);
        }
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (!controller.signal.aborted) {
          console.error("Failed to fetch spotlight titles:", err);
          setLoadingSpotlight(false);
        }
      });

    return () => controller.abort();
  }, [mediaType]);

  /* Auto rotating spotlight slides */
  useEffect(() => {
    if (spotlightItems.length === 0 || loadingSpotlight) return;
    const interval = setInterval(() => {
      setSpotlightIdx((prev) => (prev + 1) % spotlightItems.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [spotlightItems, loadingSpotlight]);

  const spotlightItem = spotlightItems[spotlightIdx];

  /* ── Fetch Grid Content (Based on Active Tab) ─────────────── */
  const loadDataRef = useRef<
    (pageNum: number, append?: boolean) => Promise<void>
  >(() => Promise.resolve());

  const loadData = useCallback(
    async (pageNum: number, append: boolean = false) => {
      setLoading(true);
      const controller = new AbortController();

      try {
        let res: TMDBSearchResult[] = [];
        if (activeTab === "trending") {
          res = await getTrendingMedia(mediaType, "week", controller.signal);
          setHasMore(false);
        } else if (activeTab === "popular") {
          res = await getPopularMedia(mediaType, pageNum, controller.signal);
          setHasMore(res.length > 0);
        } else if (activeTab === "top-rated") {
          res = await getTopRatedMedia(mediaType, pageNum, controller.signal);
          setHasMore(res.length > 0);
        } else if (activeTab === "explorer") {
          res = await discoverMedia(
            {
              type: mediaType,
              genre: genreFilter,
              decade: decadeFilter || undefined,
              sortBy: sortBy,
              page: pageNum,
            },
            controller.signal,
          );
          setHasMore(res.length > 0);
        }

        if (!controller.signal.aborted) {
          if (append) {
            setResults((prev) => [...prev, ...res]);
          } else {
            setResults(res);
          }
          setLoading(false);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (!controller.signal.aborted) {
          console.error("Error loading discovery grid:", err);
          setLoading(false);
        }
      }
    },
    [activeTab, mediaType, genreFilter, decadeFilter, sortBy],
  );

  // Keep ref in sync so stale closures always call the latest loadData
  useEffect(() => {
    loadDataRef.current = loadData;
  }, [loadData]);

  // Auto-load when tab, media type, or filters change
  useEffect(() => {
    setPage(1);
    loadDataRef.current(1, false);
  }, [activeTab, mediaType, genreFilter, decadeFilter, sortBy]);

  /* Load more items */
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadData(nextPage, true);
  };

  /* ── Fetch Deep Details for Selected Item ───────────────── */
  useEffect(() => {
    if (!selectedItem) return;

    const controller = new AbortController();

    getMediaDetails(
      selectedItem.tmdbId,
      selectedItem.mediaType as MediaType,
      controller.signal,
    )
      .then((data) => {
        if (!controller.signal.aborted) {
          setDetails(data);
          setLoadingDetails(false);
        }
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (!controller.signal.aborted) {
          console.error("Failed to fetch detailed info:", err);
          setLoadingDetails(false);
        }
      });

    return () => controller.abort();
  }, [selectedItem]);

  /* ── Watchlist Operations ────────────────────────────────── */
  const handleAddToWatchlist = async (
    media: TMDBSearchResult | TMDBMediaDetails,
    status: Status,
  ) => {
    const payload = {
      title: media.title,
      mediaType: (selectedItem?.mediaType as MediaType) || mediaType,
      status: status,
      favorite: false,
      genres: media.genres,
      description: media.overview || undefined,
      year: media.year || undefined,
      coverUrl: media.posterUrl || undefined,
      runtime: (media as TMDBMediaDetails).runtime || undefined,
    };

    const result = await upsertItem(payload);
    if (result.success) {
      toast.success(`Added "${media.title}" to ${status}`);
      loadWatchlist();
    } else {
      toast.error(result.error || "Failed to add to watchlist");
    }
  };

  const handleRemoveFromWatchlist = async (itemId: string) => {
    const result = await deleteItem(itemId);
    if (result.success) {
      toast.success("Removed from watchlist");
      loadWatchlist();
    } else {
      toast.error(result.error || "Failed to remove from watchlist");
    }
  };

  const handleToggleFavorite = async (itemId: string) => {
    const result = await toggleFavorite(itemId);
    if (result.success) {
      toast.success(
        result.favorite ? "Added to favorites" : "Removed from favorites",
      );
      loadWatchlist();
    } else {
      toast.error(result.error || "Failed to toggle favorite");
    }
  };

  const currentGenres = mediaType === "movie" ? MOVIE_GENRES : TV_GENRES;

  return (
    <div
      className={`w-full min-h-screen bg-tui-bg text-tui-text ${
        isRetro
          ? `retro-container ${scanlines ? "retro-scanlines" : ""}`
          : "font-sans selection:bg-violet-500/30 selection:text-white"
      } pb-16 relative`}
    >
      {/* ── CINEMATIC FULL-BLEED BACKDROP OVERLAY (Modern Theme) ── */}
      {!isRetro && spotlightItem && (
        <div className="absolute top-[-64px] left-0 w-full h-[620px] z-0 overflow-hidden pointer-events-none">
          <AnimatePresence mode="wait">
            {spotlightItem.backdropUrl && (
              <motion.div
                key={spotlightItem.backdropUrl}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 bg-cover bg-[center_top] filter brightness-[0.55] saturate-[1.15]"
                style={{ backgroundImage: `url(${spotlightItem.backdropUrl})` }}
              />
            )}
          </AnimatePresence>
          {/* Linear fade blending into body background */}
          <div className="absolute inset-0 bg-gradient-to-t from-tui-bg via-tui-bg/70 via-tui-bg/20 to-transparent" />
          {/* Horizontal left/right fade masks to focus center visual */}
          <div className="absolute inset-0 bg-gradient-to-r from-tui-bg/75 via-transparent to-tui-bg/40" />
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-[1440px] px-6 lg:px-10 pt-8">
        {/* ── HEADER NAVIGATION ─────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center border border-tui-border bg-tui-panel/40 backdrop-blur-md p-3 gap-3 mb-6 rounded-xl">
          {/* Left: Section Title */}
          <div className="flex items-center gap-3">
            <Compass className="h-5 w-5 text-tui-amber" />
            <span className="font-mono text-sm font-bold text-tui-text uppercase tracking-wider">
              DISCOVERY MODULE // EXPLORE
            </span>
          </div>

          {/* Right: Media Type selector */}
          <div
            role="radiogroup"
            aria-label="Media type"
            className="flex gap-1 bg-tui-bg/50 border border-tui-border/50 p-1 font-mono text-xs rounded-lg"
          >
            {(["movie", "tv", "anime"] as MediaType[]).map((type) => {
              const active = mediaType === type;
              const Icon =
                type === "movie" ? Film : type === "tv" ? Tv : Sparkles;
              const accentColor =
                type === "movie"
                  ? "text-tui-amber"
                  : type === "tv"
                    ? "text-tui-purple"
                    : "text-tui-green";
              const activeBorder =
                type === "movie"
                  ? "border-tui-amber"
                  : type === "tv"
                    ? "border-tui-purple"
                    : "border-tui-green";
              return (
                <button
                  key={type}
                  onClick={() => {
                    setMediaType(type);
                    setGenreFilter("");
                    setDecadeFilter("");
                    setSpotlightItems([]);
                    setLoadingSpotlight(true);
                  }}
                  className={`px-4 py-2 uppercase border transition-all flex items-center gap-1.5 rounded-lg ${
                    active
                      ? `${activeBorder} bg-tui-input text-tui-text font-bold`
                      : "border-transparent text-tui-text-muted hover:text-tui-text hover:bg-tui-input/20"
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 ${active ? accentColor : ""}`}
                  />
                  <span>{type === "tv" ? "TV Shows" : type}</span>
                </button>
              );
            })}
          </div>
        </div>

        <DiscoverySpotlight
          spotlightItem={spotlightItem}
          spotlightItems={spotlightItems}
          spotlightIdx={spotlightIdx}
          loadingSpotlight={loadingSpotlight}
          mediaType={mediaType}
          isRetro={isRetro}
          watchlistItem={getWatchlistItem(spotlightItem)}
          onSelect={handleSelectItem}
          onAdd={handleAddToWatchlist}
          onRemove={handleRemoveFromWatchlist}
        />

        {/* ── UNIFIED FILTER CONTROLLER TABS ────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-tui-border pb-4 mb-6">
          {/* Glassmorphic Sliding Pill Selector */}
          {!isRetro ? (
            <div className="flex bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-full p-1 font-mono text-[11px] relative">
              {(
                [
                  { id: "trending", label: "Trending" },
                  { id: "popular", label: "Popular" },
                  { id: "top-rated", label: "Top Rated" },
                  { id: "explorer", label: "Custom Explorer" },
                ] as { id: ListType; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-5 py-2 rounded-full uppercase tracking-wider transition-colors cursor-pointer z-10 ${
                    activeTab === tab.id
                      ? "text-zinc-950 font-bold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <span className="relative z-10">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabBg"
                      className="absolute inset-0 bg-white rounded-full z-0"
                      transition={{
                        type: "spring",
                        stiffness: 320,
                        damping: 28,
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex border border-tui-border bg-tui-bg p-0.5 font-mono text-xs">
              {(
                [
                  { id: "trending", label: "Trending" },
                  { id: "popular", label: "Popular" },
                  { id: "top-rated", label: "Top Rated" },
                  { id: "explorer", label: "Explorer" },
                ] as { id: ListType; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-1.5 uppercase transition-all ${
                    activeTab === tab.id
                      ? "bg-tui-input text-tui-amber font-bold"
                      : "text-tui-text-muted hover:text-tui-text"
                  }`}
                >
                  [ {tab.label.toUpperCase()} ]
                </button>
              ))}
            </div>
          )}

          {/* Toolbar controller for filters */}
          {activeTab === "explorer" && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 h-8 px-4 border border-tui-border bg-tui-panel font-mono text-xs text-tui-text-muted hover:border-tui-text hover:text-tui-text transition-all uppercase rounded-lg"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>{showFilters ? "HIDE FILTERS" : "SHOW FILTERS"}</span>
            </button>
          )}
        </div>

        {/* ── DYNAMIC VERTICAL GALLERY GRID ──────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-6 items-start text-left">
          {/* 1. Explorer Filter sidebar */}
          {activeTab === "explorer" && showFilters && (
            <ExplorerFilters
              genreFilter={genreFilter}
              decadeFilter={decadeFilter}
              sortBy={sortBy}
              genres={currentGenres}
              onGenreChange={(v) => setGenreFilter(v)}
              onDecadeChange={(v) => setDecadeFilter(v)}
              onSortChange={(v) => setSortBy(v)}
              onReset={() => {
                setGenreFilter("");
                setDecadeFilter("");
                setSortBy("popularity.desc");
              }}
            />
          )}

          {/* 2. Unified Grid */}
          <div className="flex-1 w-full space-y-6">
            {loading && page === 1 ? (
              <SkeletonGrid count={15} />
            ) : results.length > 0 ? (
              <div className="space-y-8">
                <motion.div
                  layout="position"
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5"
                >
                  {results.map((item, index) => (
                    <div key={item.tmdbId} className="relative">
                      {/* Top Popularity indicator chart for Tab: Popular (similar to Netflix top charts, but in the grid) */}
                      {activeTab === "popular" && (
                        <div className="absolute top-2 left-2 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-zinc-950/80 border border-white/10 text-[10px] font-mono font-bold text-tui-amber shadow-md">
                          #{index + 1}
                        </div>
                      )}

                      <MediaDiscoverCard
                        item={item}
                        isRetro={isRetro}
                        onOpen={() => handleSelectItem(item)}
                        onAdd={(status: Status) =>
                          handleAddToWatchlist(item, status)
                        }
                        onRemove={(id: string) => handleRemoveFromWatchlist(id)}
                        dbItem={getWatchlistItem(item)}
                      />
                    </div>
                  ))}
                </motion.div>

                {/* Load More (Only for paginated lists: popular, top-rated, discover) */}
                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="px-6 py-2.5 font-mono text-xs uppercase border border-tui-border bg-tui-panel text-tui-text-muted hover:border-tui-text hover:text-tui-text disabled:opacity-50 transition-all rounded-lg cursor-pointer"
                    >
                      {loading ? "[ LOADING... ]" : "[ LOAD MORE TITLES ]"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 font-mono text-xs text-tui-text-muted">
                [ NO RESULTS FOUND ]
              </div>
            )}
          </div>
        </div>
      </div>

      <DetailOverlay
        selectedItem={selectedItem}
        details={details}
        loadingDetails={loadingDetails}
        playTrailer={playTrailer}
        userRating={userRating}
        showRatingSelector={showRatingSelector}
        isRetro={isRetro}
        watchlistItem={getWatchlistItem(selectedItem)}
        onClose={() => handleSelectItem(null)}
        onRate={handleRate}
        onClearRate={handleClearRate}
        onSetPlayTrailer={setPlayTrailer}
        onSetShowRatingSelector={setShowRatingSelector}
        onAddToWatchlist={handleAddToWatchlist}
        onRemoveFromWatchlist={handleRemoveFromWatchlist}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  );
}
