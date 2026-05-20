'use client';

import React, { useState, useCallback, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import type { Item, MediaType, Status } from '@/lib/types';
import { getItems } from '@/app/actions/items';
import MediaCard from '@/components/MediaCard';
import EditorModal from '@/components/EditorModal';
import ImportModal from '@/components/ImportModal';
import TmdbSearchInput from '@/components/TmdbSearchInput';
import type { TMDBSearchResult } from '@/lib/tmdb';
import ExpandableCardOverlay from '@/components/ExpandableCardOverlay';
import { useSession } from '@/components/SessionProvider';
import { useLibraryData } from '@/hooks/useLibraryData';
import { useLibraryFilters } from '@/hooks/useLibraryFilters';
import {
  Film,
  Tv,
  Sparkles,
  Search,
  Download,
  Star,
  ArrowUpDown,
  X,
  ChevronDown,
} from 'lucide-react';

const SORT_OPTIONS: { value: 'recent' | 'title' | 'year'; label: string }[] = [
  { value: 'recent', label: 'Recently added' },
  { value: 'title', label: 'Name (A → Z)' },
  { value: 'year', label: 'Release year' },
];

function SortDropdown({ value, onChange }: { value: string; onChange: (v: 'recent' | 'title' | 'year') => void }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function keyHandler(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, []);

  const current = SORT_OPTIONS.find((o) => o.value === value)?.label ?? value;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium tracking-tight transition-all duration-200 border ${
          open
            ? 'bg-white/[0.10] text-white border-white/[0.14]'
            : 'bg-white/[0.04] text-white/50 border-white/[0.07] hover:bg-white/[0.07] hover:text-white/75 hover:border-white/[0.10]'
        }`}
      >
        <ArrowUpDown className="h-3 w-3" />
        <span className="hidden sm:inline">{current}</span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full mt-2 z-50 min-w-[180px] overflow-hidden rounded-xl bg-[#111]/95 backdrop-blur-2xl border border-white/[0.08] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7)]"
          >
            {SORT_OPTIONS.map((opt) => {
              const active = opt.value === value;
              return (
                <button
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-[13px] font-medium tracking-tight transition-all duration-150 ${
                    active ? 'bg-white/[0.10] text-white' : 'text-white/60 hover:bg-white/[0.06] hover:text-white'
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

export default function LibraryPage({
  mediaType,
  title,
  mode = 'library',
}: {
  mediaType: MediaType;
  title: string;
  mode?: 'library' | 'wishlist';
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userId = session?.user?.id || 'guest';

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

  const [, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<Item | null>(null);

  // Poster enrichment for visible items
  useEffect(() => {
    if (!ready || renderItems.length === 0) return;

    const missing = renderItems.filter((it) => {
      if (syncingRefs.current.has(it.id)) return false;
      if (it.coverUrl && it.genres && it.genres.length > 0 && it.description) return false;
      try { if (sessionStorage.getItem(`wv-poster-skip-${it.id}`)) return false; } catch {}
      return true;
    });

    if (missing.length === 0) return;
    const batch = missing.slice(0, 4);
    batch.forEach((it) => {
      syncingRefs.current.add(it.id);
      ensureCover(it);
    });
  }, [renderItems, ready, ensureCover, syncingRefs]);

  const openFromTmdb = useCallback(async (result: TMDBSearchResult) => {
    const now = Date.now();
    const newItem: Item = {
      id: crypto.randomUUID?.() ?? Math.random().toString(16).slice(2),
      title: result.title,
      mediaType,
      status: mode === 'wishlist' ? 'wishlist' : 'watched',
      favorite: false,
      year: result.year ?? undefined,
      coverUrl: result.posterUrl ? result.posterUrl.replace('/w185/', '/w780/') : undefined,
      genres: result.genres,
      description: result.overview ?? undefined,
      createdAt: now,
      updatedAt: now,
    } as Item;

    const res = await handleUpsert({
      title: newItem.title,
      mediaType: newItem.mediaType,
      status: newItem.status as Status,
      favorite: newItem.favorite,
      year: newItem.year,
      coverUrl: newItem.coverUrl,
      genres: newItem.genres,
      description: newItem.description,
    });
  }, [mediaType, mode, handleUpsert]);

  const openEdit = useCallback((it: Item) => {
    setEditing({ ...it });
    setEditOpen(true);
  }, []);

  const currentAccent = mediaType === 'movie' ? '#FF3864' : mediaType === 'tv' ? '#A855F7' : '#38BDF8';

  const basePath = mode === 'wishlist' ? '/wishlist' : '/library';
  const SUB_TABS = [
    { href: `${basePath}/movies`, label: 'Movies', icon: Film },
    { href: `${basePath}/tv`, label: 'TV Shows', icon: Tv },
    { href: `${basePath}/anime`, label: 'Anime', icon: Sparkles },
  ];

  return (
    <div className="w-full text-white">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-56 z-0"
        style={{
          background: `radial-gradient(ellipse 80% 100% at 50% 0%, ${currentAccent}10, transparent 60%)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1440px] px-6 lg:px-10 pt-8 pb-10">
        <div className="flex flex-col gap-4 mb-8">
          {/* Sub-Tabs mobile */}
          <div className="md:hidden flex items-center">
            <div className="inline-flex items-center gap-1 rounded-2xl bg-white/[0.04] border border-white/[0.07] p-1.5">
              <LayoutGroup id="sub-tabs">
                {SUB_TABS.map((tab) => {
                  const isActive = pathname?.startsWith(tab.href);
                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-medium tracking-tight transition-colors duration-200 select-none ${
                        isActive ? 'text-white' : 'text-white/40 hover:text-white/65'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sub-tab-pill"
                          className="absolute inset-0 rounded-xl"
                          style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.10)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                          }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <tab.icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.label === 'TV Shows' ? 'TV' : tab.label}</span>
                      </span>
                    </Link>
                  );
                })}
              </LayoutGroup>
            </div>
          </div>

          {/* Title + actions */}
          <div className="flex items-center justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="min-w-0"
            >
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-none">
                {title}
              </h1>
              <div className="text-[13px] text-white/30 mt-1.5 h-5 flex items-center">
                {!mounted || (!ready && items.length === 0) ? (
                  <div className="h-4 w-32 bg-white/[0.05] rounded animate-pulse" />
                ) : (
                  <>{pageItems.length} {pageItems.length === 1 ? 'title' : 'titles'} in your {mode === 'wishlist' ? 'wishlist' : 'collection'}</>
                )}
              </div>
            </motion.div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="relative z-50 flex items-center gap-2">
                <TmdbSearchInput
                  mediaType={mediaType}
                  onSelect={openFromTmdb}
                  placeholder={`Add ${mediaType === 'movie' ? 'movie' : mediaType === 'tv' ? 'TV show' : 'anime'}…`}
                />
                <button
                  onClick={() => setImportOpen(true)}
                  className="flex items-center justify-center h-8 w-8 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/40 hover:text-white/80 hover:bg-white/[0.08] hover:border-white/[0.10] transition-all duration-200"
                  aria-label="Import Data"
                  title="Import data"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>

              <div className="w-px h-5 bg-white/[0.06] mx-0.5 hidden sm:block" />

              <SortDropdown value={sort} onChange={setSort} />

              {mode === 'library' && (
                <button
                  onClick={() => setOnlyFav((v) => !v)}
                  className={`flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium tracking-tight transition-all duration-200 border ${
                    onlyFav
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.1)]'
                      : 'bg-white/[0.04] text-white/50 border-white/[0.07] hover:bg-white/[0.07] hover:text-white/75 hover:border-white/[0.10]'
                  }`}
                >
                  <Star className={`h-3 w-3 ${onlyFav ? 'text-amber-400 fill-amber-400' : ''}`} />
                  <span className="hidden sm:inline">Favorites</span>
                </button>
              )}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles, genres, years..."
              className="w-full rounded-xl bg-white/[0.03] border border-white/[0.07] pl-11 pr-4 py-2 text-[13px] font-medium tracking-tight text-white placeholder:text-white/25 outline-none focus:border-white/[0.16] focus:bg-white/[0.05] backdrop-blur-sm transition-all duration-300"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Genre chips */}
          {allGenres.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {allGenres.map((g) => (
                <button
                  key={g}
                  onClick={() => setGenreFilter(genreFilter === g ? null : g)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 border ${
                    genreFilter === g
                      ? 'bg-white/10 text-white border-white/15'
                      : 'text-white/30 hover:text-white/50 hover:bg-white/[0.04] border-transparent'
                  }`}
                >
                  {g}
                </button>
              ))}
              {genreFilter && (
                <button
                  onClick={() => setGenreFilter(null)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-rose-400/70 hover:text-rose-400 border border-rose-500/20 hover:border-rose-500/30 transition-all duration-200"
                >
                  Clear genre
                </button>
              )}
            </div>
          )}
        </div>

        {/* Media Grid */}
        <LayoutGroup id="media-grid">
          <AnimatePresence>
            <motion.div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-8 pb-10">
              {!mounted || (!ready && items.length === 0) ? (
                <>
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={`skeleton-${i}`} className="aspect-[2/3] w-full rounded-2xl bg-white/[0.02] animate-pulse" />
                  ))}
                </>
              ) : renderItems.length > 0 ? (
                <>
                  {renderItems.map((item) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      layoutId={`card-${item.id}`}
                      onOpen={() => setExpandedItem(item)}
                      onEdit={() => openEdit(item)}
                      onDelete={() => handleDelete(item.id)}
                      onFav={() => handleToggleFav(item.id)}
                    />
                  ))}
                  {visibleCount < filtered.length && (
                    <div ref={loadMoreRef} className="col-span-full h-20 w-full" />
                  )}
                </>
              ) : (
                <div className="flex h-[40vh] items-center justify-center text-center col-span-full">
                  <div className="max-w-md">
                    <div className="mb-4 text-6xl opacity-40">{mode === 'wishlist' ? '⭐' : '🎬'}</div>
                    <h3 className="text-xl font-medium text-white/90">No titles found</h3>
                    <p className="mt-2 text-sm text-white/50">
                      {mode === 'wishlist'
                        ? 'Your wishlist is empty. Search and add titles you want to watch!'
                        : 'Try adjusting your filters or search query, or add something new to your library.'}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {expandedItem && (
              <ExpandableCardOverlay
                key={expandedItem.id}
                item={expandedItem}
                layoutId={`card-${expandedItem.id}`}
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
                  setExpandedItem((prev) => (prev ? { ...prev, favorite: !prev.favorite } : null));
                }}
              />
            )}
          </AnimatePresence>
        </LayoutGroup>
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
