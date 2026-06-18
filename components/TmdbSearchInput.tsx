"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { MediaType } from "@/lib/types";
import { searchTmdb, type TMDBSearchResult } from "@/lib/tmdb";
import { Star, Film } from "lucide-react";

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
        <div ref={containerRef} className="relative z-50 font-mono">
            {/* ── Mobile Toggle Button ── */}
            <button
                onClick={() => setIsMobileActive(true)}
                className="
                    sm:hidden
                    flex items-center justify-center h-8 px-2.5
                    border border-tui-border bg-tui-panel text-tui-text-muted
                    hover:border-tui-text hover:text-tui-text transition-all text-xs
                "
                aria-label="Search TMDB"
            >
                [ SEARCH ]
            </button>

            {/* ── Desktop Inline Search Input ── */}
            <div className="hidden sm:flex relative items-center">
                <div className="absolute pointer-events-none left-3 text-tui-text-muted opacity-80 text-[10px] uppercase font-bold select-none">
                    {loading ? "..." : "ADD >"}
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
                      h-8
                      text-tui-text
                      pl-12 pr-8
                      text-xs uppercase
                      placeholder:text-tui-text-muted/40
                      outline-none
                      border
                      transition-all duration-150
                      ${isExpanded
                            ? 'w-[300px] bg-tui-input border-tui-text'
                            : 'w-[220px] bg-tui-panel border-tui-border hover:border-tui-text-muted focus:w-[300px] focus:border-tui-text focus:bg-tui-input'
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
                        className="absolute right-2 text-tui-text-muted hover:text-tui-text transition-colors text-xs font-bold select-none"
                    >
                        [X]
                    </button>
                )}
            </div>

            {/* ── Desktop Search Results Dropdown ────────────────────────── */}
            <AnimatePresence>
                {isDesktopOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="
                          hidden sm:block absolute left-0 top-full mt-1.5
                          w-[420px] max-h-[380px] overflow-y-auto
                          bg-tui-panel border border-tui-border
                          shadow-2xl overscroll-contain
                        "
                        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
                    >
                        {results.length > 0 ? (
                            <div className="divide-y divide-tui-border-muted">
                                {results.map((r, i) => (
                                    <div
                                        key={r.tmdbId}
                                        id={`tmdb-result-${i}`}
                                        onMouseEnter={() => setActiveIdx(i)}
                                        className={`
                                          w-full flex items-center gap-3 px-3 py-2
                                          text-left transition-colors duration-100
                                          ${activeIdx === i
                                                ? "bg-tui-input text-tui-text font-bold"
                                                : "text-tui-text-muted hover:bg-tui-input/50"
                                            }
                                        `}
                                    >
                                        {/* Poster thumbnail */}
                                        <div className="flex-shrink-0 w-10 h-[56px] border border-tui-border-muted overflow-hidden bg-tui-bg flex items-center justify-center">
                                            {r.posterUrl ? (
                                                <img
                                                    src={r.posterUrl}
                                                    alt=""
                                                    className="w-full h-full object-cover grayscale opacity-80"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <Film className="h-4 w-4 text-tui-text-muted/40" />
                                            )}
                                        </div>

                                        {/* Text info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-xs font-bold text-tui-text truncate uppercase block">
                                                    {r.title}
                                                </span>
                                                {r.year && (
                                                    <span className="text-[10px] text-tui-text-muted flex-shrink-0">
                                                        ({r.year})
                                                    </span>
                                                )}
                                            </div>

                                            {/* Genres */}
                                            {r.genres.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-0.5">
                                                    {r.genres.slice(0, 2).map((g) => (
                                                        <span
                                                            key={g}
                                                            className="text-[9px] text-tui-text-muted uppercase"
                                                        >
                                                            [{g}]
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Rating */}
                                            {r.voteAverage != null && r.voteAverage > 0 && (
                                                <div className="mt-0.5 flex items-center gap-1 text-[10px] text-tui-amber font-bold">
                                                    <Star className="h-3 w-3 fill-current text-tui-amber" />
                                                    <span>{r.voteAverage.toFixed(1)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Add button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelect(r);
                                            }}
                                            className="flex-shrink-0 px-2 py-1 text-[10px] font-bold uppercase border border-tui-green/30 text-tui-green bg-tui-green/10 hover:bg-tui-green/20 hover:text-tui-green transition-colors"
                                            title={`Add ${r.title}`}
                                        >
                                            [+ ADD]
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : hasSearched && !loading ? (
                            <div className="px-4 py-8 text-center text-xs text-tui-text-muted">
                                &gt; NO RESULTS FOUND ON TMDB
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
                                transition={{ duration: 0.15 }}
                                className="absolute inset-0 bg-tui-bg/98 backdrop-blur-md"
                                onClick={() => {
                                    setIsMobileActive(false);
                                    setQuery("");
                                    setResults([]);
                                }}
                            />

                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                transition={{ duration: 0.15 }}
                                className="relative w-full max-w-2xl mt-4 px-4 flex flex-col h-full"
                            >
                                {/* Search Input in modal */}
                                <div className="relative flex items-center mb-3 flex-shrink-0">
                                    <span className="absolute left-4 text-tui-text-muted text-xs font-bold uppercase select-none">
                                        {loading ? "..." : "QUERY >"}
                                    </span>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={query}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder={placeholder}
                                        autoFocus
                                        className="
                                          w-full h-12 bg-tui-input border border-tui-border text-tui-text
                                          pl-20 pr-20
                                          text-sm uppercase
                                          placeholder:text-tui-text-muted/40
                                          outline-none
                                          focus:border-tui-text
                                          transition-all duration-200
                                        "
                                        autoComplete="off"
                                        spellCheck={false}
                                    />
                                    {query && (
                                        <button
                                            onClick={() => {
                                                setQuery("");
                                                setResults([]);
                                                inputRef.current?.focus();
                                            }}
                                            className="absolute right-14 text-tui-text-muted hover:text-tui-text transition-colors text-xs font-bold uppercase select-none"
                                        >
                                            [ CLEAR ]
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            setIsMobileActive(false);
                                            setQuery("");
                                            setResults([]);
                                        }}
                                        className="absolute right-4 text-tui-text-muted hover:text-tui-text transition-colors text-xs font-bold uppercase select-none p-1"
                                    >
                                        [X]
                                    </button>
                                </div>

                                {/* Results in modal */}
                                {(query.length > 0 || hasSearched) && (
                                    <div className="
                                        w-full bg-tui-panel border border-tui-border
                                        shadow-2xl overflow-hidden
                                        flex flex-col flex-1 mb-6
                                    ">
                                        <div
                                            className="max-h-[70vh] overflow-y-auto overscroll-contain divide-y divide-tui-border-muted"
                                            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
                                        >
                                            {results.length > 0 ? (
                                                <div className="flex flex-col">
                                                    {results.map((r, i) => (
                                                        <div
                                                            key={r.tmdbId}
                                                            id={`tmdb-result-${i}`}
                                                            onMouseEnter={() => setActiveIdx(i)}
                                                            className={`
                                                              w-full flex items-center gap-3 px-3 py-2.5
                                                              text-left transition-colors duration-100
                                                              ${activeIdx === i
                                                                        ? "bg-tui-input text-tui-text font-bold"
                                                                        : "text-tui-text-muted hover:bg-tui-input/50"
                                                                    }
                                                            `}
                                                            onClick={() => handleSelect(r)}
                                                            role="button"
                                                            tabIndex={0}
                                                        >
                                                            {/* Poster thumbnail */}
                                                            <div className="flex-shrink-0 w-10 h-[56px] border border-tui-border-muted overflow-hidden bg-tui-bg flex items-center justify-center">
                                                                {r.posterUrl ? (
                                                                    <img
                                                                        src={r.posterUrl}
                                                                        alt=""
                                                                        className="w-full h-full object-cover grayscale opacity-85"
                                                                        loading="lazy"
                                                                    />
                                                                ) : (
                                                                    <Film className="h-4 w-4 text-tui-text-muted/40" />
                                                                )}
                                                            </div>

                                                            {/* Text info */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-baseline gap-1.5">
                                                                    <span className="text-xs font-bold text-tui-text truncate uppercase block">
                                                                        {r.title}
                                                                    </span>
                                                                    {r.year && (
                                                                        <span className="text-[10px] text-tui-text-muted flex-shrink-0">
                                                                            ({r.year})
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Genres */}
                                                                {r.genres.length > 0 && (
                                                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                                                        {r.genres.slice(0, 2).map((g) => (
                                                                            <span
                                                                                key={g}
                                                                                className="text-[9px] text-tui-text-muted uppercase"
                                                                            >
                                                                                [{g}]
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {/* Rating */}
                                                                {r.voteAverage != null && r.voteAverage > 0 && (
                                                                    <div className="mt-0.5 flex items-center gap-1 text-[10px] text-tui-amber font-bold">
                                                                        <Star className="h-3 w-3 fill-current text-tui-amber" />
                                                                        <span>{r.voteAverage.toFixed(1)}</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Add button */}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSelect(r);
                                                                }}
                                                                className="flex-shrink-0 px-2 py-1 text-[10px] font-bold uppercase border border-tui-green/30 text-tui-green bg-green-950/15 ml-2 hover:bg-tui-green/20 transition-colors"
                                                                title={`Add ${r.title}`}
                                                            >
                                                                [+ ADD]
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : hasSearched && !loading ? (
                                                <div className="px-4 py-12 text-center text-xs text-tui-text-muted">
                                                    &gt; NO RESULTS FOUND ON TMDB
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
