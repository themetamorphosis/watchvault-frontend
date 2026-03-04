"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart, Star, Eye, Clock, Bookmark, Film, Tv, Sparkles,
    TrendingUp, BarChart3, Activity, Zap, Search, SlidersHorizontal,
    ChevronRight, Play, Flame, Trophy, MousePointer2, Compass
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   DEMO DATA
   ═══════════════════════════════════════════════════════ */

const POSTERS = [
    { title: "Interstellar", year: 2014, genre: "Sci-Fi", type: "movie", poster: "https://image.tmdb.org/t/p/w342/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", status: "watched" as const, fav: true, rating: 5 },
    { title: "The Godfather", year: 1972, genre: "Drama", type: "movie", poster: "https://image.tmdb.org/t/p/w342/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", status: "watched" as const, fav: true, rating: 5 },
    { title: "John Wick", year: 2014, genre: "Action", type: "movie", poster: "https://m.media-amazon.com/images/M/MV5BMTU2NjA1ODgzMF5BMl5BanBnXkFtZTgwMTM2MTI4MjE@._V1_SX300.jpg", status: "pending" as const, fav: false, rating: 4 },
    { title: "Inception", year: 2010, genre: "Thriller", type: "movie", poster: "https://image.tmdb.org/t/p/w342/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg", status: "watched" as const, fav: true, rating: 5 },
    { title: "Oppenheimer", year: 2023, genre: "History", type: "movie", poster: "https://image.tmdb.org/t/p/w342/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", status: "pending" as const, fav: false, rating: 4 },
    { title: "Blade Runner 2049", year: 2017, genre: "Sci-Fi", type: "movie", poster: "https://image.tmdb.org/t/p/w342/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg", status: "watched" as const, fav: true, rating: 5 },
    { title: "The Matrix", year: 1999, genre: "Sci-Fi", type: "movie", poster: "https://image.tmdb.org/t/p/w342/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", status: "watched" as const, fav: true, rating: 5 },
    { title: "Gladiator", year: 2000, genre: "Action", type: "movie", poster: "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg", status: "pending" as const, fav: false, rating: 4 },
    { title: "Pulp Fiction", year: 1994, genre: "Crime", type: "movie", poster: "https://image.tmdb.org/t/p/w342/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", status: "watched" as const, fav: true, rating: 5 },
    { title: "Fight Club", year: 1999, genre: "Drama", type: "movie", poster: "https://image.tmdb.org/t/p/w342/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", status: "watched" as const, fav: true, rating: 5 },
    { title: "Dune", year: 2021, genre: "Sci-Fi", type: "movie", poster: "https://image.tmdb.org/t/p/w342/d5NXSklXo0qyIYkgV94XAgMIckC.jpg", status: "watched" as const, fav: true, rating: 5 },
    { title: "The Dark Knight", year: 2008, genre: "Action", type: "movie", poster: "https://image.tmdb.org/t/p/w342/qJ2tW6WMUDux911r6m7haRef0WH.jpg", status: "watched" as const, fav: true, rating: 5 },
    { title: "Parasite", year: 2019, genre: "Thriller", type: "movie", poster: "https://image.tmdb.org/t/p/w342/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", status: "pending" as const, fav: true, rating: 5 },
    { title: "Joker", year: 2019, genre: "Drama", type: "movie", poster: "https://image.tmdb.org/t/p/w342/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg", status: "watched" as const, fav: false, rating: 4 },
    { title: "Spider-Man", year: 2018, genre: "Animation", type: "movie", poster: "https://image.tmdb.org/t/p/w342/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg", status: "pending" as const, fav: false, rating: 4 },
    { title: "Mad Max: Fury Road", year: 2015, genre: "Action", type: "movie", poster: "https://image.tmdb.org/t/p/w342/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg", status: "watched" as const, fav: true, rating: 5 },
];

const STATUS_CONFIG = {
    watched: { label: "Watched", color: "text-emerald-400", bg: "bg-emerald-500/20", icon: Eye },
    pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/20", icon: Clock },
    wishlist: { label: "Wishlist", color: "text-violet-400", bg: "bg-violet-500/20", icon: Bookmark },
};

