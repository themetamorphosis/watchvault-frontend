"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Item, MediaType, Status } from "@/lib/types";
import TMDBImage from "@/components/ui/TMDBImage";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import MediaCard from "@/components/MediaCard";
import EditorModal from "@/components/EditorModal";
import ImportModal from "@/components/ImportModal";
import TmdbSearchInput from "@/components/TmdbSearchInput";
import type { TMDBSearchResult } from "@/lib/tmdb";
import ExpandableCardOverlay from "@/components/ExpandableCardOverlay";
import EmptyState from "@/components/EmptyState";
import { useSession } from "@/components/SessionProvider";
import { useRetroTheme } from "@/components/layout/RetroThemeContext";
import { useLibraryData } from "@/hooks/useLibraryData";
import { useLibraryFilters } from "@/hooks/useLibraryFilters";
import { statusText } from "@/lib/utils";
import { Film, Tv, Sparkles, ChevronDown, Star, Heart } from "lucide-react";

const SORT_OPTIONS: { value: "recent" | "title" | "year"; label: string }[] = [
  { value: "recent", label: "Recently added" },
  { value: "title", label: "Name (A → Z)" },
  { value: "year", label: "Release year" },
];

function SortDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: "recent" | "title" | "year") => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    function keyHandler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, []);

  const current = SORT_OPTIONS.find((o) => o.value === value)?.label ?? value;

  return (
    <div ref={ref} className="relative font-mono text-xs">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 h-8 px-3 border border-tui-border bg-tui-panel text-tui-text-muted hover:border-tui-text hover:text-tui-text transition-all uppercase"
      >
        <span>SORT: {current.toUpperCase()}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-full mt-1.5 z-50 min-w-[160px] bg-tui-panel border border-tui-border shadow-2xl p-1"
          >
            {SORT_OPTIONS.map((opt) => {
              const active = opt.value === value;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 uppercase transition-all duration-150 ${
                    active
                      ? "bg-tui-input text-tui-amber font-bold"
                      : "text-tui-text-muted hover:bg-tui-input/50 hover:text-tui-text"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GenreDropdown({
  value,
  onChange,
  allGenres,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  allGenres: string[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    function keyHandler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, []);

  const currentLabel = value ? value.toUpperCase() : "ALL";

  return (
    <div ref={ref} className="relative font-mono text-xs">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 h-8 px-3 border border-tui-border bg-tui-panel text-tui-text-muted hover:border-tui-text hover:text-tui-text transition-all uppercase"
      >
        <span>GENRE: {currentLabel}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-full mt-1.5 z-50 min-w-[160px] max-h-[260px] overflow-y-auto bg-tui-panel border border-tui-border shadow-2xl p-1 scrollbar-thin"
          >
            <button
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 uppercase transition-all duration-150 ${
                value === null
                  ? "bg-tui-input text-tui-amber font-bold"
                  : "text-tui-text-muted hover:bg-tui-input/50 hover:text-tui-text"
              }`}
            >
              [ ALL GENRES ]
            </button>
            {allGenres.map((g) => {
              const active = g === value;
              return (
                <button
                  key={g}
                  onClick={() => {
                    onChange(active ? null : g);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 uppercase transition-all duration-150 ${
                    active
                      ? "bg-tui-input text-tui-amber font-bold"
                      : "text-tui-text-muted hover:bg-tui-input/50 hover:text-tui-text"
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LibraryPage({
  mediaType,
  mode = "library",
}: {
  mediaType: MediaType;
  title: string;
  mode?: "library" | "wishlist";
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userId = session?.user?.id || "guest";

  const {
    items,
    ready,
    mounted,
    ensureCover,
    syncingRefs,
    handleUpsert,
    handleDelete,
    handleToggleFav,
    handleImport,
  } = useLibraryData(userId);

  const {
    query,
    setQuery,
    onlyFav,
    setOnlyFav,
    sort,
    setSort,
    genreFilter,
    setGenreFilter,
    allGenres,
    pageItems,
    filtered,
    renderItems,
    visibleCount,
    loadMoreRef,
  } = useLibraryFilters(items, mediaType, mode);

  const { scanlines, setScanlines, theme } = useRetroTheme();

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<Item | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("wv-library-viewmode");
        if (saved === "grid" || saved === "table")
          return saved as "grid" | "table";
      } catch {}
    }
    return "grid";
  });

  const handleSetViewMode = (mode: "grid" | "table") => {
    setViewMode(mode);
    try {
      localStorage.setItem("wv-library-viewmode", mode);
    } catch {}
  };

  // Poster enrichment for visible items
  useEffect(() => {
    if (!ready || renderItems.length === 0) return;

    const missing = renderItems.filter((it) => {
      if (syncingRefs.current.has(it.id)) return false;
      if (it.coverUrl && it.genres && it.genres.length > 0 && it.description)
        return false;
      try {
        if (sessionStorage.getItem(`wv-poster-skip-${it.id}`)) return false;
      } catch {}
      return true;
    });

    if (missing.length === 0) return;
    const batch = missing.slice(0, 4);
    batch.forEach((it) => {
      syncingRefs.current.add(it.id);
      ensureCover(it);
    });
  }, [renderItems, ready, ensureCover, syncingRefs]);

  const openFromTmdb = useCallback(
    async (result: TMDBSearchResult) => {
      const now = Date.now();
      const newItem: Item = {
        id: crypto.randomUUID?.() ?? Math.random().toString(16).slice(2),
        title: result.title,
        mediaType,
        status: mode === "wishlist" ? "wishlist" : "watched",
        favorite: false,
        year: result.year ?? undefined,
        coverUrl: result.posterUrl
          ? result.posterUrl.replace("/w185/", "/w780/")
          : undefined,
        genres: result.genres,
        description: result.overview ?? undefined,
        createdAt: now,
        updatedAt: now,
      } as Item;

      await handleUpsert({
        title: newItem.title,
        mediaType: newItem.mediaType,
        status: newItem.status as Status,
        favorite: newItem.favorite,
        year: newItem.year,
        coverUrl: newItem.coverUrl,
        genres: newItem.genres,
        description: newItem.description,
      });
    },
    [mediaType, mode, handleUpsert],
  );

  const openEdit = useCallback((it: Item) => {
    setEditing({ ...it });
    setEditOpen(true);
  }, []);

  const basePath = mode === "wishlist" ? "/wishlist" : "/library";
  const SUB_TABS = [
    { href: `${basePath}/movies`, label: "Movies", icon: Film },
    { href: `${basePath}/tv`, label: "TV Shows", icon: Tv },
    { href: `${basePath}/anime`, label: "Anime", icon: Sparkles },
  ];

  const activeBorderClass =
    mediaType === "movie"
      ? "border-tui-amber"
      : mediaType === "tv"
        ? "border-tui-purple"
        : "border-tui-green";
  const mediaPath = mediaType === "movie" ? "movies" : mediaType;

  const isRetro = mounted && theme.startsWith("retro");

  return (
    <div
      className={`w-full min-h-screen bg-tui-bg text-tui-text ${
        isRetro
          ? `retro-container ${!mounted || scanlines ? "retro-scanlines" : ""}`
          : "font-sans"
      } pb-10`}
    >
      <div className="relative z-10 mx-auto max-w-[1440px] px-6 lg:px-10 pt-8 pb-10">
        {/* Monospace Sub-Tabs Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center border border-tui-border bg-tui-panel p-2 gap-2 mb-6">
          {/* Left side: Media types */}
          <div className="flex flex-wrap gap-1">
            {SUB_TABS.map((tab) => {
              const isActive = pathname?.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`px-5 py-2.5 text-xs font-mono uppercase border transition-all ${
                    isActive
                      ? `${activeBorderClass} bg-tui-input text-tui-text font-bold`
                      : "border-transparent text-tui-text-muted hover:text-tui-text hover:bg-tui-input/30"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <tab.icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-1 border-t sm:border-t-0 border-tui-border-muted pt-2 sm:pt-0">
            <Link
              href={`/library/${mediaPath}`}
              onClick={() => {
                setOnlyFav(false);
              }}
              className={`px-5 py-2.5 text-xs font-mono uppercase border transition-all ${
                mode === "library" && !onlyFav
                  ? "border-tui-green bg-tui-input text-tui-green font-bold"
                  : "border-transparent text-tui-text-muted hover:text-tui-text hover:bg-tui-input/30"
              }`}
            >
              [ WATCHED ]
            </Link>

            <Link
              href={`/wishlist/${mediaPath}`}
              onClick={() => {
                setOnlyFav(false);
              }}
              className={`px-5 py-2.5 text-xs font-mono uppercase border transition-all ${
                mode === "wishlist" && !onlyFav
                  ? "border-tui-purple bg-tui-input text-tui-purple font-bold"
                  : "border-transparent text-tui-text-muted hover:text-tui-text hover:bg-tui-input/30"
              }`}
            >
              [ WISHLISTED ]
            </Link>

            <button
              onClick={() => {
                setOnlyFav(!onlyFav);
              }}
              className={`px-5 py-2.5 text-xs font-mono uppercase border transition-all cursor-pointer flex items-center gap-1.5 ${
                onlyFav
                  ? "border-tui-amber bg-tui-input text-tui-amber font-bold"
                  : "border-transparent text-tui-text-muted hover:text-tui-text hover:bg-tui-input/30"
              }`}
            >
              <Star
                className={`h-3.5 w-3.5 ${onlyFav ? "fill-current" : ""}`}
              />
              <span>FAVORITES</span>
            </button>
          </div>
        </div>

        {/* TUI Stats Grid */}
        <div className="grid grid-cols-3 border border-tui-border bg-tui-input font-mono mb-6 divide-x divide-tui-border text-center">
          <div className="py-3">
            <div className="text-[10px] text-tui-text-muted uppercase tracking-widest">
              TOTAL TITLES
            </div>
            <div className="text-lg font-bold text-tui-text">
              {pageItems.length}
            </div>
          </div>
          <div className="py-3">
            <div className="text-[10px] text-tui-text-muted uppercase tracking-widest">
              WATCHED
            </div>
            <div className="text-lg font-bold text-tui-green">
              {pageItems.filter((it) => it.status === "watched").length}
            </div>
          </div>
          <div className="py-3">
            <div className="text-[10px] text-tui-text-muted uppercase tracking-widest">
              WISHLIST
            </div>
            <div className="text-lg font-bold text-tui-purple">
              {pageItems.filter((it) => it.status === "wishlist").length}
            </div>
          </div>
        </div>

        {/* TUI Toolbar Controls */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 border border-tui-border bg-tui-input font-mono text-xs">
            {/* Left toolbar: Search TMDB and Import */}
            <div className="flex items-center gap-4 flex-wrap">
              <TmdbSearchInput
                mediaType={mediaType}
                onSelect={openFromTmdb}
                placeholder={`+ ADD TMDB TITLE...`}
              />
              <button
                onClick={() => setImportOpen(true)}
                className="px-3 py-1.5 border border-tui-border text-tui-text-muted bg-tui-panel hover:border-tui-text hover:text-tui-text transition-all uppercase animate-none"
              >
                [IMPORT]
              </button>
            </div>

            {/* Right toolbar: Sort, Favorites, View Mode, Scanlines */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Sort selection */}
              <SortDropdown value={sort} onChange={setSort} />

              {/* Genre selection */}
              {allGenres.length > 0 && (
                <GenreDropdown
                  value={genreFilter}
                  onChange={setGenreFilter}
                  allGenres={allGenres}
                />
              )}

              {/* View Mode Toggle */}
              <button
                onClick={() =>
                  handleSetViewMode(viewMode === "grid" ? "table" : "grid")
                }
                className="px-3 py-1.5 border border-tui-border text-tui-text-muted bg-tui-panel hover:border-tui-text hover:text-tui-text transition-all"
              >
                {mounted && viewMode === "table" ? "[:: GRID]" : "[= LIST]"}
              </button>

              {/* Scanlines Toggle */}
              <button
                onClick={() => setScanlines(!scanlines)}
                className={`px-3 py-1.5 border transition-all ${
                  mounted && !scanlines
                    ? "border-red-950 text-red-500 bg-red-950/10 hover:border-red-900"
                    : "border-tui-border text-tui-text-muted bg-tui-panel hover:border-tui-text hover:text-tui-text"
                }`}
              >
                {mounted && !scanlines ? "[CRT: OFF]" : "[CRT: ON]"}
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative font-mono">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-tui-text-muted/60 text-xs">
              SEARCH &gt;
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search your library"
              placeholder="QUERY TITLE, GENRES, YEARS..."
              className="w-full bg-tui-input border border-tui-border pl-24 pr-10 py-2.5 text-xs text-tui-text placeholder:text-tui-text-muted/30 focus:border-tui-text focus:bg-tui-input outline-none transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-tui-text-muted hover:text-tui-text"
              >
                [X]
              </button>
            )}
          </div>
        </div>

        {/* Media display grid/table */}

        <AnimatePresence mode="wait">
          {!mounted || (!ready && items.length === 0) ? (
            <SkeletonGrid count={24} cols="lg:grid-cols-5 xl:grid-cols-6" />
          ) : renderItems.length > 0 ? (
            mounted && viewMode === "table" ? (
              <motion.div
                key="table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-x-auto border border-tui-border bg-tui-panel mb-10"
              >
                <table className="retro-table">
                  <thead>
                    <tr>
                      <th className="w-16">POSTER</th>
                      <th>TITLE</th>
                      <th>YEAR</th>
                      <th>GENRES</th>
                      <th>STATUS</th>
                      <th className="text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderItems.map((item) => {
                      const isMovie = item.mediaType === "movie";
                      const isTv = item.mediaType === "tv";
                      const badgeColor = isMovie
                        ? "border-tui-amber/30 text-tui-amber bg-tui-amber/5"
                        : isTv
                          ? "border-tui-purple/30 text-tui-purple bg-tui-purple/5"
                          : "border-tui-green/30 text-tui-green bg-tui-green/5";
                      return (
                        <tr key={item.id} className="group">
                          <td>
                            <div
                              className="w-10 h-14 bg-tui-input border border-tui-border overflow-hidden cursor-pointer"
                              onClick={() => setExpandedItem(item)}
                            >
                              {item.coverUrl ? (
                                <TMDBImage
                                  src={item.coverUrl}
                                  alt={item.title}
                                  fill
                                  className="w-full h-full object-cover filter brightness-90 group-hover:brightness-100 transition-all"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[8px] text-tui-text-muted/60">
                                  N/A
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div
                              className="font-bold text-tui-text hover:text-tui-amber cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
                              onClick={() => setExpandedItem(item)}
                            >
                              <span>{item.title}</span>
                              {item.favorite && (
                                <Star className="h-3.5 w-3.5 fill-current text-tui-amber shrink-0" />
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="text-tui-text/80">
                              {item.year || "N/A"}
                            </span>
                          </td>
                          <td>
                            <span className="text-tui-text-muted text-[11px] uppercase">
                              {item.genres?.join(", ") || "NONE"}
                            </span>
                          </td>
                          <td>
                            <span className={`retro-badge ${badgeColor}`}>
                              {statusText(item.status)}
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleToggleFav(item.id)}
                                className={`px-2 py-1 border text-[10px] uppercase transition-all flex items-center justify-center ${
                                  item.favorite
                                    ? "border-tui-amber text-tui-amber bg-tui-amber/10"
                                    : "border-tui-border text-tui-text-muted bg-tui-panel hover:border-tui-text hover:text-tui-text"
                                }`}
                              >
                                <Star
                                  className={`h-3 w-3 ${item.favorite ? "fill-current" : ""}`}
                                />
                              </button>
                              <button
                                onClick={() => openEdit(item)}
                                className="px-2 py-1 border border-tui-border text-tui-text-muted bg-tui-panel hover:border-tui-text hover:text-tui-text transition-all text-[10px] uppercase"
                              >
                                EDIT
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="px-2 py-1 border border-tui-border text-tui-text-muted bg-tui-panel hover:border-red-900/50 hover:text-red-400 transition-all text-[10px] uppercase"
                              >
                                DEL
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {visibleCount < filtered.length && (
                      <tr>
                        <td
                          colSpan={6}
                          ref={loadMoreRef}
                          className="h-10 text-center text-tui-text-muted/60 uppercase text-[10px]"
                        >
                          [ LOADING MORE TITLES ]
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-8 pb-10"
              >
                {renderItems.map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    onOpen={() => setExpandedItem(item)}
                    onEdit={() => openEdit(item)}
                    onDelete={() => handleDelete(item.id)}
                    onFav={() => handleToggleFav(item.id)}
                  />
                ))}
                {visibleCount < filtered.length && (
                  <div
                    ref={loadMoreRef}
                    className="col-span-full h-20 w-full"
                  />
                )}
              </motion.div>
            )
          ) : (
            <div
              key="empty"
              className="flex h-[40vh] items-center justify-center text-center w-full"
            >
              <EmptyState
                icon={
                  mode === "wishlist" ? (
                    <Heart className="h-8 w-8 text-tui-text-muted" />
                  ) : (
                    <Film className="h-8 w-8 text-tui-text-muted" />
                  )
                }
                headline={
                  mode === "wishlist"
                    ? "Your wishlist directory is empty"
                    : "No titles found in database"
                }
                subtext={
                  mode === "wishlist"
                    ? "Search and add titles to begin building your watchlist queue."
                    : "No media matches the current filters. Adjust your query or import new items."
                }
                ctaLabel={
                  mode === "wishlist"
                    ? "+ Add Wishlist Title"
                    : "+ Add Media Title"
                }
                onCta={() => {
                  // Trigger TMDB search focus
                  const inputEl = document.querySelector(
                    'input[placeholder*="ADD TMDB TITLE"]',
                  ) as HTMLInputElement;
                  if (inputEl) {
                    inputEl.focus();
                  } else {
                    setImportOpen(true);
                  }
                }}
              />
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {expandedItem && (
            <ExpandableCardOverlay
              key={expandedItem.id}
              item={expandedItem}
              onClose={() => setExpandedItem(null)}
              onEdit={() => {
                const it = expandedItem;
                setExpandedItem(null);
                openEdit(it);
              }}
              onDelete={() => {
                handleDelete(expandedItem.id);
                setExpandedItem(null);
              }}
              onFav={() => {
                handleToggleFav(expandedItem.id);
                setExpandedItem((prev) =>
                  prev ? { ...prev, favorite: !prev.favorite } : null,
                );
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      {editOpen && editing && (
        <EditorModal
          item={editing}
          onClose={() => {
            setEditOpen(false);
            setEditing(null);
          }}
          onChange={(next) => setEditing(next)}
          onSave={(payload) => {
            const exists = items.some((x) => x.id === editing.id);
            handleUpsert(payload, exists ? editing.id : undefined);
            setEditOpen(false);
            setEditing(null);
          }}
          onDelete={() => {
            handleDelete(editing.id);
            setEditOpen(false);
            setEditing(null);
          }}
        />
      )}

      {importOpen && (
        <ImportModal
          defaultMediaType={mediaType}
          onClose={() => setImportOpen(false)}
          onImport={(newItems) => {
            handleImport(newItems);
            setImportOpen(false);
          }}
        />
      )}
    </div>
  );
}
