"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Star, Loader2, PlusCircle } from "lucide-react";
import type { MediaType } from "@/lib/types";
import { searchTmdb, type TMDBSearchResult } from "@/lib/tmdb";

/* ── Props ─────────────────────────────────────────────────── */
interface TmdbSearchInputProps {
    mediaType: MediaType;
    onSelect: (result: TMDBSearchResult) => void;
    placeholder?: string;
}

/* ── Component ─────────────────────────────────────────────── */
export default function TmdbSearchInput({
    mediaType,
    onSelect,
    placeholder = "Search to add a title…",
}: TmdbSearchInputProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<TMDBSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [isMobileActive, setIsMobileActive] = useState(false);
    const [isDesktopOpen, setIsDesktopOpen] = useState(false);
    const [activeIdx, setActiveIdx] = useState(-1);
    const [hasSearched, setHasSearched] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /* ── Debounced TMDB search ──────────────────────────────── */
    const doSearch = useCallback(
        (q: string) => {
            // Cancel previous request
            abortRef.current?.abort();
            if (debounceRef.current) clearTimeout(debounceRef.current);

            if (q.trim().length < 2) {
                setResults([]);
                setHasSearched(false);
                setIsDesktopOpen(false);
                setLoading(false);
                return;
            }

            setLoading(true);

            debounceRef.current = setTimeout(async () => {
                const controller = new AbortController();
                abortRef.current = controller;

                try {
                    const res = await searchTmdb(q, mediaType, controller.signal);
                    if (!controller.signal.aborted) {
                        setResults(res);
                        setActiveIdx(-1);
                        setIsDesktopOpen(true);
                        setHasSearched(true);
                        setLoading(false);
                    }
                } catch (err: unknown) {
                    if (err instanceof DOMException && err.name === "AbortError") return;
                    setLoading(false);
                }
            }, 150);
        },
        [mediaType]
    );

    /* ── Input change handler ───────────────────────────────── */
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const v = e.target.value;
        setQuery(v);
        doSearch(v);
    }

    /* ── Select a result ────────────────────────────────────── */
    function handleSelect(result: TMDBSearchResult) {
        setQuery("");
        setResults([]);
        setIsMobileActive(false);
        setIsDesktopOpen(false);
        setHasSearched(false);
        onSelect(result);
    }

    /* ── Keyboard navigation ────────────────────────────────── */
    function handleKeyDown(e: React.KeyboardEvent) {
        if (!isMobileActive && !isDesktopOpen) return;

        if (e.key === "Escape") {
            e.preventDefault();
            setIsMobileActive(false);
            setIsDesktopOpen(false);
            setQuery("");
            setResults([]);
            inputRef.current?.blur();
            return;
        }

        if (results.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setActiveIdx((i) => (i < results.length - 1 ? i + 1 : 0));
                break;
            case "ArrowUp":
                e.preventDefault();
                setActiveIdx((i) => (i > 0 ? i - 1 : results.length - 1));
                break;
            case "Enter":
                e.preventDefault();
                if (activeIdx >= 0 && activeIdx < results.length) {
                    handleSelect(results[activeIdx]);
                }
                break;
        }
    }

    /* ── Click outside → close ──────────────────────────────── */
    useEffect(() => {
        function onClick(e: MouseEvent) {
            // Only apply this logic for the desktop popover layout
            if (isDesktopOpen && !isMobileActive && containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsDesktopOpen(false);
            }
        }
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [isDesktopOpen, isMobileActive]);

    /* ── Mobile Scroll Lock ─────────────────────────────────── */
    useEffect(() => {
        if (isMobileActive) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isMobileActive]);

    /* ── Cleanup on unmount ─────────────────────────────────── */
    useEffect(() => {
        return () => {
            abortRef.current?.abort();
            if (debounceRef.current) clearTimeout(debounceRef.current);
            document.body.style.overflow = "";
        };
    }, []);

    /* ── Scroll active item into view ───────────────────────── */
    useEffect(() => {
        if (activeIdx >= 0) {
            const el = document.getElementById(`tmdb-result-${activeIdx}`);
            el?.scrollIntoView({ block: "nearest" });
        }
    }, [activeIdx]);

    const isExpanded = query.length > 0 || isDesktopOpen;

    return (
        <div ref={containerRef} className="relative z-50">
            {/* ── Mobile Toggle Button ── */}
            <button
                onClick={() => setIsMobileActive(true)}
                className="
                    sm:hidden
                    relative flex items-center justify-center h-9 w-9 rounded-xl
                    bg-gradient-to-br from-violet-500/20 to-rose-500/20
                    text-white outline-none
                    border border-white/[0.12] backdrop-blur-sm
                    transition-all duration-300 ease-out
                    hover:from-violet-500/30 hover:to-rose-500/30
                    hover:border-white/[0.18] hover:shadow-[0_0_16px_rgba(168,85,247,0.15)]
                    active:scale-95
                "
                aria-label="Search TMDB"
            >
                <Search className="h-4 w-4 pointer-events-none text-white/70" />
            </button>

            {/* ── Desktop Inline Search Input ── */}
            <div className="hidden sm:flex relative items-center">
                <div className={`absolute pointer-events-none transition-opacity left-3 ${isExpanded ? 'text-violet-400/70' : 'text-white/40'}`}>
                    {loading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Search className="h-3.5 w-3.5" />
                    )}
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (results.length > 0) setIsDesktopOpen(true);
                    }}
                    placeholder={placeholder}
                    className={`
                      h-9
                      rounded-xl
                      text-white
                      pl-9 pr-8
                      text-[13px] font-medium tracking-tight
                      placeholder:text-white/35
                      outline-none
                      backdrop-blur-sm
                      transition-all duration-300 ease-out
                      ${isExpanded
                            ? 'w-[300px] bg-white/[0.08] border border-violet-500/25 shadow-[0_0_20px_rgba(168,85,247,0.08)]'
                            : 'w-[220px] bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.12] focus:w-[300px] focus:border-violet-500/25 focus:bg-white/[0.08] focus:shadow-[0_0_20px_rgba(168,85,247,0.08)]'
                        }
                    `}
                    autoComplete="off"
                    spellCheck={false}
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery("");
                            setResults([]);
                            setIsDesktopOpen(false);
                            setHasSearched(false);
                            inputRef.current?.focus();
                        }}
                        className="absolute right-2.5 text-white/30 hover:text-white/70 transition-colors"
                    >
                        <X className="h-3 w-3" />
                    </button>
                )}
            </div>

            {/* ── Desktop Search Results Dropdown ────────────────────────── */}
            <AnimatePresence>
                {isDesktopOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="
                          hidden sm:block absolute left-0 top-full mt-2
                          w-[340px] sm:w-[420px]
                          max-h-[420px] overflow-y-auto
                          rounded-2xl
                          bg-[#111111]/95 backdrop-blur-2xl
                          border border-white/[0.08]
                          shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)]
                          overscroll-contain
                        "
                        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
                    >
                        {results.length > 0 ? (
                            <div className="py-1.5">
                                {results.map((r, i) => (
                                    <div
                                        key={r.tmdbId}
                                        id={`tmdb-result-${i}`}
                                        onMouseEnter={() => setActiveIdx(i)}
                                        className={`
                                          w-full flex items-center gap-3 px-3 py-2.5
                                          text-left transition-colors duration-100
                                          ${activeIdx === i
                                                ? "bg-white/[0.08]"
                                                : "hover:bg-white/[0.05]"
                                            }
                                        `}
                                    >
                                        {/* Poster thumbnail */}
                                        <div className="flex-shrink-0 w-10 h-[60px] rounded-lg overflow-hidden bg-white/[0.04]">
                                            {r.posterUrl ? (
                                                <img
                                                    src={r.posterUrl}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                                                    🎬
                                                </div>
                                            )}
                                        </div>

                                        {/* Text info */}
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-white truncate">
                                                    {r.title}
                                                </span>
                                                {r.year && (
                                                    <span className="text-xs text-white/35 flex-shrink-0">
                                                        {r.year}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Genres */}
                                            {r.genres.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {r.genres.slice(0, 3).map((g) => (
                                                        <span
                                                            key={g}
                                                            className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/50"
                                                        >
                                                            {g}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Rating */}
                                            {r.voteAverage != null && r.voteAverage > 0 && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Star className="h-3 w-3 text-amber-400/70 fill-amber-400/70" />
                                                    <span className="text-[11px] text-white/40">
                                                        {r.voteAverage.toFixed(1)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Add button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelect(r);
                                            }}
                                            className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-all duration-200"
                                            title={`Add ${r.title}`}
                                        >
                                            <PlusCircle className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : hasSearched && !loading ? (
                            <div className="px-4 py-8 text-center">
                                <div className="text-2xl mb-2 opacity-40">🔍</div>
                                <p className="text-sm text-white/40">No results found on TMDB</p>
                            </div>
                        ) : null}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Mobile Fullscreen Overlay (Sm Only) ────────────────────────────────────────── */}
            {mounted && createPortal(
                <AnimatePresence>
                    {isMobileActive && (
                        <div className="fixed inset-0 z-[200] flex flex-col items-center">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-xl"
                                onClick={() => {
                                    setIsMobileActive(false);
                                    setQuery("");
                                    setResults([]);
                                }}
                            />

                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                className="relative w-full max-w-2xl mt-4 sm:mt-16 px-4 sm:px-0 flex flex-col h-full sm:h-auto"
                            >
                                {/* Search Input in modal */}
                                <div className="relative flex items-center mb-2 flex-shrink-0">
                                    <Search className="absolute left-4 h-5 w-5 text-white/40" />
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={query}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder={placeholder}
                                        autoFocus
                                        className="
                                        w-full h-14 rounded-2xl
                                        bg-white/[0.1] text-white
                                        pl-12 pr-12
                                        text-lg font-medium tracking-tight
                                        placeholder:text-white/30
                                        outline-none
                                        border border-white/[0.15]
                                        shadow-[0_0_30px_rgba(255,255,255,0.05)]
                                        focus:border-white/[0.25] focus:bg-white/[0.12]
                                        transition-all duration-300
                                    "
                                        autoComplete="off"
                                        spellCheck={false}
                                    />
                                    {loading ? (
                                        <div className="absolute right-12 text-white/40">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        </div>
                                    ) : query && (
                                        <button
                                            onClick={() => {
                                                setQuery("");
                                                setResults([]);
                                                inputRef.current?.focus();
                                            }}
                                            className="absolute right-12 text-white/40 hover:text-white transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            setIsMobileActive(false);
                                            setQuery("");
                                            setResults([]);
                                        }}
                                        className="absolute right-4 text-white/40 hover:text-white transition-colors p-1"
                                    >
                                        <span className="sr-only">Close</span>
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Dropdown / Results in modal */}
                                {(query.length > 0 || hasSearched) && (
                                    <div className="
                                    w-full bg-[#111111]/95 rounded-2xl
                                    border border-white/[0.08]
                                    shadow-2xl overflow-hidden
                                    flex flex-col flex-1 sm:flex-none
                                    mb-4 sm:mb-0
                                ">
                                        <div
                                            className="max-h-[70vh] p-2 overflow-y-auto overscroll-contain"
                                            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
                                        >
                                            {results.length > 0 ? (
                                                <div className="flex flex-col gap-1">
                                                    {results.map((r, i) => (
                                                        <div
                                                            key={r.tmdbId}
                                                            id={`tmdb-result-${i}`}
                                                            onMouseEnter={() => setActiveIdx(i)}
                                                            className={`
                                                          w-full flex items-center gap-3 px-3 py-2
                                                          rounded-xl text-left transition-colors duration-100
                                                          ${activeIdx === i
                                                                    ? "bg-white/[0.1]"
                                                                    : "hover:bg-white/[0.06]"
                                                                }
                                                        `}
                                                            onClick={() => handleSelect(r)}
                                                            role="button"
                                                            tabIndex={0}
                                                        >
                                                            {/* Poster thumbnail */}
                                                            <div className="flex-shrink-0 w-10 h-[60px] rounded-lg overflow-hidden bg-white/[0.04] shadow-sm">
                                                                {r.posterUrl ? (
                                                                    <img
                                                                        src={r.posterUrl}
                                                                        alt=""
                                                                        className="w-full h-full object-cover"
                                                                        loading="lazy"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                                                                        🎬
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Text info */}
                                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-semibold text-white truncate">
                                                                        {r.title}
                                                                    </span>
                                                                    {r.year && (
                                                                        <span className="text-xs font-medium text-white/35 flex-shrink-0">
                                                                            {r.year}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Genres */}
                                                                {r.genres.length > 0 && (
                                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                                        {r.genres.slice(0, 3).map((g) => (
                                                                            <span
                                                                                key={g}
                                                                                className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/60"
                                                                            >
                                                                                {g}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {/* Rating */}
                                                                {r.voteAverage != null && r.voteAverage > 0 && (
                                                                    <div className="flex items-center gap-1 mt-1.5">
                                                                        <Star className="h-3 w-3 text-amber-400/80 fill-amber-400/80" />
                                                                        <span className="text-[11px] font-medium text-white/50">
                                                                            {r.voteAverage.toFixed(1)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Add button */}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSelect(r);
                                                                }}
                                                                className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200 ml-2"
                                                                title={`Add ${r.title}`}
                                                            >
                                                                <PlusCircle className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : hasSearched && !loading ? (
                                                <div className="px-4 py-12 flex flex-col items-center justify-center text-center">
                                                    <div className="text-4xl mb-3 opacity-30">🔍</div>
                                                    <p className="text-sm font-medium text-white/50">No results found on TMDB</p>
                                                    <p className="text-xs text-white/30 mt-1">Check for typos or try searching by IMDB ID.</p>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
