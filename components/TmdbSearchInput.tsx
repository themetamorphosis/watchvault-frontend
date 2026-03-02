"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
    const [open, setOpen] = useState(false);
    const [activeIdx, setActiveIdx] = useState(-1);
    const [hasSearched, setHasSearched] = useState(false);

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
                setOpen(false);
                setHasSearched(false);
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
                        setOpen(true);
                        setActiveIdx(-1);
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
        setOpen(false);
        setHasSearched(false);
        onSelect(result);
    }

    /* ── Keyboard navigation ────────────────────────────────── */
    function handleKeyDown(e: React.KeyboardEvent) {
        if (!open || results.length === 0) {
            if (e.key === "Escape") {
                setQuery("");
                setOpen(false);
                inputRef.current?.blur();
            }
            return;
        }

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
            case "Escape":
                e.preventDefault();
                setOpen(false);
                setQuery("");
                inputRef.current?.blur();
                break;
        }
    }

    /* ── Click outside → close ──────────────────────────────── */
    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    /* ── Cleanup on unmount ─────────────────────────────────── */
    useEffect(() => {
        return () => {
            abortRef.current?.abort();
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    /* ── Scroll active item into view ───────────────────────── */
    useEffect(() => {
        if (activeIdx >= 0) {
            const el = document.getElementById(`tmdb-result-${activeIdx}`);
            el?.scrollIntoView({ block: "nearest" });
        }
    }, [activeIdx]);

    const isExpanded = query.length > 0 || open;

    return (
        <div ref={containerRef} className="relative z-50">
            {/* ── Search Input ────────────────────────────────────── */}
            <div className="relative flex items-center">
                <div className="absolute left-3 pointer-events-none text-white/40">
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
                        if (results.length > 0) setOpen(true);
                    }}
                    placeholder={placeholder}
                    className={`
                      h-9
                      rounded-2xl
                      bg-white/[0.06] text-white
                      pl-9 pr-8
                      text-[13px] font-medium tracking-tight
                      placeholder:text-white/30
                      outline-none
                      border border-white/[0.08]
                      backdrop-blur-sm
                      transition-all duration-300 ease-out
                      ${isExpanded
                            ? 'w-[220px] sm:w-[280px] border-white/[0.14] bg-white/[0.08] shadow-[0_0_20px_rgba(255,255,255,0.06)]'
                            : 'w-[180px] sm:w-[220px] hover:bg-white/[0.08] hover:border-white/[0.12] focus:w-[220px] sm:focus:w-[280px] focus:border-white/[0.14] focus:bg-white/[0.08] focus:shadow-[0_0_20px_rgba(255,255,255,0.06)]'
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
                            setOpen(false);
                            setHasSearched(false);
                            inputRef.current?.focus();
                        }}
                        className="absolute right-2.5 text-white/30 hover:text-white/70 transition-colors"
                    >
                        <X className="h-3 w-3" />
                    </button>
                )}
            </div>

            {/* ── Dropdown ────────────────────────────────────────── */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="
              absolute left-0 top-full mt-2
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
        </div>
    );
}
