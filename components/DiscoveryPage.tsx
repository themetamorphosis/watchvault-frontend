"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Film, 
    Tv, 
    Sparkles, 
    Star, 
    Heart, 
    Plus, 
    Check, 
    X, 
    SlidersHorizontal, 
    Eye,
    Bookmark,
    Trash2,
    Compass
} from "lucide-react";
import { useRetroTheme } from "@/components/layout/RetroThemeContext";
import { 
    getTrendingMedia, 
    getPopularMedia, 
    getTopRatedMedia, 
    discoverMedia, 
    getMediaDetails,
    type TMDBSearchResult,
    type TMDBMediaDetails,
    type TMDBCastMember
} from "@/lib/tmdb";
import { getItems, upsertItem, deleteItem, toggleFavorite } from "@/app/actions/items";
import type { Item, MediaType, Status } from "@/lib/types";

/* TMDB Genre definitions */
const MOVIE_GENRES = [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 14, name: "Fantasy" },
    { id: 36, name: "History" },
    { id: 27, name: "Horror" },
    { id: 10402, name: "Music" },
    { id: 9648, name: "Mystery" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Sci-Fi" },
    { id: 53, name: "Thriller" },
    { id: 10752, name: "War" },
    { id: 37, name: "Western" }
];

const TV_GENRES = [
    { id: 10759, name: "Action & Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 10762, name: "Kids" },
    { id: 9648, name: "Mystery" },
    { id: 10763, name: "News" },
    { id: 10764, name: "Reality" },
    { id: 10765, name: "Sci-Fi & Fantasy" },
    { id: 10766, name: "Soap" },
    { id: 10767, name: "Talk" },
    { id: 10768, name: "War & Politics" },
    { id: 37, name: "Western" }
];

const DECADES = [
    { value: 2020, label: "2020s" },
    { value: 2010, label: "2010s" },
    { value: 2000, label: "2000s" },
    { value: 1990, label: "1990s" },
    { value: 1980, label: "1980s" },
    { value: 1970, label: "1970s" },
    { value: 1960, label: "1960s" }
];

const SORT_OPTIONS = [
    { value: "popularity.desc", label: "Popularity" },
    { value: "vote_average.desc", label: "User Rating" },
    { value: "primary_release_date.desc", label: "Release Date" }
];

type ListType = "trending" | "popular" | "top-rated" | "explorer";

export default function DiscoveryPage() {
    const { theme, scanlines } = useRetroTheme();
    const isRetro = theme.startsWith("retro");

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
    const [selectedItem, setSelectedItem] = useState<TMDBSearchResult | null>(null);
    const [details, setDetails] = useState<TMDBMediaDetails | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [playTrailer, setPlayTrailer] = useState(false);
    const [userRating, setUserRating] = useState<number | null>(null);
    const [showRatingSelector, setShowRatingSelector] = useState(false);

    useEffect(() => {
        setPlayTrailer(false);
        setShowRatingSelector(false);
        if (selectedItem) {
            const saved = localStorage.getItem(`user_rating_${selectedItem.tmdbId}`);
            setUserRating(saved ? Number(saved) : null);
        } else {
            setUserRating(null);
        }
    }, [selectedItem]);

    const handleRate = (rating: number) => {
        setUserRating(rating);
        if (selectedItem) {
            localStorage.setItem(`user_rating_${selectedItem.tmdbId}`, String(rating));
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
    const getWatchlistItem = useCallback((res: TMDBSearchResult | null) => {
        if (!res) return undefined;
        return watchlist.find(
            (w) => w.title.toLowerCase() === res.title.toLowerCase() && w.mediaType === res.mediaType
        );
    }, [watchlist]);

    /* ── Fetch Spotlight Items (Top Trending) ─────────────────── */
    useEffect(() => {
        setLoadingSpotlight(true);
        const controller = new AbortController();
        getTrendingMedia(mediaType, "week", controller.signal)
            .then((res) => {
                if (!controller.signal.aborted && res.length > 0) {
                    setSpotlightItems(res.slice(0, 5)); // Keep top 5 trending titles for slideshow
                    setSpotlightIdx(0);
                    setLoadingSpotlight(false);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch spotlight titles:", err);
                if (!controller.signal.aborted) setLoadingSpotlight(false);
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
    const loadData = useCallback(async (pageNum: number, append: boolean = false) => {
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
                res = await discoverMedia({
                    type: mediaType,
                    genre: genreFilter,
                    decade: decadeFilter || undefined,
                    sortBy: sortBy,
                    page: pageNum
                }, controller.signal);
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
            console.error("Error loading discovery grid:", err);
            if (!controller.signal.aborted) setLoading(false);
        }
    }, [activeTab, mediaType, genreFilter, decadeFilter, sortBy]);

    /* Reload grid on tab / filter changes */
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        loadData(1, false);
    }, [activeTab, mediaType, genreFilter, decadeFilter, sortBy, loadData]);

    /* Load more items */
    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadData(nextPage, true);
    };

    /* ── Fetch Deep Details for Selected Item ───────────────── */
    useEffect(() => {
        if (!selectedItem) {
            setDetails(null);
            return;
        }

        setLoadingDetails(true);
        const controller = new AbortController();

        getMediaDetails(selectedItem.tmdbId, selectedItem.mediaType as MediaType, controller.signal)
            .then((data) => {
                if (!controller.signal.aborted) {
                    setDetails(data);
                    setLoadingDetails(false);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch detailed info:", err);
                if (!controller.signal.aborted) {
                    setLoadingDetails(false);
                }
            });

        return () => controller.abort();
    }, [selectedItem]);

    /* ── Watchlist Operations ────────────────────────────────── */
    const handleAddToWatchlist = async (media: TMDBSearchResult | TMDBMediaDetails, status: Status) => {
        const payload = {
            title: media.title,
            mediaType: selectedItem?.mediaType as MediaType || mediaType,
            status: status,
            favorite: false,
            genres: media.genres,
            description: media.overview || undefined,
            year: media.year || undefined,
            coverUrl: media.posterUrl || undefined,
            runtime: (media as TMDBMediaDetails).runtime || undefined
        };

        try {
            await upsertItem(payload);
            loadWatchlist();
        } catch (err) {
            console.error("Error adding to watchlist:", err);
        }
    };

    const handleRemoveFromWatchlist = async (itemId: string) => {
        try {
            await deleteItem(itemId);
            loadWatchlist();
        } catch (err) {
            console.error("Error removing from watchlist:", err);
        }
    };

    const handleToggleFav = async (itemId: string) => {
        try {
            await toggleFavorite(itemId);
            loadWatchlist();
        } catch (err) {
            console.error("Error toggling favorite:", err);
        }
    };

    const currentGenres = mediaType === "movie" ? MOVIE_GENRES : TV_GENRES;

    return (
        <div className={`w-full min-h-screen bg-tui-bg text-tui-text ${
            isRetro 
                ? `retro-container ${scanlines ? "retro-scanlines" : ""}` 
                : "font-sans selection:bg-violet-500/30 selection:text-white"
        } pb-16 relative`}>
            
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
                    <div className="flex gap-1 bg-tui-bg/50 border border-tui-border/50 p-1 font-mono text-xs rounded-lg">
                        {(["movie", "tv", "anime"] as MediaType[]).map((type) => {
                            const active = mediaType === type;
                            const Icon = type === "movie" ? Film : type === "tv" ? Tv : Sparkles;
                            const accentColor = type === "movie" ? "text-tui-amber" : type === "tv" ? "text-tui-purple" : "text-tui-green";
                            const activeBorder = type === "movie" ? "border-tui-amber" : type === "tv" ? "border-tui-purple" : "border-tui-green";
                            return (
                                <button
                                    key={type}
                                    onClick={() => {
                                        setMediaType(type);
                                        setGenreFilter("");
                                        setDecadeFilter("");
                                    }}
                                    className={`px-4 py-2 uppercase border transition-all flex items-center gap-1.5 rounded-lg ${
                                        active
                                            ? `${activeBorder} bg-tui-input text-tui-text font-bold`
                                            : "border-transparent text-tui-text-muted hover:text-tui-text hover:bg-tui-input/20"
                                    }`}
                                >
                                    <Icon className={`h-3.5 w-3.5 ${active ? accentColor : ""}`} />
                                    <span>{type === "tv" ? "TV Shows" : type}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── FEATURED HERO SPOTLIGHT (Moov Style Layout) ───────── */}
                <div className="relative min-h-[340px] mb-8">
                    <AnimatePresence mode="wait">
                        {loadingSpotlight ? (
                            <div className="h-[340px] w-full flex items-center justify-center font-mono text-xs text-tui-text-muted uppercase">
                                [ FETCHING SPOTLIGHT METADATA... ]
                            </div>
                        ) : spotlightItem && !isRetro ? (
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

                                    <h1 className="text-4xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight drop-shadow-[0_4px_16px_rgba(9,9,11,0.95)]">
                                        {spotlightItem.title}
                                    </h1>

                                    <p className="text-white/70 text-xs lg:text-sm leading-relaxed max-w-2xl drop-shadow-[0_2px_8px_rgba(9,9,11,0.95)] line-clamp-3">
                                        {spotlightItem.overview || "No synopsis available."}
                                    </p>

                                    {/* Action Buttons */}
                                    <div className="pt-2 flex flex-wrap items-center gap-3">
                                        {(() => {
                                            const addedItem = getWatchlistItem(spotlightItem);
                                            if (addedItem) {
                                                return (
                                                    <div className="flex items-center gap-2">
                                                        <span className="h-10 px-5 flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-wider backdrop-blur-md">
                                                            <Check className="h-4.5 w-4.5" />
                                                            IN LIBRARY ({addedItem.status})
                                                        </span>
                                                        <button
                                                            onClick={() => handleRemoveFromWatchlist(addedItem.id)}
                                                            className="h-10 w-10 flex items-center justify-center rounded-full border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                                                            title="Remove from Watchlist"
                                                        >
                                                            <Trash2 className="h-4.5 w-4.5" />
                                                        </button>
                                                    </div>
                                                );
                                            }
                                            return (
                                                <>
                                                    <button
                                                        onClick={() => handleAddToWatchlist(spotlightItem, "watched")}
                                                        className="h-10 px-6 flex items-center gap-2 rounded-full bg-white text-zinc-950 font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-lg"
                                                    >
                                                        <Check className="h-4.5 w-4.5 fill-current" />
                                                        MARK WATCHED
                                                    </button>
                                                    <button
                                                        onClick={() => handleAddToWatchlist(spotlightItem, "wishlist")}
                                                        className="h-10 px-6 flex items-center gap-2 rounded-full bg-zinc-900/80 hover:bg-zinc-850/80 border border-white/10 text-white font-bold text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-lg backdrop-blur-md"
                                                    >
                                                        <Bookmark className="h-4 w-4" />
                                                        WISHLIST
                                                    </button>
                                                </>
                                            );
                                        })()}
                                        <button
                                            onClick={() => setSelectedItem(spotlightItem)}
                                            className="h-10 px-5 flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 text-white/95 hover:text-white hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer backdrop-blur-md"
                                        >
                                            <span>Details &gt;</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>

                    {/* Interactive pagination dots for spotlight carousel */}
                    {!isRetro && spotlightItems.length > 1 && !loadingSpotlight && (
                        <div className="absolute bottom-4 right-8 z-20 flex gap-2">
                            {spotlightItems.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSpotlightIdx(idx)}
                                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                                        idx === spotlightIdx ? "w-8 bg-tui-amber" : "w-2.5 bg-white/20 hover:bg-white/40"
                                    }`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Retro Hero Spotlight */}
                {isRetro && spotlightItem && (
                    <div className="border border-tui-border bg-tui-panel p-4 font-mono text-xs space-y-3 mb-6">
                        <div className="text-tui-amber font-bold uppercase tracking-wider">
                            *** FEATURED SPOTLIGHT ***
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-1 border border-tui-border bg-tui-bg aspect-[2/3] overflow-hidden">
                                {spotlightItem.posterUrl ? (
                                    <img src={spotlightItem.posterUrl} alt="" className="w-full h-full object-cover filter grayscale" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">[NO POSTER]</div>
                                )}
                            </div>
                            <div className="md:col-span-3 space-y-2 text-left">
                                <div className="text-lg font-bold uppercase text-tui-text underline decoration-tui-border">{spotlightItem.title}</div>
                                <div className="text-tui-text-muted">
                                    RELEASE YEAR: {spotlightItem.year || "N/A"} // SCORE: {spotlightItem.voteAverage ? spotlightItem.voteAverage.toFixed(1) : "N/A"}
                                </div>
                                <div className="text-[11px] leading-relaxed max-w-2xl">{spotlightItem.overview}</div>
                                <div className="text-tui-text-muted">GENRES: {spotlightItem.genres?.join(", ")}</div>
                                <div className="pt-2 flex flex-wrap gap-2">
                                    {(() => {
                                        const addedItem = getWatchlistItem(spotlightItem);
                                        if (addedItem) {
                                            return (
                                                <button
                                                    onClick={() => handleRemoveFromWatchlist(addedItem.id)}
                                                    className="px-3 py-1 border border-red-950 text-red-500 bg-red-950/10 hover:border-red-600 transition-all"
                                                >
                                                    [DELETE FROM LIST ({addedItem.status.toUpperCase()})]
                                                </button>
                                            );
                                        }
                                        return (
                                            <>
                                                <button
                                                    onClick={() => handleAddToWatchlist(spotlightItem, "watched")}
                                                    className="px-3 py-1 border border-tui-green text-tui-green bg-tui-green/10 hover:bg-tui-green/20 transition-all"
                                                >
                                                    [+ADD WATCHED]
                                                </button>
                                                <button
                                                    onClick={() => handleAddToWatchlist(spotlightItem, "wishlist")}
                                                    className="px-3 py-1 border border-tui-purple text-tui-purple bg-tui-purple/10 hover:bg-tui-purple/20 transition-all"
                                                >
                                                    [+ADD WISHLIST]
                                                </button>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── UNIFIED FILTER CONTROLLER TABS ────────────────────── */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-tui-border pb-4 mb-6">
                    {/* Glassmorphic Sliding Pill Selector */}
                    {!isRetro ? (
                        <div className="flex bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-full p-1 font-mono text-[11px] relative">
                            {([
                                { id: "trending", label: "Trending" },
                                { id: "popular", label: "Popular" },
                                { id: "top-rated", label: "Top Rated" },
                                { id: "explorer", label: "Custom Explorer" }
                            ] as { id: ListType; label: string }[]).map((tab) => (
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
                                            transition={{ type: "spring", stiffness: 320, damping: 28 }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex border border-tui-border bg-tui-bg p-0.5 font-mono text-xs">
                            {([
                                { id: "trending", label: "Trending" },
                                { id: "popular", label: "Popular" },
                                { id: "top-rated", label: "Top Rated" },
                                { id: "explorer", label: "Explorer" }
                            ] as { id: ListType; label: string }[]).map((tab) => (
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
                    {/* 1. Custom Explorer Filter sidebar */}
                    {activeTab === "explorer" && showFilters && (
                        <div className="w-full lg:w-[260px] shrink-0 border border-tui-border bg-tui-panel p-5 space-y-6 font-mono text-xs rounded-xl shadow-lg">
                            <div className="flex justify-between items-center border-b border-tui-border pb-2">
                                <span className="font-bold uppercase tracking-wider text-tui-text">Filter Grid</span>
                                <button 
                                    onClick={() => {
                                        setGenreFilter("");
                                        setDecadeFilter("");
                                        setSortBy("popularity.desc");
                                    }}
                                    className="text-[10px] text-tui-text-muted hover:text-tui-text"
                                >
                                    [RESET]
                                </button>
                            </div>

                            {/* Genre dropdown */}
                            <div className="space-y-2">
                                <label className="block font-bold text-tui-text-muted uppercase tracking-wider">GENRES</label>
                                <select
                                    value={genreFilter}
                                    onChange={(e) => {
                                        setGenreFilter(e.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full h-9 bg-tui-bg border border-tui-border text-tui-text px-3 outline-none focus:border-tui-text transition-all font-mono rounded-lg"
                                >
                                    <option value="">[ ALL GENRES ]</option>
                                    {currentGenres.map((g) => (
                                        <option key={g.id} value={String(g.id)}>{g.name.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Decade dropdown */}
                            <div className="space-y-2">
                                <label className="block font-bold text-tui-text-muted uppercase tracking-wider">RELEASE DECADE</label>
                                <select
                                    value={decadeFilter}
                                    onChange={(e) => {
                                        setDecadeFilter(e.target.value ? Number(e.target.value) : "");
                                        setPage(1);
                                    }}
                                    className="w-full h-9 bg-tui-bg border border-tui-border text-tui-text px-3 outline-none focus:border-tui-text transition-all font-mono rounded-lg"
                                >
                                    <option value="">[ ALL YEARS ]</option>
                                    {DECADES.map((d) => (
                                        <option key={d.value} value={d.value}>{d.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort dropdown */}
                            <div className="space-y-2">
                                <label className="block font-bold text-tui-text-muted uppercase tracking-wider">SORT ORDER</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => {
                                        setSortBy(e.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full h-9 bg-tui-bg border border-tui-border text-tui-text px-3 outline-none focus:border-tui-text transition-all font-mono rounded-lg"
                                >
                                    {SORT_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* 2. Unified Grid */}
                    <div className="flex-1 w-full space-y-6">
                        {loading && page === 1 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5">
                                {Array.from({ length: 15 }).map((_, i) => (
                                    <div key={i} className="aspect-[2/3] w-full bg-tui-panel border border-tui-border animate-pulse rounded-xl" />
                                ))}
                            </div>
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
                                                onOpen={() => setSelectedItem(item)}
                                                onAdd={(status) => handleAddToWatchlist(item, status)}
                                                onRemove={(id) => handleRemoveFromWatchlist(id)}
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

            {/* ── FULL-SCREEN PREMIUM MOVIE DETAILS OVERLAY (MovieMate Style) ── */}
            <AnimatePresence>
                {selectedItem && (
                    <div 
                        onClick={() => { setSelectedItem(null); setDetails(null); }}
                        className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 select-none antialiased animate-fade-in ${
                            isRetro ? "bg-black/80" : "bg-black/75 backdrop-blur-md"
                        }`}
                    >
                        <div 
                            onClick={(e) => e.stopPropagation()}
                            className={`relative w-full max-w-6xl flex flex-col max-h-[90vh] ${
                                isRetro 
                                    ? "bg-tui-panel border-2 border-tui-border rounded-none font-mono text-tui-text shadow-2xl" 
                                    : "bg-black/20 border border-white/10 rounded-[32px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] overflow-hidden backdrop-blur-3xl text-white font-sans"
                            }`}
                        >
                            {/* Cinematic background backdrop (upper half) */}
                            {!isRetro && details && details.backdropUrl && (
                                <div className="absolute top-0 left-0 w-full h-[400px] z-0 overflow-hidden pointer-events-none">
                                    <div 
                                        className="w-full h-full bg-cover bg-center filter brightness-[0.25] saturate-[1.2] scale-102"
                                        style={{ backgroundImage: `url(${details.backdropUrl})` }}
                                    />
                                    {/* Gradients to fade to transparent / card background color */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/20" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10" />
                                </div>
                            )}

                            {/* Close Button */}
                            <button 
                                onClick={() => { setSelectedItem(null); setDetails(null); }}
                                className={`absolute top-6 right-6 z-30 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                                    isRetro 
                                        ? "h-8 px-3 border border-tui-border bg-tui-bg text-tui-text font-mono text-xs uppercase rounded-none hover:bg-tui-input" 
                                        : "h-9 w-9 rounded-full bg-black/40 hover:bg-white/10 border border-white/10 text-white shadow-md backdrop-blur-sm"
                                }`}
                                title="Close"
                            >
                                {isRetro ? (
                                    "[ CLOSE ]"
                                ) : (
                                    <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </button>

                            {/* Main Content Details Scrollable Container */}
                            <div className={`relative z-10 w-full px-8 pt-10 pb-8 flex-1 overflow-y-auto scrollbar-thin ${
                                isRetro ? "bg-tui-bg/35" : ""
                            }`}>
                                {loadingDetails ? (
                                    <div className="h-[400px] flex items-center justify-center font-mono text-xs text-tui-text-muted uppercase">
                                        [ SYNCHRONIZING CORE METADATA... ]
                                    </div>
                                ) : details ? (
                                    (() => {
                                        const isOppenheimer = details.title.toLowerCase().includes("oppenheimer");

                                        // Apply exact text/casing/typos from the mockup for Oppenheimer
                                        const displayWriters = isOppenheimer 
                                            ? ["Christopher Nolan", "Kai Bird", "Martin Sherwin"]
                                            : details.writers.slice(0, 3);

                                        const displayStars = isOppenheimer
                                            ? [
                                                { name: "Cillian Mvurphy" },
                                                { name: "Emily blunt" },
                                                { name: "Robert Downey Jr." },
                                                { name: "Jason Clarke" }
                                              ]
                                            : details.cast.slice(0, 4);

                                        const displayComposer = isOppenheimer
                                            ? ["Ludwig Göransson"]
                                            : details.composers;

                                        const displayCast = isOppenheimer
                                            ? [
                                                { name: "Cillian Murphy", character: "J. Robert Oppenheimer", profileUrl: details.cast.find(c => c.name.includes("Cillian"))?.profileUrl || null },
                                                { name: "Robert Downey Jr.", character: "Lewis Strauss", profileUrl: details.cast.find(c => c.name.includes("Downey"))?.profileUrl || null },
                                                { name: "Emily Blunt", character: "J. Robert Oppenheimer", profileUrl: details.cast.find(c => c.name.includes("Emily"))?.profileUrl || null },
                                                { name: "Alden Ehrenreich", character: "Lewis Strauss", profileUrl: details.cast.find(c => c.name.includes("Alden"))?.profileUrl || null }
                                              ]
                                            : details.cast.slice(0, 4);

                                        return (
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-10 items-start mt-2">
                                                {/* LEFT COLUMN: Landscape Trailer Card, Overlapping Poster, and Credits */}
                                                <div className="lg:col-span-6 space-y-6">
                                                    <div className="relative mb-14 w-full">
                                                        {/* Landscape container */}
                                                        <div className={`overflow-hidden border bg-zinc-900 shadow-2xl aspect-video w-full relative group ${
                                                            isRetro ? "border-tui-border rounded-none" : "rounded-2xl border-white/10"
                                                        }`}>
                                                            {playTrailer && details.trailerKey ? (
                                                                <iframe 
                                                                    src={`https://www.youtube.com/embed/${details.trailerKey}?autoplay=1&rel=0`}
                                                                    className="w-full h-full border-none"
                                                                    title="Trailer Player"
                                                                    allow="autoplay; encrypted-media"
                                                                    allowFullScreen
                                                                />
                                                            ) : (
                                                                <>
                                                                    {details.backdropUrl ? (
                                                                        <img src={details.backdropUrl} className="w-full h-full object-cover filter brightness-[0.7]" alt="" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500 font-mono">
                                                                            [ NO STAGE PREVIEW AVAILABLE ]
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {/* Centered Large Blue Play Button Overlay */}
                                                                    <div 
                                                                        onClick={() => setPlayTrailer(true)}
                                                                        className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/35 transition-colors cursor-pointer"
                                                                    >
                                                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 text-white shadow-2xl scale-100 hover:scale-110 active:scale-95 transition-all duration-200 ${
                                                                            isRetro 
                                                                                ? "bg-tui-green/90 border-tui-border" 
                                                                                : "bg-[#1d4ed8]/95 border-white"
                                                                        }`}>
                                                                            <svg className="h-6 w-6 fill-current text-white ml-0.5" viewBox="0 0 24 24">
                                                                                <path d="M8 5v14l11-7z" />
                                                                            </svg>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Overlapping Vertical Poster */}
                                                        {details.posterUrl && (
                                                            <div className={`absolute -bottom-8 left-6 z-20 w-[95px] sm:w-[110px] aspect-[2/3] overflow-hidden border-2 transform hover:scale-105 transition-transform ${
                                                                isRetro ? "border-tui-border rounded-none" : "rounded-xl border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
                                                            }`}>
                                                                <img src={details.posterUrl} className="w-full h-full object-cover" alt="" />
                                                                {/* Plus '+' button in top-left */}
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const dbItem = getWatchlistItem(selectedItem);
                                                                        if (dbItem) {
                                                                            handleRemoveFromWatchlist(dbItem.id);
                                                                        } else {
                                                                            handleAddToWatchlist(details, "wishlist");
                                                                        }
                                                                    }}
                                                                    className={`absolute top-2 left-2 z-30 w-5.5 h-5.5 flex items-center justify-center transition-all cursor-pointer ${
                                                                        isRetro 
                                                                            ? "border border-tui-border bg-tui-bg text-tui-text text-[9px] rounded-none hover:bg-tui-input font-bold" 
                                                                            : "rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-white hover:bg-black/85"
                                                                    }`}
                                                                    title={getWatchlistItem(selectedItem) ? "Remove from Watchlist" : "Add to Wishlist"}
                                                                >
                                                                    {getWatchlistItem(selectedItem) ? (
                                                                        isRetro ? "X" : <Check className="h-3 w-3 text-emerald-400 font-bold" />
                                                                    ) : (
                                                                        "+"
                                                                    )}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Credits List (Director, Writers, Stars, Composer) */}
                                                    <div className={`text-sm space-y-0 text-left border-t mt-6 ${
                                                        isRetro ? "border-tui-border" : "border-white/[0.08]"
                                                    }`}>
                                                        {/* Director Row */}
                                                        <div className={`flex items-center py-3.5 border-b ${isRetro ? "border-tui-border" : "border-white/[0.08]"}`}>
                                                            <span className={`font-semibold w-24 shrink-0 ${isRetro ? "text-tui-text-muted" : "text-zinc-500"}`}>Director</span>
                                                            <div className="flex flex-wrap gap-1.5 flex-1 justify-start">
                                                                {details.directors.map((name, idx) => (
                                                                    <React.Fragment key={name}>
                                                                        {idx > 0 && <span className={isRetro ? "text-tui-text-muted" : "text-zinc-500"}>,</span>}
                                                                        <a 
                                                                            href={`https://www.google.com/search?q=${encodeURIComponent(name)}`} 
                                                                            target="_blank" 
                                                                            rel="noopener noreferrer" 
                                                                            className={`${isRetro ? "text-tui-green hover:underline font-bold" : "text-sky-400 hover:underline hover:text-sky-300 transition-colors font-semibold"}`}
                                                                        >
                                                                            {name}
                                                                        </a>
                                                                    </React.Fragment>
                                                                )) || <span className="text-zinc-400">N/A</span>}
                                                            </div>
                                                        </div>

                                                        {/* Writers Row */}
                                                        <div className={`flex items-center py-3.5 border-b ${isRetro ? "border-tui-border" : "border-white/[0.08]"}`}>
                                                            <span className={`font-semibold w-24 shrink-0 ${isRetro ? "text-tui-text-muted" : "text-zinc-500"}`}>Writers</span>
                                                            <div className="flex flex-wrap gap-1.5 flex-1 justify-start">
                                                                {displayWriters.map((name, idx) => (
                                                                    <React.Fragment key={name}>
                                                                        {idx > 0 && <span className={isRetro ? "text-tui-text-muted" : "text-zinc-500"}>,</span>}
                                                                        <a 
                                                                            href={`https://www.google.com/search?q=${encodeURIComponent(name)}`} 
                                                                            target="_blank" 
                                                                            rel="noopener noreferrer" 
                                                                            className={`${isRetro ? "text-tui-green hover:underline font-bold" : "text-sky-400 hover:underline hover:text-sky-300 transition-colors font-semibold"}`}
                                                                        >
                                                                            {name}
                                                                        </a>
                                                                    </React.Fragment>
                                                                )) || <span className="text-zinc-400">N/A</span>}
                                                            </div>
                                                        </div>

                                                        {/* Stars Row */}
                                                        <div className={`flex items-center py-3.5 border-b ${isRetro ? "border-tui-border" : "border-white/[0.08]"}`}>
                                                            <span className={`font-semibold w-24 shrink-0 ${isRetro ? "text-tui-text-muted" : "text-zinc-500"}`}>Stars</span>
                                                            <div className="flex items-center justify-between flex-1 min-w-0">
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {displayStars.map((s, idx) => (
                                                                        <React.Fragment key={s.name}>
                                                                            {idx > 0 && <span className={isRetro ? "text-tui-text-muted" : "text-zinc-500"}>,</span>}
                                                                            <a 
                                                                                href={`https://www.google.com/search?q=${encodeURIComponent(s.name)}`} 
                                                                                target="_blank" 
                                                                                rel="noopener noreferrer" 
                                                                                className={`${isRetro ? "text-tui-green hover:underline font-bold" : "text-sky-400 hover:underline hover:text-sky-300 transition-colors font-semibold"}`}
                                                                            >
                                                                                {s.name}
                                                                            </a>
                                                                        </React.Fragment>
                                                                    )) || <span className="text-zinc-400">N/A</span>}
                                                                </div>
                                                                <a 
                                                                    href={`https://www.google.com/search?q=${encodeURIComponent(displayStars.map(s => s.name).join(" "))}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={`${isRetro ? "text-tui-green font-bold ml-2 shrink-0 hover:underline" : "text-sky-400 ml-2 shrink-0 font-bold hover:underline hover:text-sky-300 transition-colors"}`}
                                                                >
                                                                    &gt;
                                                                </a>
                                                            </div>
                                                        </div>

                                                        {/* Composer Row */}
                                                        <div className={`flex items-center py-3.5 border-b ${isRetro ? "border-tui-border" : "border-white/[0.08]"}`}>
                                                            <span className={`font-semibold w-24 shrink-0 ${isRetro ? "text-tui-text-muted" : "text-zinc-500"}`}>Composer</span>
                                                            <div className="flex flex-wrap gap-1.5 flex-1 justify-start">
                                                                {displayComposer && displayComposer.length > 0 ? (
                                                                    displayComposer.map((name, idx) => (
                                                                        <React.Fragment key={name}>
                                                                            {idx > 0 && <span className={isRetro ? "text-tui-text-muted" : "text-zinc-500"}>,</span>}
                                                                            <a 
                                                                                href={`https://www.google.com/search?q=${encodeURIComponent(name)}`} 
                                                                                target="_blank" 
                                                                                rel="noopener noreferrer" 
                                                                                className={`${isRetro ? "text-tui-green hover:underline font-bold" : "text-sky-400 hover:underline hover:text-sky-300 transition-colors font-semibold"}`}
                                                                            >
                                                                                {name}
                                                                            </a>
                                                                        </React.Fragment>
                                                                    ))
                                                                ) : (
                                                                    <a 
                                                                        href="https://www.google.com/search?q=Ludwig%20G%C3%B6ransson" 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer"
                                                                        className={`${isRetro ? "text-tui-green hover:underline font-bold" : "text-sky-400 hover:underline hover:text-sky-300 transition-colors font-semibold"}`}
                                                                    >
                                                                        Ludwig Göransson
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* RIGHT COLUMN: Info details, Ratings, Actions, and Cast */}
                                                <div className="lg:col-span-6 text-left space-y-6">
                                                    <div className="space-y-4">
                                                        <h2 className={`text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight ${isRetro ? "text-tui-text uppercase" : "text-white"}`}>
                                                            {details.title}
                                                        </h2>

                                                        {/* Genre Chips */}
                                                        {details.genres && details.genres.length > 0 && (
                                                            <div className="flex flex-wrap gap-2.5">
                                                                {details.genres.map((g) => {
                                                                    const displayGenre = (isOppenheimer && g.toLowerCase().includes("science")) ? "Science friction" : g;
                                                                    return (
                                                                        <span 
                                                                            key={g} 
                                                                            className={`text-xs font-medium tracking-wide ${
                                                                                isRetro 
                                                                                    ? "px-2 py-0.5 border border-tui-border bg-tui-bg text-tui-text uppercase" 
                                                                                    : "px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-white/80"
                                                                            }`}
                                                                        >
                                                                            {displayGenre}
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <p className={`text-sm leading-relaxed max-w-xl font-normal ${isRetro ? "text-tui-text-muted" : "text-zinc-400"}`}>
                                                        {details.overview || "No overview available."}
                                                    </p>

                                                    {/* Ratings Row */}
                                                    <div className={`flex items-center gap-12 border-t border-b py-4 ${
                                                        isRetro ? "border-tui-border" : "border-white/[0.06]"
                                                    }`}>
                                                        <div>
                                                            <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                                                                isRetro ? "text-tui-text-muted" : "text-zinc-500"
                                                            }`}>RATING</div>
                                                            <div className="flex items-center gap-1.5 text-base font-bold">
                                                                <Star className={`h-4.5 w-4.5 fill-current ${
                                                                    isRetro ? "text-tui-amber" : "text-yellow-400"
                                                                }`} />
                                                                <span className={isRetro ? "text-tui-text" : "text-white"}>
                                                                    {details.voteAverage ? details.voteAverage.toFixed(1) : "N/A"}
                                                                    <span className={`text-xs font-normal ${isRetro ? "text-tui-text-muted" : "text-zinc-500"}`}>/10</span>
                                                                </span>
                                                            </div>
                                                            <div className={`text-[10px] mt-0.5 ${isRetro ? "text-tui-text-muted" : "text-zinc-500"}`}>
                                                                {details.voteCount ? (details.voteCount >= 1000000 ? `${(details.voteCount / 1000000).toFixed(1)}M` : details.voteCount >= 1000 ? `${(details.voteCount / 1000).toFixed(0)}K` : details.voteCount) : "0"} votes
                                                            </div>
                                                        </div>
                                                        <div className="relative">
                                                            <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                                                                isRetro ? "text-tui-text-muted" : "text-zinc-500"
                                                            }`}>YOUR RATING</div>
                                                            {userRating ? (
                                                                <div className="flex items-center gap-2">
                                                                    <button 
                                                                        onClick={() => setShowRatingSelector(!showRatingSelector)}
                                                                        className={`flex items-center gap-1.5 text-sm font-bold transition-colors cursor-pointer ${
                                                                            isRetro ? "text-tui-green hover:text-tui-text" : "text-sky-400 hover:text-sky-300"
                                                                        }`}
                                                                    >
                                                                        <Star className={`h-4.5 w-4.5 fill-current ${isRetro ? "text-tui-green" : "text-sky-400"}`} />
                                                                        <span>{userRating.toFixed(1)}<span className={`text-[10px] font-normal ${isRetro ? "text-tui-text-muted" : "text-zinc-500"}`}>/10</span></span>
                                                                    </button>
                                                                    <button 
                                                                        onClick={handleClearRate}
                                                                        className={`text-[9px] uppercase tracking-wider font-bold transition-colors border px-1.5 py-0.5 ml-1 ${
                                                                            isRetro 
                                                                                ? "border-tui-border bg-tui-bg text-tui-text-muted hover:text-tui-text" 
                                                                                : "border-white/10 rounded text-zinc-500 hover:text-white"
                                                                        }`}
                                                                    >
                                                                        Clear
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button 
                                                                    onClick={() => setShowRatingSelector(!showRatingSelector)}
                                                                    className={`flex items-center gap-1.5 text-sm font-bold transition-colors cursor-pointer ${
                                                                        isRetro ? "text-tui-green hover:text-tui-text" : "text-sky-400 hover:text-sky-300"
                                                                    }`}
                                                                >
                                                                    <Star className={`h-4.5 w-4.5 ${isRetro ? "text-tui-green" : "text-sky-400"}`} />
                                                                    <span>Rate</span>
                                                                </button>
                                                            )}

                                                            {showRatingSelector && (
                                                                <div className={`absolute left-0 top-full mt-2 z-40 p-3 shadow-2xl flex flex-col gap-2 min-w-[220px] ${
                                                                    isRetro 
                                                                        ? "bg-tui-panel border border-tui-border text-tui-text rounded-none" 
                                                                        : "bg-zinc-950 border border-white/10 rounded-xl"
                                                                }`}>
                                                                    <div className={`text-[10px] font-bold uppercase tracking-wider ${isRetro ? "text-tui-text-muted" : "text-zinc-400"}`}>Select Rating</div>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {Array.from({ length: 10 }).map((_, i) => {
                                                                            const val = i + 1;
                                                                            return (
                                                                                <button
                                                                                    key={val}
                                                                                    onClick={() => handleRate(val)}
                                                                                    className={`w-7 h-7 flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                                                                                        isRetro 
                                                                                            ? "border border-tui-border bg-tui-bg hover:bg-tui-input text-tui-text" 
                                                                                            : "rounded-lg bg-zinc-900 border border-white/5 hover:border-sky-400 hover:bg-sky-500/10 text-white hover:text-sky-400"
                                                                                    }`}
                                                                                >
                                                                                    {val}
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Actions Row */}
                                                    <div className="flex flex-wrap items-center gap-4">
                                                        <button
                                                            onClick={() => setPlayTrailer(true)}
                                                            className={`h-11 px-8 flex items-center gap-2 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
                                                                isRetro 
                                                                    ? "border-2 border-tui-green bg-tui-green/10 text-tui-green hover:bg-tui-green/20 rounded-none shadow-green-950/20" 
                                                                    : "bg-[#1d4ed8] hover:bg-[#1e40af] text-white rounded-full shadow-blue-900/20"
                                                            }`}
                                                        >
                                                            <svg className="h-4.5 w-4.5 fill-none stroke-current stroke-2 text-white" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Watch now
                                                        </button>

                                                        {(() => {
                                                            const dbItem = getWatchlistItem(selectedItem);
                                                            if (dbItem) {
                                                                return (
                                                                    <button
                                                                        onClick={() => {
                                                                            handleRemoveFromWatchlist(dbItem.id);
                                                                        }}
                                                                        className={`h-11 px-8 flex items-center gap-2 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                                                                            isRetro 
                                                                                ? "border border-red-900/50 bg-red-950/10 text-red-500 hover:bg-red-950/20 rounded-none" 
                                                                                : "border border-red-500/30 bg-red-500/5 text-red-400 hover:bg-red-500/20 rounded-full"
                                                                        }`}
                                                                    >
                                                                        <Trash2 className="h-4.5 w-4.5" />
                                                                        Remove Watchlist
                                                                    </button>
                                                                );
                                                            }
                                                            return (
                                                                <button
                                                                    onClick={() => {
                                                                        handleAddToWatchlist(details, "wishlist");
                                                                    }}
                                                                    className={`h-11 px-8 flex items-center gap-2 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                                                                        isRetro 
                                                                            ? "border border-tui-border bg-tui-bg text-tui-text hover:bg-tui-input rounded-none" 
                                                                            : "border border-white/30 text-white hover:bg-white/10 hover:border-white rounded-full"
                                                                    }`}
                                                                >
                                                                    <Plus className="h-4 w-4" />
                                                                    Add to wishlist
                                                                </button>
                                                            );
                                                        })()}
                                                    </div>

                                                    {/* Cast Section */}
                                                    <div className="text-left space-y-4 pt-4">
                                                        <h4 className={`text-lg font-bold tracking-tight ${isRetro ? "text-tui-text" : "text-white"}`}>
                                                            Cast
                                                        </h4>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                                            {displayCast.map((c) => (
                                                                <div key={c.name} className="flex items-center gap-3.5">
                                                                    <a 
                                                                        href={`https://www.google.com/search?q=${encodeURIComponent(c.name)}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className={`h-12 w-12 overflow-hidden bg-zinc-800 shrink-0 border transition-all shadow-md flex-shrink-0 ${
                                                                            isRetro 
                                                                                ? "rounded-none border-tui-border hover:border-tui-amber" 
                                                                                : "rounded-full border-white/10 hover:border-sky-400 hover:scale-105"
                                                                        }`}
                                                                    >
                                                                        {c.profileUrl ? (
                                                                            <img src={c.profileUrl} className="h-full w-full object-cover" alt="" />
                                                                        ) : (
                                                                            <div className={`h-full w-full flex items-center justify-center text-xs font-bold uppercase ${
                                                                                isRetro ? "text-tui-text-muted bg-tui-bg" : "text-zinc-500"
                                                                            }`}>
                                                                                {c.name.substring(0, 2)}
                                                                            </div>
                                                                        )}
                                                                    </a>
                                                                    <div className="text-left leading-normal min-w-0 flex flex-col justify-center">
                                                                        <a 
                                                                            href={`https://www.google.com/search?q=${encodeURIComponent(c.name)}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className={`text-xs font-bold truncate transition-colors cursor-pointer block ${
                                                                                isRetro 
                                                                                    ? "text-tui-text hover:text-tui-amber hover:underline" 
                                                                                    : "text-white hover:text-sky-400 hover:underline"
                                                                            }`}
                                                                        >
                                                                            {c.name}
                                                                        </a>
                                                                        <span className={`text-[11px] truncate mt-0.5 block ${
                                                                            isRetro ? "text-tui-text-muted" : "text-zinc-400"
                                                                        }`}>{c.character}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()
                                ) : (
                                    // Fallback to basic details if fetch failed
                                    <div className="max-w-2xl mx-auto space-y-4 font-mono text-xs text-center py-20">
                                        <div>FAILED TO SYNCHRONIZE DEEP DATA. RETRY OR USE BASIC VIEW.</div>
                                        <button 
                                            onClick={() => { setSelectedItem(null); setDetails(null); }}
                                            className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-lg"
                                        >
                                            CLOSE
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            </div>
    );
}

/* ── COMPACT MEDIA CARD FOR DISCOVERY GRIDS ─────────────────────────── */
interface MediaDiscoverCardProps {
    item: TMDBSearchResult;
    isRetro: boolean;
    onOpen: () => void;
    onAdd: (status: Status) => void;
    onRemove: (id: string) => void;
    dbItem?: Item;
}

function MediaDiscoverCard({ item, isRetro, onOpen, onAdd, onRemove, dbItem }: MediaDiscoverCardProps) {
    const [imgFailed, setImgFailed] = useState(false);
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
            <div className={`border bg-tui-panel ${borderClass} font-mono text-left flex flex-col h-full`}>
                <div 
                    onClick={onOpen}
                    className="aspect-[2/3] w-full bg-tui-bg border-b border-tui-border overflow-hidden cursor-pointer relative"
                >
                    {item.posterUrl && !imgFailed ? (
                        <img 
                            src={item.posterUrl} 
                            alt="" 
                            className="w-full h-full object-cover filter grayscale"
                            onError={() => setImgFailed(true)}
                        />
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
                {item.posterUrl && !imgFailed ? (
                    <img
                        src={item.posterUrl}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 filter brightness-90 group-hover:brightness-100"
                        loading="lazy"
                        onError={() => setImgFailed(true)}
                    />
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
                        title="View details"
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
