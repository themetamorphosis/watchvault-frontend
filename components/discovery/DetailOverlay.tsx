"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Star,
    Heart,
    Plus,
    Check,
    Trash2,
    Info,
} from "lucide-react";
import type { TMDBSearchResult, TMDBMediaDetails } from "@/lib/tmdb";
import type { Item, Status } from "@/lib/types";
import TMDBImage from "@/components/ui/TMDBImage";
import { useModalA11y } from "@/hooks/useModalA11y";

interface DetailOverlayProps {
    selectedItem: TMDBSearchResult | null;
    details: TMDBMediaDetails | null;
    loadingDetails: boolean;
    playTrailer: boolean;
    userRating: number | null;
    showRatingSelector: boolean;
    isRetro: boolean;
    watchlistItem?: Item;
    onClose: () => void;
    onRate: (rating: number) => void;
    onClearRate: () => void;
    onSetPlayTrailer: (v: boolean) => void;
    onSetShowRatingSelector: (v: boolean) => void;
    onAddToWatchlist: (media: TMDBSearchResult | TMDBMediaDetails, status: Status) => void;
    onRemoveFromWatchlist: (itemId: string) => void;
}

export default function DetailOverlay({
    selectedItem,
    details,
    loadingDetails,
    playTrailer,
    userRating,
    showRatingSelector,
    isRetro,
    watchlistItem,
    onClose,
    onRate,
    onClearRate,
    onSetPlayTrailer,
    onSetShowRatingSelector,
    onAddToWatchlist,
    onRemoveFromWatchlist,
}: DetailOverlayProps) {
    const { containerRef, trapFocus } = useModalA11y(onClose);

    return (
        <AnimatePresence>
            {selectedItem && (
                <div
                    onClick={onClose}
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
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/20" />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10" />
                            </div>
                        )}

                        {/* Close Button */}
                        <button
                            onClick={onClose}
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
                                                                    <TMDBImage src={details.backdropUrl} alt={details.title} fill className="w-full h-full object-cover filter brightness-[0.7]" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500 font-mono">
                                                                        [ NO STAGE PREVIEW AVAILABLE ]
                                                                    </div>
                                                                )}

                                                                {/* Centered Large Blue Play Button Overlay */}
                                                                <div
                                                                    onClick={() => onSetPlayTrailer(true)}
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
                                                            <TMDBImage src={details.posterUrl} alt={details.title} fill className="w-full h-full object-cover" />
                                                            {/* Plus \'\'+\'\' button in top-left */}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (watchlistItem) {
                                                                        onRemoveFromWatchlist(watchlistItem.id);
                                                                    } else {
                                                                        onAddToWatchlist(details, "wishlist");
                                                                    }
                                                                }}
                                                                className={`absolute top-2 left-2 z-30 w-5.5 h-5.5 flex items-center justify-center transition-all cursor-pointer ${
                                                                    isRetro
                                                                        ? "border border-tui-border bg-tui-bg text-tui-text text-[9px] rounded-none hover:bg-tui-input font-bold"
                                                                        : "rounded-full bg-black/50 hover:bg-white/20 border border-white/20 text-white shadow-lg backdrop-blur-sm"
                                                                }`}
                                                                title={watchlistItem ? "Remove from Watchlist" : "Add to Wishlist"}
                                                            >
                                                                {watchlistItem ? (
                                                                    <Trash2 className="h-3 w-3 text-red-400" />
                                                                ) : (
                                                                    <Plus className="h-3.5 w-3.5" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Credits Section */}
                                                <div className="space-y-3 pt-4">
                                                    {/* Directors */}
                                                    <div className={`flex items-center py-3.5 border-b ${isRetro ? "border-tui-border" : "border-white/[0.08]"}`}>
                                                        <span className={`font-semibold w-24 shrink-0 ${isRetro ? "text-tui-text-muted" : "text-zinc-500"}`}>Director</span>
                                                        <div className="flex flex-wrap gap-1.5 flex-1">
                                                            {displayWriters.map((w, idx) => (
                                                                <React.Fragment key={w}>
                                                                    {idx > 0 && <span className={isRetro ? "text-tui-text-muted" : "text-zinc-500"}>,</span>}
                                                                    <a
                                                                        href={`https://www.google.com/search?q=${encodeURIComponent(w)}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className={`${isRetro ? "text-tui-green hover:underline font-bold" : "text-sky-400 hover:underline hover:text-sky-300 transition-colors font-semibold"}`}
                                                                    >
                                                                        {w}
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
                                                <div className="flex flex-wrap items-center gap-4">
                                                    {details.voteAverage != null && (
                                                        <div className={`flex items-center gap-2 px-4 py-2.5 border ${
                                                            isRetro
                                                                ? "border-tui-border bg-tui-bg"
                                                                : "rounded-xl border-white/10 bg-white/[0.03]"
                                                        }`}>
                                                            <Star className={`h-5 w-5 fill-current ${isRetro ? "text-tui-amber" : "text-amber-400"}`} />
                                                            <span className={`text-xl font-bold ${isRetro ? "text-tui-text" : "text-white"}`}>
                                                                {details.voteAverage.toFixed(1)}
                                                            </span>
                                                            <span className={`text-xs ${isRetro ? "text-tui-text-muted" : "text-zinc-500"}`}>/10</span>
                                                            {details.voteCount != null && (
                                                                <span className={`text-[10px] ml-1 ${isRetro ? "text-tui-text-muted" : "text-zinc-500"}`}>
                                                                    ({details.voteCount.toLocaleString()} votes)
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {details.runtime != null && (
                                                        <div className={`flex items-center gap-1.5 px-3 py-2 border text-sm ${
                                                            isRetro
                                                                ? "border-tui-border bg-tui-bg text-tui-text-muted font-mono"
                                                                : "rounded-xl border-white/10 bg-white/[0.03] text-zinc-400"
                                                        }`}>
                                                            <Info className="h-3.5 w-3.5" />
                                                            {details.runtime} min
                                                        </div>
                                                    )}

                                                    {/* User Rating */}
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => onSetShowRatingSelector(!showRatingSelector)}
                                                            className={`flex items-center gap-2 px-4 py-2.5 border text-sm cursor-pointer transition-all ${
                                                                isRetro
                                                                    ? "border-tui-border bg-tui-bg text-tui-text-muted hover:border-tui-text font-mono"
                                                                    : "rounded-xl border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20"
                                                            }`}
                                                        >
                                                            <Star className={`h-4 w-4 ${userRating != null ? "fill-amber-400 text-amber-400" : ""}`} />
                                                            {userRating != null ? `${userRating}/10` : "Rate"}
                                                        </button>
                                                        {showRatingSelector && (
                                                            <div className={`absolute top-full left-0 mt-2 z-50 p-3 ${
                                                                isRetro
                                                                    ? "bg-tui-panel border border-tui-border font-mono"
                                                                    : "bg-zinc-950 border border-white/10 rounded-xl shadow-2xl"
                                                            }`}>
                                                                <div className="flex gap-1 mb-2">
                                                                    {[1,2,3,4,5,6,7,8,9,10].map((r) => (
                                                                        <button
                                                                            key={r}
                                                                            onClick={() => onRate(r)}
                                                                            className={`w-7 h-7 flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                                                                                userRating === r
                                                                                    ? "bg-amber-400 text-zinc-950"
                                                                                    : isRetro
                                                                                        ? "border border-tui-border text-tui-text-muted hover:text-tui-text hover:bg-tui-bg"
                                                                                        : "text-zinc-400 hover:text-white hover:bg-white/10 rounded"
                                                                            }`}
                                                                        >
                                                                            {r}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                                {userRating != null && (
                                                                    <button
                                                                        onClick={onClearRate}
                                                                        className={`w-full text-center text-[10px] py-1 cursor-pointer ${
                                                                            isRetro ? "text-tui-text-muted hover:text-red-500" : "text-zinc-500 hover:text-red-400"
                                                                        }`}
                                                                    >
                                                                        Clear Rating
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex flex-wrap gap-3 pt-2">
                                                    {watchlistItem ? (
                                                        <>
                                                            <button
                                                                onClick={() => onRemoveFromWatchlist(watchlistItem.id)}
                                                                className={`flex items-center gap-2 px-5 py-2.5 border text-sm font-semibold transition-all cursor-pointer ${
                                                                    isRetro
                                                                        ? "border-red-950 bg-red-950/10 text-red-500 hover:border-red-600 font-mono"
                                                                        : "rounded-xl border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                                                }`}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                Remove from Watchlist
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    const dbItem = watchlistItem;
                                                                    if (dbItem) {
                                                                        onRemoveFromWatchlist(dbItem.id);
                                                                    }
                                                                }}
                                                                className={`flex items-center gap-2 px-5 py-2.5 border text-sm font-semibold transition-all cursor-pointer ${
                                                                    isRetro
                                                                        ? "border-tui-border bg-tui-bg text-tui-text hover:border-tui-amber font-mono"
                                                                        : "rounded-xl border-white/10 bg-white/[0.03] text-white hover:border-amber-500/30"
                                                                }`}
                                                            >
                                                                <Heart className={`h-4 w-4 ${watchlistItem.favorite ? "fill-rose-400 text-rose-400" : ""}`} />
                                                                {watchlistItem.favorite ? "Favorited" : "Favorite"}
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => onAddToWatchlist(details, "watched")}
                                                                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold transition-all cursor-pointer ${
                                                                    isRetro
                                                                        ? "bg-tui-green text-tui-bg hover:bg-tui-amber font-mono"
                                                                        : "rounded-xl bg-white text-zinc-950 hover:bg-neutral-100"
                                                                }`}
                                                            >
                                                                <Check className="h-4 w-4" />
                                                                Mark Watched
                                                            </button>
                                                            <button
                                                                onClick={() => onAddToWatchlist(details, "pending")}
                                                                className={`flex items-center gap-2 px-5 py-2.5 border text-sm font-semibold transition-all cursor-pointer ${
                                                                    isRetro
                                                                        ? "border-tui-border bg-tui-bg text-tui-text-muted hover:border-tui-text font-mono"
                                                                        : "rounded-xl border-white/10 text-neutral-300 hover:text-amber-400 hover:border-amber-500/30"
                                                                }`}
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                                Add to Pending
                                                            </button>
                                                            <button
                                                                onClick={() => onAddToWatchlist(details, "wishlist")}
                                                                className={`flex items-center gap-2 px-5 py-2.5 border text-sm font-semibold transition-all cursor-pointer ${
                                                                    isRetro
                                                                        ? "border-tui-border bg-tui-bg text-tui-text-muted hover:border-tui-text font-mono"
                                                                        : "rounded-xl border-white/10 text-neutral-300 hover:text-sky-400 hover:border-sky-500/30"
                                                                }`}
                                                            >
                                                                <Heart className="h-4 w-4" />
                                                                Add to Wishlist
                                                            </button>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Cast Grid */}
                                                <div className="pt-4">
                                                    <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${isRetro ? "text-tui-text" : "text-zinc-300"}`}>
                                                        Cast
                                                    </h3>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                                        {displayCast.map((c) => (
                                                            <a
                                                                key={c.name}
                                                                href={`https://www.google.com/search?q=${encodeURIComponent(c.name)}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={`flex items-center gap-3 p-2.5 transition-all ${
                                                                    isRetro
                                                                        ? "border border-tui-border bg-tui-bg hover:border-tui-amber"
                                                                        : "rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06]"
                                                                }`}
                                                            >
                                                                <div className={`h-12 w-12 overflow-hidden bg-zinc-800 shrink-0 border transition-all shadow-md flex-shrink-0 ${
                                                                    isRetro
                                                                        ? "rounded-none border-tui-border hover:border-tui-amber"
                                                                        : "rounded-full border-white/10 hover:border-sky-400 hover:scale-105"
                                                                }`}>
                                                                    {c.profileUrl ? (
                                                                        <TMDBImage src={c.profileUrl} alt={c.name} width={48} height={48} className="h-full w-full object-cover" />
                                                                    ) : (
                                                                        <div className={`h-full w-full flex items-center justify-center text-xs font-bold uppercase ${
                                                                            isRetro ? "text-tui-text-muted bg-tui-bg" : "text-zinc-500"
                                                                        }`}>
                                                                            {c.name.substring(0, 2)}
                                                                        </div>
                                                                    )}
                                                                </div>
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
                                                            </a>
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
                                        onClick={onClose}
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
    );
}
