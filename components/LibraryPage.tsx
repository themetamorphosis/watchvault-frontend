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
import TmdbSearchInput from '@/components/TmdbSearchInput';
import type { TMDBSearchResult } from '@/lib/tmdb';
import ExpandableCardOverlay from '@/components/ExpandableCardOverlay';
import { useSession } from '@/components/SessionProvider';
import { MobileFilterDrawer } from '@/components/FilterSidebar';
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
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { useOutsideClick } from '@/hooks/use-outside-click';

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
  { href: '/library/movies', label: 'Movies', icon: Film, accent: '#FF3864' },
  { href: '/library/tv', label: 'TV Shows', icon: Tv, accent: '#A855F7' },
  { href: '/library/anime', label: 'Anime', icon: Sparkles, accent: '#38BDF8' },
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
  const [mounted, setMounted] = useState(false);

  const [status, setStatus] = useState<Status | 'all'>('all');
  const [query, setQuery] = useState('');
  const [onlyFav, setOnlyFav] = useState(false);
  const [sort, setSort] = useState<'recent' | 'title' | 'year'>('recent');
  // UI states
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<Item | null>(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  useOutsideClick(addMenuRef, () => {
    if (addMenuOpen) setAddMenuOpen(false);
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const layoutGroupId = React.useId();
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
    setMounted(true);
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

  const renderItems = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

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
    if (it.coverUrl && it.genres && it.genres.length > 0 && it.description) return;

    let fetchResult;
    try {
      fetchResult = await fetchPoster(it.title, it.mediaType, it.year);
    } catch {
      // Backend unreachable — skip silently
      try { sessionStorage.setItem(`wv-poster-skip-${it.id}`, '1'); } catch { }
      return;
    }

    if (!fetchResult) {
      try { sessionStorage.setItem(`wv-poster-skip-${it.id}`, '1'); } catch { }
      return;
    }

    const { coverUrl, genres, description } = fetchResult;
    const hasNewCover = !it.coverUrl && coverUrl;
    const hasNewGenres = (!it.genres || it.genres.length === 0) && genres && genres.length > 0;
    const hasNewDesc = !it.description && description;

    if (!hasNewCover && !hasNewGenres && !hasNewDesc) {
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
          ...(hasNewDesc ? { description } : {})
        }
        : x
    ));

    startTransition(() => {
      updateMetadata(it.id, {
        ...(hasNewCover ? { coverUrl } : {}),
        ...(hasNewGenres ? { genres } : {}),
        ...(hasNewDesc ? { description } : {})
      });
    });
  }, []);

  /* ── Background Sync for Missing Covers/Genres ── */
  const syncingRefs = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!ready || renderItems.length === 0) return;

    // Find items that need metadata and aren't being synced yet
    const missing = renderItems.filter((it) => {
      if (syncingRefs.current.has(it.id)) return false;
      if (it.coverUrl && it.genres && it.genres.length > 0 && it.description) return false;
      try { if (sessionStorage.getItem(`wv-poster-skip-${it.id}`)) return false; } catch { }
      return true;
    });

    if (missing.length === 0) return;

    // Process in batches (4 at a time to keep connection pool light)
    const batch = missing.slice(0, 4);

    batch.forEach((it) => {
      syncingRefs.current.add(it.id);
      ensureCover(it);
    });
  }, [renderItems, ready, ensureCover]);

  const openCreate = useCallback(() => {
    const now = Date.now();
    setEditing({
      id: crypto.randomUUID?.() ?? Math.random().toString(16).slice(2),
      title: '',
      mediaType,
      status: 'pending',
      favorite: false,
      year: new Date().getFullYear(),
      createdAt: now,
      updatedAt: now,
      genres: [],
    } as Item);
    setEditOpen(true);
  }, [mediaType]);

  const openFromTmdb = useCallback(async (result: TMDBSearchResult) => {
    const now = Date.now();
    const newItem: Item = {
      id: crypto.randomUUID?.() ?? Math.random().toString(16).slice(2),
      title: result.title,
      mediaType,
      status: 'pending',
      favorite: false,
      year: result.year ?? undefined,
      coverUrl: result.posterUrl ? result.posterUrl.replace('/w185/', '/w780/') : undefined,
      genres: result.genres,
      description: result.overview ?? undefined,
      createdAt: now,
      updatedAt: now,
    } as Item;

    // Optimistically add to local state
    setItems((prev) => [newItem, ...prev]);

    // Persist to backend
    const res = await upsertItem({
      title: newItem.title,
      mediaType: newItem.mediaType,
      status: newItem.status as Status,
      favorite: newItem.favorite,
      year: newItem.year,
      coverUrl: newItem.coverUrl,
      genres: newItem.genres,
      description: newItem.description,
    });

    if (res.error) {
      // Rollback on failure
      setItems((prev) => prev.filter((i) => i.id !== newItem.id));
    } else {
      // Refresh to get the real saved item with server-generated ID
      const fresh = await getItems();
      const filtered = fresh.filter((i: Item) => i.mediaType === mediaType);
      setItems(filtered);
    }
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
  const currentAccent = NAV_LINKS.find((l) => l.href === `/library/${mediaType === 'movie' ? 'movies' : mediaType === 'tv' ? 'tv' : 'anime'}`)?.accent ?? '#FF3864';

  /* ── Collect unique genres from current page items ── */
  const allGenres = useMemo(() => {
    const s = new Set<string>();
    for (const it of pageItems) {
      for (const g of it.genres ?? []) s.add(g);
    }
    return Array.from(s).sort();
  }, [pageItems]);

  const [genreFilter, setGenreFilter] = useState<string | null>(null);

  /* Override filtered to additionally apply genre */
  const filteredWithGenre = useMemo(() => {
    if (!genreFilter) return filtered;
    return filtered.filter((it) => (it.genres ?? []).includes(genreFilter));
  }, [filtered, genreFilter]);

  const renderItemsFinal = useMemo(() => filteredWithGenre.slice(0, visibleCount), [filteredWithGenre, visibleCount]);

  /* ── Sub-tab nav data ── */
  const SUB_TABS = [
    { href: '/library/movies', label: 'Movies', icon: Film },
    { href: '/library/tv', label: 'TV Shows', icon: Tv },
    { href: '/library/anime', label: 'Anime', icon: Sparkles },
  ];

  return (
    <div className="w-full text-white">
      {/* Top gradient ambiance */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-56 z-0"
        style={{
          background: `radial-gradient(ellipse 80% 100% at 50% 0%, ${currentAccent}10, transparent 60%)`,
        }}
      />

      {/* ── Main Body: Sidebar + Content ── */}
      <div className="relative z-10 mx-auto max-w-[1440px] flex">
        {/* ─ LEFT SIDEBAR ─ */}
        <aside
          className="hidden lg:flex flex-col flex-shrink-0 border-r border-white/[0.05] sticky top-[64px] self-start h-[calc(100vh-64px)] overflow-hidden transition-all duration-300 ease-in-out"
          style={{ width: sidebarOpen ? 260 : 48, minWidth: sidebarOpen ? 260 : 48 }}
        >
          {/* Toggle button */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="flex items-center justify-center h-10 w-full hover:bg-white/[0.04] transition-colors flex-shrink-0 mt-2"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-4 w-4 text-white/40 hover:text-white/70 transition-colors" />
            ) : (
              <PanelLeft className="h-4 w-4 text-white/40 hover:text-white/70 transition-colors" />
            )}
          </button>

          {/* Sidebar content — hidden when collapsed */}
          <div
            className={`flex-1 overflow-y-auto scrollbar-hide px-5 py-4 transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
          >
            {/* Status filters */}
            <div className="mb-8">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-3 px-2">Status</h3>
              <div className="space-y-0.5">
                {STATUS_TABS.map((tab) => {
                  const isActive = status === tab.value;
                  const count = statusCounts[tab.value] ?? 0;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => setStatus(tab.value)}
                      className={`w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-[13px] font-medium tracking-tight transition-all duration-200 ${isActive
                        ? 'bg-white/[0.08] text-white border border-white/[0.08]'
                        : 'text-white/50 hover:text-white/70 hover:bg-white/[0.03] border border-transparent'
                        }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-xs tabular-nums ${isActive ? 'text-white/50' : 'text-white/25'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Favorites */}
            <div className="mb-8">
              <button
                onClick={() => setOnlyFav((v) => !v)}
                className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium tracking-tight transition-all duration-200 border ${onlyFav
                  ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20'
                  : 'text-white/50 hover:text-white/70 hover:bg-white/[0.03] border-transparent'
                  }`}
              >
                <Star className={`h-4 w-4 ${onlyFav ? 'text-yellow-400 fill-yellow-400' : 'text-white/40'}`} />
                Favorites Only
              </button>
            </div>

            {/* Sort */}
            <div className="mb-8">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-3 px-2">Sort By</h3>
              <GlassSelect value={sort} onChange={setSort} options={SORT_OPTIONS} minWidth={200} className="w-full" />
            </div>

            {/* Genres */}
            {allGenres.length > 0 && (
              <div className="mb-8">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-3 px-2">Genres</h3>
                <div className="flex flex-wrap gap-1.5">
                  {allGenres.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGenreFilter(genreFilter === g ? null : g)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${genreFilter === g
                        ? 'bg-white/10 text-white border-white/15'
                        : 'text-white/40 hover:text-white/60 hover:bg-white/[0.04] border-white/[0.06]'
                        }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ─ MAIN CONTENT ─ */}
        <div className="flex-1 min-w-0 px-6 lg:px-10 py-8">
          {/* Title Row + Inline Sub-Tabs */}
          <div className="flex flex-col gap-5 mb-6">
            {/* Sub-Tabs: Movies | TV Shows | Anime — inline pills */}
            <div className="flex items-center">
              <div className="inline-flex items-center gap-1 rounded-2xl bg-white/[0.04] border border-white/[0.07] p-1.5">
                <LayoutGroup id="sub-tabs">
                  {SUB_TABS.map((tab) => {
                    const isActive = pathname?.startsWith(tab.href);
                    return (
                      <Link
                        key={tab.href}
                        href={tab.href}
                        className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-medium tracking-tight transition-colors duration-200 select-none ${isActive ? 'text-white' : 'text-white/40 hover:text-white/65'
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
                          {tab.label}
                        </span>
                      </Link>
                    );
                  })}
                </LayoutGroup>
              </div>
            </div>

            {/* Title + Count + Actions */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  {title}
                </h1>
                <div className="text-sm text-white/35 mt-1 h-5 flex items-center">
                  {!mounted || (!ready && items.length === 0) ? (
                    <div className="h-4 w-32 bg-white/[0.05] rounded animate-pulse" />
                  ) : (
                    <>{pageItems.length} {pageItems.length === 1 ? 'title' : 'titles'} in your collection</>
                  )}
                </div>
              </motion.div>

              {/* Actions: TMDB search + Import + Mobile Filter */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center justify-center h-9 px-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Filters</span>
                </button>

                <div className="relative z-50 flex items-center gap-2" ref={addMenuRef}>
                  <TmdbSearchInput
                    mediaType={mediaType}
                    onSelect={openFromTmdb}
                    placeholder={`Add ${mediaType === 'movie' ? 'movie' : mediaType === 'tv' ? 'TV show' : 'anime'}…`}
                  />

                  <button
                    onClick={() => setAddMenuOpen((v) => !v)}
                    className="flex items-center justify-center h-9 w-9 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200"
                    aria-label="Import"
                    title="Import data"
                  >
                    <Download className="h-4 w-4" />
                  </button>

                  <AnimatePresence>
                    {addMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute right-0 top-full mt-2 w-48 bg-[#151515] border border-white/10 rounded-2xl shadow-2xl p-1.5 origin-top-right overflow-hidden z-[100]"
                      >
                        <button
                          onClick={() => {
                            setAddMenuOpen(false);
                            openCreate();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[14px] font-medium text-white/80 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          Add Manually
                        </button>
                        <button
                          onClick={() => {
                            setAddMenuOpen(false);
                            setImportOpen(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[14px] font-medium text-white/80 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          Import Data
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Search bar (always visible) */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles, genres, years..."
              className="
                w-full rounded-xl
                bg-white/[0.03] border border-white/[0.07]
                pl-11 pr-4 py-3
                text-sm font-medium tracking-tight text-white
                placeholder:text-white/25
                outline-none
                focus:border-white/[0.16] focus:bg-white/[0.05]
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

          {/* Mobile-only: status filter pills (visible below lg) */}
          <div className="lg:hidden mb-6">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-1">
              {STATUS_TABS.map((tab) => {
                const isActive = status === tab.value;
                const count = statusCounts[tab.value] ?? 0;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setStatus(tab.value)}
                    className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-all duration-200 border ${isActive
                      ? 'bg-white/[0.08] text-white border-white/10'
                      : 'text-white/40 hover:text-white/65 border-transparent'
                      }`}
                  >
                    {tab.label}
                    <span className={`text-[10px] ${isActive ? 'text-white/50' : 'text-white/25'}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ━━━ MEDIA GRID ━━━ */}
          <LayoutGroup id="media-grid">
            <AnimatePresence>
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-6 pb-10"
              >
                {!mounted || (!ready && items.length === 0) ? (
                  <>
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={`skeleton-${i}`} className="aspect-[2/3] w-full rounded-2xl bg-white/[0.02] animate-pulse" />
                    ))}
                  </>
                ) : renderItemsFinal.length > 0 ? (
                  <>
                    {renderItemsFinal.map((item) => (
                      <MediaCard
                        key={item.id}
                        item={item}
                        layoutId={`card-${item.id}`}
                        onOpen={() => setExpandedItem(item)}
                        onEdit={() => openEdit(item)}
                        onDelete={() => remove(item.id)}
                        onFav={() => toggleFav(item.id)}
                      />
                    ))}
                    {visibleCount < filteredWithGenre.length && (
                      <div ref={loadMoreRef} className="col-span-full h-20 w-full" />
                    )}
                  </>
                ) : (
                  <div className="flex h-[40vh] items-center justify-center text-center col-span-full">
                    <div className="max-w-md">
                      <div className="mb-4 text-6xl opacity-40">🎬</div>
                      <h3 className="text-xl font-medium text-white/90">No titles found</h3>
                      <p className="mt-2 text-sm text-white/50">
                        Try adjusting your filters or search query, or add something new to your library.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* EXPANDABLE CARD OVERLAY */}
            <AnimatePresence>
              {expandedItem && (
                <ExpandableCardOverlay
                  item={expandedItem}
                  layoutId={`card-${expandedItem.id}`}
                  onClose={() => setExpandedItem(null)}
                  onEdit={() => {
                    const it = expandedItem;
                    setExpandedItem(null);
                    openEdit(it);
                  }}
                  onDelete={() => {
                    remove(expandedItem.id);
                    setExpandedItem(null);
                  }}
                  onFav={() => {
                    toggleFav(expandedItem.id);
                    setExpandedItem((prev) =>
                      prev ? { ...prev, favorite: !prev.favorite } : null
                    );
                  }}
                />
              )}
            </AnimatePresence>
          </LayoutGroup>
        </div>
      </div>

      {/* ━━━ MOBILE FILTER DRAWER ━━━ */}
      <MobileFilterDrawer
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        activeFilter={status}
        onFilterChange={(newStatus: string) => setStatus(newStatus as Status | 'all')}
      />

      {/* ━━━ MODALS ━━━ */}
      {
        editOpen && editing && (
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
        )
      }

      {
        importOpen && (
          <ImportModal
            defaultMediaType={mediaType}
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
        )
      }
    </div >
  );
}