const TABS = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "library", label: "Library", icon: Film },
    { id: "discovery", label: "Discovery", icon: Compass },
] as const;

type TabId = typeof TABS[number]["id"];

/* ═══════════════════════════════════════════════════════
   ANIMATED CURSOR
   ═══════════════════════════════════════════════════════ */
function DemoCursor({ x, y, clicking }: { x: number; y: number; clicking: boolean }) {
    return (
        <motion.div
            className="absolute z-50 pointer-events-none"
            animate={{ x, y }}
            transition={{ type: "spring", stiffness: 120, damping: 20, mass: 0.8 }}
        >
            {/* Cursor shadow */}
            <div className="absolute top-1 left-1 w-5 h-5 bg-black/20 rounded-full blur-sm" />
            {/* Cursor icon */}
            <motion.div
                animate={{ scale: clicking ? 0.75 : 1 }}
                transition={{ duration: 0.1 }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="drop-shadow-lg">
                    <path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="black" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
            </motion.div>
            {/* Click ripple */}
            <AnimatePresence>
                {clicking && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0.6 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute top-0 left-0 w-6 h-6 rounded-full bg-white/30"
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════
   MINI DONUT CHART
   ═══════════════════════════════════════════════════════ */
function MiniDonut({ animate }: { animate: boolean }) {
    const data = [
        { value: 5, color: "#10B981" },
        { value: 2, color: "#F59E0B" },
        { value: 1, color: "#8B5CF6" },
    ];
    const total = 8;
    const r = 38;
    const c = 2 * Math.PI * r;
    let offset = 0;

    return (
        <svg width="100" height="100" viewBox="0 0 100 100">
            {data.map((seg, i) => {
                const len = (seg.value / total) * c;
                const off = c - offset;
                offset += len;
                return (
                    <circle
                        key={i}
                        cx="50" cy="50" r={r}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${len} ${c - len}`}
                        strokeDashoffset={off}
                        style={{
                            transform: "rotate(-90deg)",
                            transformOrigin: "50% 50%",
                            opacity: animate ? 1 : 0,
                            transition: `opacity 0.6s ${0.3 + i * 0.15}s, stroke-dashoffset 1s ${0.3 + i * 0.15}s cubic-bezier(0.25,0.46,0.45,0.94)`,
                        }}
                    />
                );
            })}
            <text x="50" y="47" textAnchor="middle" className="fill-white/80 font-bold" style={{ fontSize: "18px" }}>8</text>
            <text x="50" y="62" textAnchor="middle" className="fill-white/35" style={{ fontSize: "9px" }}>Total</text>
        </svg>
    );
}

/* ═══════════════════════════════════════════════════════
   LIBRARY TAB — sidebar + poster grid (matches actual app)
   ═══════════════════════════════════════════════════════ */
function LibraryTab({ highlightPoster }: { highlightPoster: number | null }) {
    const GENRES = ["Action", "Adventure", "Comedy", "Crime", "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller"];

    return (
        <div className="flex gap-4 h-full">
            {/* ── Left sidebar ── */}
            <div className="w-[140px] flex-shrink-0 space-y-4 border-r border-white/[0.05] pr-4">
                {/* Status filters */}
                <div>
                    <span className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Status</span>
                    <div className="mt-2 space-y-1">
                        {[
                            { label: "All", count: 10, active: true },
                            { label: "Watched", count: 7 },
                            { label: "Pending", count: 2 },
                            { label: "Wishlisted", count: 1 },
                        ].map((s) => (
                            <div key={s.label} className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] transition-all ${s.active ? "bg-white/[0.06] text-white/80" : "text-white/40 hover:bg-white/[0.03]"
                                }`}>
                                <span>{s.label}</span>
                                <span className="text-white/25 tabular-nums">{s.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Favorites */}
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] text-white/40 hover:bg-white/[0.03] cursor-default">
                    <Heart className="h-3 w-3" />
                    <span>Favorites Only</span>
                </div>

                {/* Sort */}
                <div>
                    <span className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Sort By</span>
                    <div className="mt-2 px-2.5 py-2 rounded-md bg-white/[0.04] border border-white/[0.06] text-[11px] text-white/60">
                        Recently added ▾
                    </div>
                </div>

                {/* Genres */}
                <div>
                    <span className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Genres</span>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {GENRES.map((g) => (
                            <span key={g} className="px-2 py-1 rounded text-[9px] text-white/35 bg-white/[0.03] border border-white/[0.05]">{g}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right: content area ── */}
            <div className="flex-1 min-w-0 space-y-4 pr-2">
                {/* Category tabs + search */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        {[
                            { label: "Movies", icon: Film, active: true },
                            { label: "TV Shows", icon: Tv },
                            { label: "Anime", icon: Sparkles },
                        ].map((c) => (
                            <div key={c.label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium ${c.active ? "bg-white/[0.08] text-white/80 border border-white/[0.1]" : "text-white/35"
                                }`}>
                                <c.icon className="h-3 w-3" />
                                {c.label}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[10px] text-white/30">
                        <Search className="h-3 w-3" />
                        Search...
                    </div>
                </div>

                {/* Title */}
                <div>
                    <h3 className="text-base font-bold text-white/90">Movies</h3>
                    <p className="text-[10px] text-white/30 mt-0.5">{POSTERS.length} titles in your collection</p>
                </div>

                {/* Poster grid — 5 columns */}
                <div className="grid grid-cols-5 gap-3">
                    {POSTERS.slice(0, 10).map((item, i) => {
                        const st = STATUS_CONFIG[item.status];
                        const isHighlighted = highlightPoster === i;
                        return (
                            <motion.div
                                key={item.title + i}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03, duration: 0.3 }}
                                className="group relative"
                            >
                                <div className={`relative overflow-hidden rounded-md bg-white/[0.03] ring-1 transition-all duration-300 ${isHighlighted ? "ring-white/30 scale-[1.04]" : "ring-white/[0.06]"
                                    }`}>
                                    <div className="aspect-[2/3] w-full">
                                        <img src={item.poster} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                                    </div>
                                    {/* Hover overlay */}
                                    <AnimatePresence>
                                        {isHighlighted && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-1.5"
                                            >
                                                <span className={`inline-flex items-center gap-0.5 rounded-full px-1 py-0.5 text-[7px] font-medium ${st.bg} ${st.color} w-fit`}>
                                                    <st.icon className="h-2 w-2" />
                                                    {st.label}
                                                </span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    {item.fav && (
                                        <div className="absolute top-0.5 right-0.5 h-3.5 w-3.5 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
                                            <Heart className="h-2 w-2 fill-rose-400 text-rose-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="mt-1 px-0.5">
                                    <div className="text-[10px] font-medium text-white/60 truncate">{item.title}</div>
                                    <div className="text-[9px] text-white/25 mt-0.5">{item.year} • {item.genre}</div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   DASHBOARD TAB
   ═══════════════════════════════════════════════════════ */
function DashboardTab() {
    const [animate, setAnimate] = useState(false);
    useEffect(() => { const t = setTimeout(() => setAnimate(true), 200); return () => clearTimeout(t); }, []);

    const kpis = [
        { value: 8, label: "Total Titles", icon: Film, color: "rgba(255, 56, 100, 0.15)" },
        { value: 5, label: "Watched", icon: Eye, color: "rgba(16, 185, 129, 0.15)" },
        { value: 3, label: "Favorites", icon: Heart, color: "rgba(250, 204, 21, 0.15)" },
        { value: 42, label: "Hours", icon: Clock, color: "rgba(168, 85, 247, 0.15)" },
    ];

    const quickStats = [
        { label: "This Week", value: "+3 titles", icon: Zap, color: "text-cyan-400" },
        { label: "Avg. Runtime", value: "128 min", icon: Clock, color: "text-amber-400" },
        { label: "Completion", value: "63%", icon: Activity, color: "text-emerald-400" },
    ];

    return (
        <div className="space-y-3">
            {/* Insight hero */}
            <div className="relative overflow-hidden rounded-lg bg-white/[0.025] border border-white/[0.06] p-4">
                <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
                    <div className="absolute w-[250px] h-[180px] rounded-full blur-[50px] opacity-40 -top-8 -left-8"
                        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.25), transparent 70%)" }} />
                    <div className="absolute w-[200px] h-[150px] rounded-full blur-[50px] opacity-30 -bottom-8 -right-8"
                        style={{ background: "radial-gradient(circle, rgba(56,189,248,0.2), transparent 70%)" }} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-1.5 mb-2">
                        <TrendingUp className="h-3 w-3 text-violet-400" />
                        <span className="text-[9px] font-semibold uppercase tracking-widest text-white/40">Your Insights</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: "Hours Watched", value: "42" },
                            { label: "Top Genre", value: "Sci-Fi" },
                            { label: "Top Show", value: "Breaking Bad" },
                        ].map((ins, i) => (
                            <motion.div key={ins.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}>
                                <div className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent truncate">{ins.value}</div>
                                <div className="text-[9px] text-white/35 mt-0.5">{ins.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-4 gap-2">
                {kpis.map((kpi, i) => (
                    <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
                        className="rounded-lg bg-white/[0.025] border border-white/[0.06] p-2.5">
                        <div className="inline-flex items-center justify-center h-6 w-6 rounded-md mb-1.5" style={{ background: kpi.color }}>
                            <kpi.icon className="h-3 w-3 text-white/70" />
                        </div>
                        <div className="text-lg font-bold tracking-tight text-white/90 tabular-nums">{kpi.value}</div>
                        <div className="text-[8px] text-white/30 uppercase tracking-wider">{kpi.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Analytics row */}
            <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-white/[0.025] border border-white/[0.06] p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                        <BarChart3 className="h-2.5 w-2.5 text-white/30" />
                        <span className="text-[9px] font-semibold uppercase tracking-widest text-white/40">Status</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <MiniDonut animate={animate} />
                        <div className="flex flex-col gap-1.5">
                            {[
                                { l: "Watched", v: 5, c: "#10B981" },
                                { l: "Pending", v: 2, c: "#F59E0B" },
                                { l: "Wishlist", v: 1, c: "#8B5CF6" },
                            ].map((s) => (
                                <div key={s.l} className="flex items-center gap-1.5">
                                    <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.c }} />
                                    <span className="text-[9px] text-white/45">{s.l}</span>
                                    <span className="text-[9px] font-semibold text-white/70 ml-auto tabular-nums">{s.v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="rounded-lg bg-white/[0.025] border border-white/[0.06] p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                        <Activity className="h-2.5 w-2.5 text-white/30" />
                        <span className="text-[9px] font-semibold uppercase tracking-widest text-white/40">Quick Stats</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        {quickStats.map((stat, i) => (
                            <motion.div key={stat.label} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.1, duration: 0.3 }}
                                className="flex items-center gap-2 p-1.5 rounded-md bg-white/[0.02] border border-white/[0.03]">
                                <stat.icon className={`h-3 w-3 ${stat.color}`} />
                                <span className="text-[9px] text-white/45">{stat.label}</span>
                                <span className="ml-auto text-[9px] font-semibold text-white/70 tabular-nums">{stat.value}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   DISCOVERY TAB
   ═══════════════════════════════════════════════════════ */
function DiscoveryTab() {
    const [activeIndex, setActiveIndex] = useState(0);
    const featuredItems = [
        { ...POSTERS[3], desc: "A thief who steals corporate secrets through the use of dream-sharing technology." },
        { ...POSTERS[0], desc: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival." },
        { ...POSTERS[6], desc: "A computer hacker learns from mysterious rebels about the true nature of his reality." }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % featuredItems.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const trending = [POSTERS[8], POSTERS[1], POSTERS[7], POSTERS[14], POSTERS[10], POSTERS[4], POSTERS[2], POSTERS[12], POSTERS[5], POSTERS[11]];
    const forYou = [POSTERS[0], POSTERS[9], POSTERS[15], POSTERS[3], POSTERS[13], POSTERS[6], POSTERS[10], POSTERS[1], POSTERS[14]];

    const categories = [
        { name: "Action", icon: Flame, color: "text-orange-400", border: "border-orange-400/20", bg: "bg-orange-400/10" },
        { name: "Sci-Fi", icon: Zap, color: "text-cyan-400", border: "border-cyan-400/20", bg: "bg-cyan-400/10" },
        { name: "Drama", icon: Heart, color: "text-rose-400", border: "border-rose-400/20", bg: "bg-rose-400/10" },
        { name: "Anime", icon: Tv, color: "text-indigo-400", border: "border-indigo-400/20", bg: "bg-indigo-400/10" },
    ];

    return (
        <div className="flex flex-col gap-4 h-full pb-6">
            {/* Featured Banner */}
            <div className="relative h-[160px] w-full rounded-xl overflow-hidden flex-shrink-0 border border-white/[0.08] shadow-2xl">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeIndex}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0"
                    >
                        {/* Background Blur */}
                        <div className="absolute inset-0 scale-110">
                            <img src={featuredItems[activeIndex].poster} className="w-full h-full object-cover blur-xl opacity-30" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/90 via-[#0a0a0a]/50 to-transparent" />

                        <div className="absolute inset-0 p-4 flex items-center gap-5">
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="h-full aspect-[2/3] rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.8)] overflow-hidden ring-1 ring-white/20 flex-shrink-0"
                            >
                                <img src={featuredItems[activeIndex].poster} className="w-full h-full object-cover" />
                            </motion.div>

                            <div className="flex-1 min-w-0 pr-4">
                                <motion.span
                                    initial={{ y: 5, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="px-2 py-0.5 rounded text-[8px] font-bold bg-violet-500/80 text-white uppercase tracking-widest mb-2 inline-flex items-center gap-1"
                                >
                                    <Sparkles className="w-2.5 h-2.5" /> Spotlight
                                </motion.span>

                                <motion.h2
                                    initial={{ y: 5, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-xl font-bold tracking-tight text-white mb-1 truncate"
                                >
                                    {featuredItems[activeIndex].title}
                                </motion.h2>

                                <motion.div
                                    initial={{ y: 5, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex items-center gap-2 text-[9px] text-white/50 mb-2"
                                >
                                    <span>{featuredItems[activeIndex].year}</span>
                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                    <span>{featuredItems[activeIndex].genre}</span>
                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                    <span className="flex items-center gap-0.5 text-amber-400">
                                        <Star className="w-2.5 h-2.5 fill-current" /> {featuredItems[activeIndex].rating}.0
                                    </span>
                                </motion.div>

                                <motion.p
                                    initial={{ y: 5, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="text-[10px] text-white/60 leading-relaxed line-clamp-2 max-w-[90%] mb-3.5"
                                >
                                    {featuredItems[activeIndex].desc}
                                </motion.p>

                                <motion.div
                                    initial={{ y: 5, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                    className="flex gap-2"
                                >
                                    <button className="px-3.5 py-1.5 rounded-full bg-white text-black text-[10px] font-bold hover:bg-white/90 transition-colors flex items-center gap-1.5">
                                        <Play className="w-3 h-3 fill-current" /> Trailer
                                    </button>
                                    <button className="px-3.5 py-1.5 rounded-full bg-white/[0.08] text-white text-[10px] font-medium hover:bg-white/[0.15] transition-colors flex items-center gap-1.5 border border-white/[0.1]">
                                        <Bookmark className="w-3 h-3" /> Save
                                    </button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Quick Categories */}
            <div className="flex gap-2 px-1 overflow-x-auto scrollbar-hide flex-shrink-0 pb-1">
                {categories.map((cat, i) => (
                    <motion.div
                        key={cat.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                        className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg border ${cat.border} ${cat.bg} cursor-pointer hover:bg-white/[0.05] transition-colors`}
                    >
                        <cat.icon className={`w-3.5 h-3.5 ${cat.color}`} />
                        <span className={`text-[10px] font-bold ${cat.color} tracking-wide`}>{cat.name}</span>
                    </motion.div>
                ))}
            </div>

            {/* Top Picks Row */}
            <div className="flex-shrink-0 flex flex-col">
                <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-xs font-bold flex items-center gap-1.5 text-white/90 tracking-wide">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        Top Picks for You
                    </h3>
                    <button className="text-[10px] font-medium text-white/40 hover:text-white/80 transition-colors flex items-center gap-0.5">
                        See all <ChevronRight className="w-3 h-3" />
                    </button>
                </div>

                <div className="flex gap-3 overflow-x-hidden px-1">
                    {forYou.map((item, i) => (
                        <motion.div
                            key={"foryou" + item.title + i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + i * 0.08, duration: 0.5, ease: "easeOut" }}
                            className="flex-shrink-0 w-[95px] group cursor-pointer"
                        >
                            <div className="rounded-lg overflow-hidden border border-white/10 relative aspect-[2/3] mb-2 shadow-lg">
                                <img src={item.poster} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[8px] font-bold text-white bg-white/20 backdrop-blur-md px-1.5 py-0.5 rounded uppercase">{item.type}</span>
                                        <Heart className="w-3 h-3 text-white/70 hover:text-rose-400 hover:fill-rose-400 transition-colors" />
                                    </div>
                                </div>
                            </div>
                            <h4 className="text-[11px] font-semibold text-white/80 truncate group-hover:text-white transition-colors">{item.title}</h4>
                            <p className="text-[9px] text-white/40 mt-0.5">{item.genre}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Trending Row */}
            <div className="flex-shrink-0 flex flex-col mt-2">
                <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-xs font-bold flex items-center gap-1.5 text-white/90 tracking-wide">
                        <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                        Trending This Week
                    </h3>
                    <button className="text-[10px] font-medium text-white/40 hover:text-white/80 transition-colors flex items-center gap-0.5">
                        See all <ChevronRight className="w-3 h-3" />
                    </button>
                </div>

                <div className="flex gap-3 overflow-x-hidden px-1">
                    {trending.map((item, i) => (
                        <motion.div
                            key={"trending" + item.title + i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + i * 0.08, duration: 0.5, ease: "easeOut" }}
                            className="flex-shrink-0 w-[95px] group cursor-pointer"
                        >
                            <div className="rounded-lg overflow-hidden border border-white/10 relative aspect-[2/3] mb-2 shadow-lg">
                                <img src={item.poster} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[8px] font-bold text-white bg-white/20 backdrop-blur-md px-1.5 py-0.5 rounded uppercase">{item.type}</span>
                                        <Heart className="w-3 h-3 text-white/70 hover:text-rose-400 hover:fill-rose-400 transition-colors" />
                                    </div>
                                </div>
                            </div>
                            <h4 className="text-[11px] font-semibold text-white/80 truncate group-hover:text-white transition-colors">{item.title}</h4>
                            <p className="text-[9px] text-white/40 mt-0.5">{item.genre}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT — with auto-cycling cursor
   ═══════════════════════════════════════════════════════ */

// Cursor positions as percentages (0-100) of container width/height.
// This ensures the cursor lands correctly at any container size.
const CURSOR_SCRIPT: { tab: TabId; px: number; py: number; delay: number; click?: boolean; posterHighlight?: number }[] = [
    // --- DASHBOARD (0 - 5.5s) ---
    // Start in Dashboard: hover over insights area
    { tab: "dashboard", px: 35, py: 35, delay: 0 },
    // Hover over KPI cards area
    { tab: "dashboard", px: 65, py: 50, delay: 2000 },
    // Move cursor up to Library tab (center of tab bar)
    { tab: "dashboard", px: 50, py: 12, delay: 4000 },
    { tab: "library", px: 50, py: 12, delay: 4700, click: true },

    // --- LIBRARY (4.7s - 12.5s) ---
    // Move to first poster (Interstellar)
    { tab: "library", px: 32, py: 48, delay: 5500 },
    { tab: "library", px: 32, py: 48, delay: 6000, posterHighlight: 0 },
    // Move to second poster (Breaking Bad)
    { tab: "library", px: 45, py: 48, delay: 7500, posterHighlight: 1 },
    // Move to third poster (Attack on Titan)
    { tab: "library", px: 58, py: 48, delay: 9000, posterHighlight: 2 },
    // Move cursor up to Discovery tab (right side)
    { tab: "library", px: 78, py: 12, delay: 10500 },
    { tab: "discovery", px: 78, py: 12, delay: 11200, click: true },

    // --- DISCOVERY (11.2s - 21s) ---
    // Explore discovery — hover over poster area
    { tab: "discovery", px: 30, py: 45, delay: 12500 },
    // Hover over status/rating area
    { tab: "discovery", px: 60, py: 60, delay: 15000 },
    // Move cursor up to Dashboard tab (left side) to restart
    { tab: "discovery", px: 22, py: 12, delay: 18000 },
    { tab: "dashboard", px: 22, py: 12, delay: 18700, click: true },
];

const CYCLE_DURATION = 20000; // total cycle ms

export default function DemoCard() {
    const [activeTab, setActiveTab] = useState<TabId>("dashboard");
    const [cursorPos, setCursorPos] = useState({ x: 200, y: 200 });
    const [clicking, setClicking] = useState(false);
    const [highlightPoster, setHighlightPoster] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        containerRef.current.style.setProperty("--card-mx", `${e.clientX - rect.left}px`);
        containerRef.current.style.setProperty("--card-my", `${e.clientY - rect.top}px`);
    }, []);

    /* Auto-cursor animation loop — converts % to pixels using container size */
    useEffect(() => {
        let cancelled = false;
        const timers: NodeJS.Timeout[] = [];

        function runCycle() {
            if (cancelled) return;

            CURSOR_SCRIPT.forEach((step) => {
                timers.push(setTimeout(() => {
                    if (cancelled) return;

                    // Convert percentage to pixel position
                    const el = containerRef.current;
                    const w = el?.offsetWidth ?? 760;
                    const h = el?.offsetHeight ?? 428;
                    setCursorPos({ x: (step.px / 100) * w, y: (step.py / 100) * h });
                    setHighlightPoster(step.posterHighlight ?? null);

                    if (step.click) {
                        setClicking(true);
                        setTimeout(() => {
                            if (!cancelled) {
                                setActiveTab(step.tab);
                                setClicking(false);
                            }
                        }, 120);
                    }
                }, step.delay));
            });

            // Loop
            timers.push(setTimeout(() => {
                if (!cancelled) runCycle();
            }, CYCLE_DURATION));
        }

        runCycle();
        return () => { cancelled = true; timers.forEach(clearTimeout); };
    }, []);

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="demo-card-container"
        >
            <div className="demo-card-glow" />
            <div className="demo-card-highlight" />

            {/* Animated cursor overlay */}
            <DemoCursor x={cursorPos.x} y={cursorPos.y} clicking={clicking} />

            <div className="relative z-10 p-4 sm:p-5 flex flex-col h-full">
                {/* Window chrome */}
                <div className="flex items-center justify-between mb-3 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                            <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                            <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                        </div>
                        <div className="ml-2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[9px] text-white/30">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/60" />
                            watchvault.app
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-white/25">
                        <Play className="h-2.5 w-2.5" />
                        Interactive Demo
                    </div>
                </div>

                {/* Tab bar */}
                <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-white/[0.03] border border-white/[0.05] mb-3 flex-shrink-0">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-[10px] font-medium transition-all duration-300 ${activeTab === tab.id ? "text-white" : "text-white/35 hover:text-white/55"
                                }`}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="demo-tab-bg"
                                    className="absolute inset-0 rounded-md bg-white/[0.08] border border-white/[0.08]"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-1.5">
                                <tab.icon className="h-3 w-3" />
                                {tab.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Tab content — fills remaining space */}
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {activeTab === "library" && <LibraryTab highlightPoster={highlightPoster} />}
                            {activeTab === "dashboard" && <DashboardTab />}
                            {activeTab === "discovery" && <DiscoveryTab />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
