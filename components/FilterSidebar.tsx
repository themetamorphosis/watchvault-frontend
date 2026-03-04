"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Layers,
    Eye,
    Clock,
    Star,
    Heart,
    List,
    Tag,
    PanelLeftClose,
    PanelLeft,
    X,
    SlidersHorizontal,
} from "lucide-react";

/* ─── Status Filters ─── */
const STATUS_FILTERS = [
    { key: "all", label: "All", icon: Layers, count: null },
    { key: "watched", label: "Watched", icon: Eye, count: 42 },
    { key: "pending", label: "Pending", icon: Clock, count: 18 },
    { key: "wishlist", label: "Wishlist", icon: Star, count: 23 },
    { key: "favorites", label: "Favorites", icon: Heart, count: 12 },
];

/* ─── Dummy Lists ─── */
const MY_LISTS = [
    { name: "Weekend Binge", count: 8 },
    { name: "Classics to Watch", count: 5 },
];

/* ─── Genre Chips ─── */
const GENRES = [
    "Action",
    "Comedy",
    "Drama",
    "Horror",
    "Sci-Fi",
    "Romance",
    "Thriller",
    "Animation",
];

interface FilterSidebarProps {
    activeFilter: string;
    onFilterChange: (key: string) => void;
    collapsed: boolean;
    onToggleCollapse: () => void;
}

export default function FilterSidebar({
    activeFilter,
    onFilterChange,
    collapsed,
    onToggleCollapse,
}: FilterSidebarProps) {
    return (
        <aside className={`filter-sidebar hidden lg:block ${collapsed ? "collapsed" : ""}`}>
            {!collapsed && (
                <>
                    {/* Collapse button */}
                    <div className="flex items-center justify-between mb-6">
                        <span className="filter-group-title">Filters</span>
                        <button
                            onClick={onToggleCollapse}
                            className="flex items-center justify-center h-7 w-7 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors"
                            aria-label="Collapse sidebar"
                        >
                            <PanelLeftClose className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Status Filters */}
                    <div className="mb-8">
                        <div className="filter-group-title">Status</div>
                        <div className="flex flex-col gap-1">
                            {STATUS_FILTERS.map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => onFilterChange(f.key)}
                                    className={`filter-btn ${activeFilter === f.key ? "active" : ""}`}
                                >
                                    <f.icon className="h-4 w-4" />
                                    {f.label}
                                    {f.count !== null && (
                                        <span className="count">{f.count}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* My Lists */}
                    <div className="mb-8">
                        <div className="filter-group-title">My Lists</div>
                        <div className="flex flex-col gap-1">
                            {MY_LISTS.map((l) => (
                                <button key={l.name} className="filter-btn">
                                    <List className="h-4 w-4" />
                                    {l.name}
                                    <span className="count">{l.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Genres */}
                    <div>
                        <div className="filter-group-title">Genres</div>
                        <div className="flex flex-wrap gap-2">
                            {GENRES.map((g) => (
                                <button
                                    key={g}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/35 bg-white/[0.03] border border-white/[0.05] hover:text-white/60 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-200"
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </aside>
    );
}

/* ─── Status tabs for mobile drawer ─── */
const MOBILE_STATUS_TABS: { key: string; label: string; icon: typeof Layers }[] = [
    { key: "all", label: "All", icon: Layers },
    { key: "watched", label: "Watched", icon: Eye },
    { key: "pending", label: "Pending", icon: Clock },
    { key: "wishlist", label: "Wishlisted", icon: Star },
];

/* ─── Mobile Filter Drawer ─── */
export function MobileFilterDrawer({
    open,
    onClose,
    activeFilter,
    onFilterChange,
    statusCounts,
    onlyFav,
    onToggleFav,
    sort,
    onSortChange,
    genres,
    genreFilter,
    onGenreFilterChange,
}: {
    open: boolean;
    onClose: () => void;
    activeFilter: string;
    onFilterChange: (key: string) => void;
    statusCounts?: Record<string, number>;
    onlyFav?: boolean;
    onToggleFav?: () => void;
    sort?: string;
    onSortChange?: (v: string) => void;
    genres?: string[];
    genreFilter?: string | null;
    onGenreFilterChange?: (g: string | null) => void;
}) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="drawer-overlay"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="drawer-panel"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-sm font-semibold text-white/80">
                                Filters
                            </span>
                            <button
                                onClick={onClose}
                                className="flex items-center justify-center h-7 w-7 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Status Filters */}
                        <div className="mb-8">
                            <div className="filter-group-title">Status</div>
                            <div className="flex flex-col gap-1">
                                {MOBILE_STATUS_TABS.map((f) => {
                                    const count = statusCounts?.[f.key] ?? 0;
                                    return (
                                        <button
                                            key={f.key}
                                            onClick={() => {
                                                onFilterChange(f.key);
                                            }}
                                            className={`filter-btn ${activeFilter === f.key ? "active" : ""}`}
                                        >
                                            <f.icon className="h-4 w-4" />
                                            {f.label}
                                            <span className="count">{count}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Favorites */}
                        {onToggleFav && (
                            <div className="mb-8">
                                <button
                                    onClick={onToggleFav}
                                    className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium tracking-tight transition-all duration-200 border ${onlyFav
                                        ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20'
                                        : 'text-white/50 hover:text-white/70 hover:bg-white/[0.03] border-transparent'
                                        }`}
                                >
                                    <Heart className={`h-4 w-4 ${onlyFav ? 'text-yellow-400 fill-yellow-400' : 'text-white/40'}`} />
                                    Favorites Only
                                </button>
                            </div>
                        )}

                        {/* Sort */}
                        {onSortChange && (
                            <div className="mb-8">
                                <div className="filter-group-title">Sort By</div>
                                <div className="flex flex-col gap-1">
                                    {[
                                        { value: 'recent', label: 'Recently added' },
                                        { value: 'title', label: 'Name (A → Z)' },
                                        { value: 'year', label: 'Release year' },
                                    ].map((s) => (
                                        <button
                                            key={s.value}
                                            onClick={() => onSortChange(s.value)}
                                            className={`filter-btn ${sort === s.value ? "active" : ""}`}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Genres */}
                        {genres && genres.length > 0 && onGenreFilterChange && (
                            <div>
                                <div className="filter-group-title">Genres</div>
                                <div className="flex flex-wrap gap-2">
                                    {genres.map((g) => (
                                        <button
                                            key={g}
                                            onClick={() => onGenreFilterChange(genreFilter === g ? null : g)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${genreFilter === g
                                                ? 'bg-white/10 text-white border-white/15'
                                                : 'text-white/35 bg-white/[0.03] border-white/[0.05] hover:text-white/60 hover:bg-white/[0.06] hover:border-white/10'
                                                }`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

/* ─── Expand button (shown when sidebar is collapsed) ─── */
export function SidebarExpandButton({
    onClick,
}: {
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="hidden lg:flex fixed left-4 top-[132px] z-30 items-center justify-center h-8 w-8 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-white/60 hover:bg-white/[0.08] transition-all duration-200"
            aria-label="Expand sidebar"
        >
            <PanelLeft className="h-4 w-4" />
        </button>
    );
}
