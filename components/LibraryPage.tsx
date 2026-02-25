'use client';

import React, { useEffect, useMemo, useState, useCallback, useTransition, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import type { Item, MediaType, Status } from '@/lib/types';
import { getItems, upsertItem, deleteItem, toggleFavorite, importItems as importItemsAction, updateMetadata } from '@/app/actions/items';
import { fetchPoster } from '@/lib/poster';
import MediaCard from '@/components/MediaCard';
import EditorModal from '@/components/EditorModal';
import ImportModal from '@/components/ImportModal';
import { useSession } from '@/components/SessionProvider';
import {
  Film,
  Tv,
  Sparkles,
  Search,
  Plus,
  Download,
  ArrowLeft,
  Star,
  SlidersHorizontal,
  X,
  LayoutDashboard,
} from 'lucide-react';

/* ─── Types ─── */
type SelectOption<T extends string> = { value: T; label: string };

/* ─── Glass Select dropdown ─── */
function GlassSelect<T extends string>({
  value,
  onChange,
  options,
  className = '',
  align = 'left',
  minWidth = 140,
  buttonLabelPrefix,
}: {
  value: T;
  onChange: (v: T) => void;
  options: SelectOption<T>[];
  className?: string;
  align?: 'left' | 'right';
  minWidth?: number;
  buttonLabelPrefix?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    function onMouse(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (!target.closest("[data-glass-select-root='true']")) setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onMouse);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onMouse);
    };
  }, []);

  const current = options.find((o) => o.value === value)?.label ?? value;
  const buttonText = buttonLabelPrefix ? `${buttonLabelPrefix}: ${current}` : current;

  return (
    <div data-glass-select-root="true" className={'relative inline-block ' + className}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="
          liquid-glass liquid-glass-round liquid-glass-hover liquid-glass-press
          flex items-center justify-between gap-2
          px-4 py-2
          text-sm font-medium tracking-tight
          text-white/80
          transition
        "
        style={{ minWidth }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{buttonText}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/50 text-xs"
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            role="listbox"
            className={[
              'absolute z-50 mt-2 w-full overflow-hidden rounded-xl',
              'bg-black/70 backdrop-blur-2xl ring-1 ring-white/10 shadow-2xl',
              align === 'right' ? 'right-0' : 'left-0',
            ].join(' ')}
          >
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={[
                    'w-full text-left px-3 py-2.5 text-sm font-medium tracking-tight',
                    'transition-all duration-200',
                    active ? 'bg-white/[0.12] text-white' : 'text-white/70',
                    'hover:bg-white/[0.08] hover:text-white',
                  ].join(' ')}
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

/* ─── Nav links data ─── */
const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, accent: '#A855F7' },
  { href: '/movies', label: 'Movies', icon: Film, accent: '#FF3864' },
  { href: '/tv', label: 'TV Shows', icon: Tv, accent: '#A855F7' },
  { href: '/anime', label: 'Anime', icon: Sparkles, accent: '#38BDF8' },
];

/* ─── Status tabs ─── */
const STATUS_TABS: { value: Status | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'watched', label: 'Watched' },
  { value: 'pending', label: 'Pending' },
  { value: 'wishlist', label: 'Wishlisted' },
];

/* ─── Sort options ─── */
const SORT_OPTIONS: SelectOption<'recent' | 'title' | 'year'>[] = [
  { value: 'recent', label: 'Recently added' },
  { value: 'title', label: 'Name (A → Z)' },
  { value: 'year', label: 'Release year' },
];

export default function LibraryPage({ mediaType, title }: { mediaType: MediaType; title: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userId = session?.user?.id || 'guest';
  const [items, setItems] = useState<Item[]>([]);
  const [ready, setReady] = useState(false);

  const [status, setStatus] = useState<Status | 'all'>('all');
  const [query, setQuery] = useState('');
  const [onlyFav, setOnlyFav] = useState(false);
  const [sort, setSort] = useState<'recent' | 'title' | 'year'>('recent');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const [, startTransition] = useTransition();

  const [visibleCount, setVisibleCount] = useState(30);

  // Reset infinite scroll whenever filters change
  useEffect(() => {
    setVisibleCount(30);
  }, [status, onlyFav, query, sort, mediaType]);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) observerRef.current.disconnect();
    if (node) {
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 30);
        }
      }, { rootMargin: '1200px' });
      observerRef.current.observe(node);
    }
  }, []);

  /* ── Data loading from server & cache ── */
  useEffect(() => {
    // 1. Instantly parse and display cache
    try {
      const cached = localStorage.getItem(`wv-cache-items-${userId}`);
      if (cached) {
        setItems(JSON.parse(cached));
        setReady(true);
      }
    } catch { }

    // 2. Fetch fresh from DB in background
    getItems().then((dbItems) => {
      setItems(dbItems);
      setReady(true);
    }).catch(() => {
      setReady((prev) => prev || true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // 3. Keep cache strictly in sync with local optimistic changes
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(`wv-cache-items-${userId}`, JSON.stringify(items));
    } catch { }
  }, [items, ready, userId]);

  const refreshItems = useCallback(() => {
    getItems().then(setItems).catch(() => { });
  }, []);

  /* ── Filtering & sorting ── */
  const pageItems = useMemo(() => items.filter((i) => i.mediaType === mediaType), [items, mediaType]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = pageItems.slice();

    if (status !== 'all') arr = arr.filter((i) => i.status === status);
    if (onlyFav) arr = arr.filter((i) => i.favorite);

    if (q) {
      arr = arr.filter((i) => {
        const g = (i.genres ?? []).join(' ').toLowerCase();
        return (
          i.title.toLowerCase().includes(q) ||
          (i.year?.toString().includes(q) ?? false) ||
          g.includes(q) ||
          (i.notes ?? '').toLowerCase().includes(q)
        );
      });
    }

    if (sort === 'recent') arr.sort((a, b) => b.updatedAt - a.updatedAt);
    if (sort === 'title') arr.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'year') arr.sort((a, b) => (b.year ?? -1) - (a.year ?? -1));

    return arr;
  }, [pageItems, status, onlyFav, query, sort]);

  /* ── Counts per status ── */
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: pageItems.length };
    for (const tab of STATUS_TABS) {
      if (tab.value !== 'all') {
        counts[tab.value] = pageItems.filter((i) => i.status === tab.value).length;
      }
    }
    return counts;
  }, [pageItems]);

  /* ── Callbacks ── */
  const ensureCover = useCallback(async (it: Item): Promise<void> => {
    if (it.coverUrl && it.genres && it.genres.length > 0) return;
    const fetchResult = await fetchPoster(it.title, it.mediaType, it.year);
    if (!fetchResult) {
      try { sessionStorage.setItem(`wv-poster-skip-${it.id}`, '1'); } catch { }
      return;
    }

    const { coverUrl, genres } = fetchResult;
    const hasNewCover = !it.coverUrl && coverUrl;
    const hasNewGenres = (!it.genres || it.genres.length === 0) && genres && genres.length > 0;

    if (!hasNewCover && !hasNewGenres) {
      try { sessionStorage.setItem(`wv-poster-skip-${it.id}`, '1'); } catch { }
      return;
    }

    // Update locally for instant UI, then persist to DB
    setItems((prev) => prev.map((x) =>
      x.id === it.id
        ? {
          ...x,
          ...(hasNewCover ? { coverUrl } : {}),
          ...(hasNewGenres ? { genres } : {}),
          updatedAt: Date.now()
        }
        : x
    ));

    startTransition(() => {
      updateMetadata(it.id, {
        ...(hasNewCover ? { coverUrl } : {}),
        ...(hasNewGenres ? { genres } : {})
      });
    });
  }, []);

  /* ── Background Sync for Missing Covers/Genres ── */
  const syncingRefs = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!ready || items.length === 0) return;

    // Find items that need metadata and aren't being synced yet
    const missing = items.filter((it) => {
      if (syncingRefs.current.has(it.id)) return false;
      if (it.coverUrl && it.genres && it.genres.length > 0) return false;
      try { if (sessionStorage.getItem(`wv-poster-skip-${it.id}`)) return false; } catch { }
      return true;
    });

    if (missing.length === 0) return;

    // Process in batches (6 at a time) — cache hits are instant, so larger batches are fine
    const batch = missing.slice(0, 6);

    batch.forEach((it) => {
      syncingRefs.current.add(it.id);
      ensureCover(it);
    });
  }, [items, ready, ensureCover]);

  const openCreate = useCallback(() => {
    const now = Date.now();
    setEditing({
      id: crypto.randomUUID?.() ?? Math.random().toString(16).slice(2),
      title: '',
      mediaType,
      status: 'watched',
      favorite: false,
      createdAt: now,
      updatedAt: now,
    });
    setEditOpen(true);
  }, [mediaType]);

  const openEdit = useCallback((it: Item) => {
    setEditing({ ...it });
    setEditOpen(true);
  }, []);

  const upsert = useCallback((next: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => {
    const now = Date.now();
    if (id) {
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...next, updatedAt: now } : p)));
      startTransition(() => { upsertItem({ ...next, id }); });
    } else {
      const tempId = crypto.randomUUID?.() ?? String(now);
      setItems((prev) => [{ id: tempId, createdAt: now, updatedAt: now, ...next }, ...prev]);
      startTransition(async () => {
        await upsertItem(next);
        refreshItems();
      });
    }
  }, [refreshItems]);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
    startTransition(() => { deleteItem(id); });
  }, []);

  const toggleFav = useCallback((id: string) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, favorite: !p.favorite, updatedAt: Date.now() } : p)));
    startTransition(() => { toggleFavorite(id); });
  }, []);

  /* ── Current accent color from nav link ── */
  const currentAccent = NAV_LINKS.find((l) => l.href === `/${mediaType === 'movie' ? 'movies' : mediaType === 'tv' ? 'tv' : 'anime'}`)?.accent ?? '#FF3864';

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white">
      {/* Top gradient ambiance */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-56 z-0"
        style={{
          background: `radial-gradient(ellipse 80% 100% at 50% 0%, ${currentAccent}10, transparent 60%)`,
        }}
      />

      {/* ━━━ STICKY HEADER ━━━ */}
      <div className="sticky top-0 z-40 border-b border-white/[0.06]"
        style={{ background: 'rgba(5, 5, 5, 0.75)', backdropFilter: 'blur(20px) saturate(160%)' }}
      >
        <div className="mx-auto w-full max-w-[1600px] px-6 lg:px-10">
          {/* Top row: logo + nav + actions */}
          <div className="flex items-center justify-between py-4 gap-4">
            {/* Left: Back + Logo */}
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="liquid-glass liquid-glass-round liquid-glass-hover liquid-glass-press flex items-center justify-center h-9 w-9"
                title="Go to dashboard"
              >
                <ArrowLeft className="h-4 w-4 text-white/70" />
              </Link>
              <Link
                href="/"
                className="text-lg font-semibold tracking-tight text-white/90 hover:text-white transition-colors duration-200"
              >
                WatchVault
              </Link>
            </div>

            {/* Center: Category pill nav (Raycast-style) */}
            <LayoutGroup>
              <div className="hidden md:flex liquid-glass liquid-glass-pill px-1.5 py-1.5">
                <div className="relative flex items-center gap-0.5">
                  {NAV_LINKS.map((link) => {
                    const isActive = pathname?.startsWith(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`relative z-10 flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium tracking-tight transition-colors duration-200 select-none ${isActive ? 'text-white' : 'text-white/50 hover:text-white/75'
                          }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="lib-nav-pill"
                            className="absolute inset-0 rounded-full bg-white/[0.12]"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                          <link.icon className="h-4 w-4" />
                          {link.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </LayoutGroup>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Search toggle */}
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="liquid-glass liquid-glass-round liquid-glass-hover liquid-glass-press flex items-center justify-center h-9 w-9"
                title="Search"
              >
                {searchOpen ? (
                  <X className="h-4 w-4 text-white/70" />
                ) : (
                  <Search className="h-4 w-4 text-white/70" />
                )}
              </button>

              {/* Filter toggle */}
              <button
                onClick={() => setFiltersOpen((v) => !v)}
                className={`liquid-glass liquid-glass-round liquid-glass-hover liquid-glass-press flex items-center justify-center h-9 w-9 transition-all duration-200 ${filtersOpen ? '!bg-white/[0.12] !border-white/[0.18]' : ''
                  }`}
                title="Filters"
              >
                <SlidersHorizontal className="h-4 w-4 text-white/70" />
              </button>

              {/* Import */}
              <button
                onClick={() => setImportOpen(true)}
                className="liquid-glass liquid-glass-round liquid-glass-hover liquid-glass-press flex items-center justify-center h-9 w-9"
                title="Import"
              >
                <Download className="h-4 w-4 text-white/70" />
              </button>

              {/* Add */}
              <button
                onClick={openCreate}
                className="glass-btn-primary !py-2 !px-4 !text-sm !rounded-xl"
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          <div className="md:hidden pb-3">
            <div className="liquid-glass liquid-glass-pill px-1.5 py-1.5">
              <div className="flex items-center justify-between gap-1">
                {NAV_LINKS.map((link) => {
                  const isActive = pathname?.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex-1 text-center rounded-full px-3 py-2 text-sm font-medium tracking-tight transition-all duration-200 ${isActive ? 'text-white bg-white/[0.12]' : 'text-white/50 hover:text-white/75'
                        }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Search bar (collapsible) */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="pb-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search titles, genres, years..."
                      autoFocus
                      className="
                        w-full rounded-xl
                        bg-white/[0.04] border border-white/[0.08]
                        pl-11 pr-4 py-3
                        text-sm font-medium tracking-tight text-white
                        placeholder:text-white/30
                        outline-none
                        focus:border-white/[0.16] focus:bg-white/[0.06]
                        backdrop-blur-sm
                        transition-all duration-300
                      "
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters bar (collapsible) */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="pb-4 flex flex-wrap items-center gap-3">
                  <GlassSelect value={sort} onChange={setSort} options={SORT_OPTIONS} minWidth={180} buttonLabelPrefix="Sort" />

                  <button
                    onClick={() => setOnlyFav((v) => !v)}
                    className={`liquid-glass liquid-glass-round liquid-glass-hover liquid-glass-press flex items-center gap-2 px-4 py-2 text-sm font-medium tracking-tight transition-all duration-200 ${onlyFav ? '!bg-white/[0.12] !border-white/[0.18] text-white' : 'text-white/70'
                      }`}
                  >
                    <Star className={`h-3.5 w-3.5 ${onlyFav ? 'text-yellow-400' : 'text-white/50'}`} />
                    Favorites
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ━━━ PAGE TITLE + STATUS TABS ━━━ */}
      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-6 lg:px-10 pt-8 pb-2">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-2">
            {title}
          </h1>
          <p className="text-sm text-white/35 mb-8">
            {pageItems.length} {pageItems.length === 1 ? 'item' : 'items'} in your library
          </p>
        </motion.div>

        {/* Raycast-style status tabs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-1 mb-6"
        >
          <LayoutGroup id="status-tabs">
            {STATUS_TABS.map((tab) => {
              const isActive = status === tab.value;
              const count = statusCounts[tab.value] ?? 0;
              return (
                <button
                  key={tab.value}
                  onClick={() => setStatus(tab.value)}
                  className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium tracking-tight transition-colors duration-200 select-none ${isActive ? 'text-white' : 'text-white/40 hover:text-white/65'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="status-tab-bg"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'rgba(255, 255, 255, 0.07)',
                        border: '1px solid rgba(255, 255, 255, 0.10)',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                  <span className={`relative z-10 text-xs ${isActive ? 'text-white/50' : 'text-white/25'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </LayoutGroup>
        </motion.div>
      </div>

      {/* ━━━ MEDIA GRID ━━━ */}
      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-6 lg:px-10 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${status}-${onlyFav}-${sort}-${query}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {filtered.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8">
                  {filtered.slice(0, visibleCount).map((it, i) => (
                    <motion.div
                      key={it.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: i < 20 ? Math.min(i * 0.03, 0.3) : 0,
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <MediaCard
                        item={it}
                        onNeedCover={() => ensureCover(it)}
                        onFav={() => toggleFav(it.id)}
                        onOpen={() => openEdit(it)}
                      />
                    </motion.div>
                  ))}
                </div>
                {visibleCount < filtered.length && (
                  <div ref={loadMoreRef} className="h-16 w-full" aria-hidden="true" />
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="mt-8 rounded-2xl p-12 text-center border border-white/[0.06]"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="text-white/30 text-lg font-medium mb-2">Nothing here yet</div>
                <p className="text-white/20 text-sm mb-6">
                  {query
                    ? 'No results match your search.'
                    : 'Add your first item to start tracking.'}
                </p>
                <button
                  onClick={openCreate}
                  className="glass-btn-primary !py-2.5 !px-6 !text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add {mediaType === 'movie' ? 'Movie' : mediaType === 'tv' ? 'TV Show' : 'Anime'}</span>
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ━━━ MODALS ━━━ */}
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
            upsert(payload, exists ? editing.id : undefined);
            setEditOpen(false);
            setEditing(null);
          }}
          onDelete={() => {
            remove(editing.id);
            setEditOpen(false);
            setEditing(null);
          }}
        />
      )}

      {importOpen && (
        <ImportModal
          onClose={() => setImportOpen(false)}
          onImport={(newItems) => {
            setItems((prev) => {
              const map = new Map<string, Item>();
              for (const p of prev) map.set(`${p.mediaType}::${p.title.toLowerCase()}::${p.year ?? ''}`, p);
              for (const n of newItems) {
                const k = `${n.mediaType}::${n.title.toLowerCase()}::${n.year ?? ''}`;
                if (!map.has(k)) map.set(k, n);
              }
              return Array.from(map.values());
            });
            startTransition(async () => {
              await importItemsAction(newItems.map(n => ({
                title: n.title,
                mediaType: n.mediaType,
                status: n.status,
                favorite: n.favorite,
                genres: n.genres,
                notes: n.notes,
                year: n.year,
                endYear: n.endYear,
                running: n.running,
                coverUrl: n.coverUrl,
                runtime: n.runtime,
              })));
              refreshItems();
            });
            setImportOpen(false);
          }}
        />
      )}
    </div>
  );
}
