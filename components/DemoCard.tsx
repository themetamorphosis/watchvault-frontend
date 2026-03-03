"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart, Star, Eye, Clock, Bookmark, Film, Tv, Sparkles,
    TrendingUp, BarChart3, Activity, Zap, Search, SlidersHorizontal,
    ChevronRight, Play, Flame, Trophy, MousePointer2,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   DEMO DATA
   ═══════════════════════════════════════════════════════ */

const POSTERS = [
    { title: "Interstellar", year: 2014, genre: "Sci-Fi", type: "movie", poster: "https://image.tmdb.org/t/p/w342/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", status: "watched" as const, fav: true, rating: 5 },
    { title: "Breaking Bad", year: 2008, genre: "Drama", type: "tv", poster: "https://image.tmdb.org/t/p/w342/ggFHVNu6YYI5L9pCfOacjizRGt.jpg", status: "watched" as const, fav: true, rating: 5 },
    { title: "Attack on Titan", year: 2013, genre: "Action", type: "anime", poster: "https://image.tmdb.org/t/p/w342/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg", status: "pending" as const, fav: false, rating: 4 },
    { title: "Inception", year: 2010, genre: "Thriller", type: "movie", poster: "https://image.tmdb.org/t/p/w342/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg", status: "watched" as const, fav: true, rating: 5 },
    { title: "Stranger Things", year: 2016, genre: "Mystery", type: "tv", poster: "https://image.tmdb.org/t/p/w342/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg", status: "pending" as const, fav: false, rating: 4 },
    { title: "Spirited Away", year: 2001, genre: "Fantasy", type: "anime", poster: "https://image.tmdb.org/t/p/w342/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg", status: "watched" as const, fav: true, rating: 5 },
    { title: "The Matrix", year: 1999, genre: "Sci-Fi", type: "movie", poster: "https://image.tmdb.org/t/p/w342/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", status: "watched" as const, fav: true, rating: 5 },
    { title: "Demon Slayer", year: 2019, genre: "Action", type: "anime", poster: "https://image.tmdb.org/t/p/w342/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg", status: "pending" as const, fav: false, rating: 4 },
    { title: "Pulp Fiction", year: 1994, genre: "Crime", type: "movie", poster: "https://image.tmdb.org/t/p/w342/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", status: "watched" as const, fav: true, rating: 5 },
    { title: "Fight Club", year: 1999, genre: "Drama", type: "movie", poster: "https://image.tmdb.org/t/p/w342/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", status: "watched" as const, fav: true, rating: 5 },
];

const STATUS_CONFIG = {
    watched: { label: "Watched", color: "text-emerald-400", bg: "bg-emerald-500/20", icon: Eye },
    pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/20", icon: Clock },
    wishlist: { label: "Wishlist", color: "text-violet-400", bg: "bg-violet-500/20", icon: Bookmark },
};

const TABS = [
    { id: "library", label: "Library", icon: Film },
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "tracking", label: "Tracking", icon: Activity },
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
        <div className="flex gap-3 h-full">
            {/* ── Left sidebar ── */}
            <div className="w-[120px] flex-shrink-0 space-y-3 border-r border-white/[0.05] pr-3">
                {/* Status filters */}
                <div>
                    <span className="text-[8px] uppercase tracking-widest text-white/30 font-semibold">Status</span>
                    <div className="mt-1.5 space-y-0.5">
                        {[
                            { label: "All", count: 10, active: true },
                            { label: "Watched", count: 7 },
                            { label: "Pending", count: 2 },
                            { label: "Wishlisted", count: 1 },
                        ].map((s) => (
                            <div key={s.label} className={`flex items-center justify-between px-2 py-1 rounded-md text-[9px] transition-all ${s.active ? "bg-white/[0.06] text-white/80" : "text-white/40 hover:bg-white/[0.03]"
                                }`}>
                                <span>{s.label}</span>
                                <span className="text-white/25 tabular-nums">{s.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Favorites */}
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] text-white/40 hover:bg-white/[0.03] cursor-default">
                    <Heart className="h-2.5 w-2.5" />
                    <span>Favorites Only</span>
                </div>

                {/* Sort */}
                <div>
                    <span className="text-[8px] uppercase tracking-widest text-white/30 font-semibold">Sort By</span>
                    <div className="mt-1.5 px-2 py-1.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[9px] text-white/60">
                        Recently added ▾
                    </div>
                </div>

                {/* Genres */}
                <div>
                    <span className="text-[8px] uppercase tracking-widest text-white/30 font-semibold">Genres</span>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                        {GENRES.map((g) => (
                            <span key={g} className="px-1.5 py-0.5 rounded text-[7px] text-white/35 bg-white/[0.03] border border-white/[0.05]">{g}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right: content area ── */}
            <div className="flex-1 min-w-0 space-y-2.5">
                {/* Category tabs + search */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        {[
                            { label: "Movies", icon: Film, active: true },
                            { label: "TV Shows", icon: Tv },
                            { label: "Anime", icon: Sparkles },
                        ].map((c) => (
                            <div key={c.label} className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-medium ${c.active ? "bg-white/[0.08] text-white/80 border border-white/[0.1]" : "text-white/35"
                                }`}>
                                <c.icon className="h-2.5 w-2.5" />
                                {c.label}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-[8px] text-white/30">
                        <Search className="h-2.5 w-2.5" />
                        Search...
                    </div>
                </div>

                {/* Title */}
                <div>
                    <h3 className="text-sm font-bold text-white/90">Movies</h3>
                    <p className="text-[8px] text-white/30">10 titles in your collection</p>
                </div>

                {/* Poster grid — 5 columns */}
                <div className="grid grid-cols-5 gap-1.5">
                    {POSTERS.map((item, i) => {
                        const st = STATUS_CONFIG[item.status];
                        const isHighlighted = highlightPoster === i;
                        return (
                            <motion.div
                                key={item.title}
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
                                <div className="mt-0.5 px-0.5">
                                    <div className="text-[8px] font-medium text-white/60 truncate">{item.title}</div>
                                    <div className="text-[7px] text-white/25">{item.year} • {item.genre}</div>
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
   TRACKING TAB
   ═══════════════════════════════════════════════════════ */
function TrackingTab() {
    const [step, setStep] = useState(0);
    const [isFav, setIsFav] = useState(false);
    const [rating, setRating] = useState(0);
    const item = POSTERS[0];

    useEffect(() => {
        const timers: NodeJS.Timeout[] = [];
        let cancelled = false;

        function run() {
            if (cancelled) return;
            setStep(0); setIsFav(false); setRating(0);

            const steps: [number, () => void][] = [
                [1500, () => setStep(1)],
                [3000, () => setStep(2)],
                [4500, () => { setStep(3); setIsFav(true); }],
            ];
            for (let s = 1; s <= 5; s++) {
                steps.push([5500 + s * 350, () => { setStep(3 + s); setRating(s); }]);
            }
            steps.forEach(([ms, fn]) => {
                timers.push(setTimeout(() => { if (!cancelled) fn(); }, ms));
            });
            timers.push(setTimeout(() => { if (!cancelled) run(); }, 9000));
        }
        run();
        return () => { cancelled = true; timers.forEach(clearTimeout); };
    }, []);

    const statuses = [
        { label: "Wishlisted", icon: Bookmark, color: "text-violet-400", bg: "bg-violet-500/20" },
        { label: "Pending", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/20" },
        { label: "Watched", icon: Eye, color: "text-emerald-400", bg: "bg-emerald-500/20" },
    ];

    return (
        <div className="flex gap-4 items-start">
            {/* Left: poster */}
            <div className="flex-shrink-0 w-[110px]">
                <div className="relative overflow-hidden rounded-lg">
                    <img src={item.poster} alt={item.title} className="w-full aspect-[2/3] object-cover rounded-lg ring-1 ring-white/10" />
                    <div className="absolute -inset-2 -z-10 rounded-xl blur-2xl opacity-25 bg-cyan-500/30" />
                </div>
            </div>

            {/* Right: info */}
            <div className="flex-1 min-w-0 space-y-3">
                <div>
                    <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">{item.title}</h3>
                    <p className="text-[10px] text-white/40 mt-0.5">{item.year} • {item.genre} • Movie</p>
                    <p className="text-[9px] text-white/25 mt-1.5 leading-relaxed line-clamp-2">
                        A team of explorers travel through a wormhole in space in an attempt to ensure humanity&apos;s survival.
                    </p>
                </div>

                {/* Status */}
                <div>
                    <span className="text-[8px] uppercase tracking-widest text-white/25 font-semibold">Status</span>
                    <div className="flex items-center gap-1.5 mt-1.5">
                        {statuses.map((s, i) => {
                            const isCurrent = i === Math.min(step, 2);
                            const isActive = i <= Math.min(step, 2);
                            return (
                                <motion.div key={s.label}
                                    animate={{ scale: isCurrent ? 1.05 : 1, opacity: isActive ? 1 : 0.35 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-medium ${isCurrent ? `${s.bg} ${s.color} ring-1 ring-current/20` : "text-white/30"}`}>
                                    <s.icon className="h-2.5 w-2.5" />
                                    {s.label}
                                </motion.div>
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-0.5 mt-1.5">
                        {[0, 1, 2].map((i) => (
                            <motion.div key={i}
                                animate={{ backgroundColor: i <= Math.min(step, 2) ? "#10B981" : "rgba(255,255,255,0.06)" }}
                                className="h-0.5 flex-1 rounded-full" transition={{ duration: 0.3 }} />
                        ))}
                    </div>
                </div>

                {/* Fav + rating row */}
                <div className="flex items-center gap-5">
                    <div>
                        <span className="text-[8px] uppercase tracking-widest text-white/25 font-semibold block mb-1">Favorite</span>
                        <motion.div animate={{ scale: isFav ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.4 }} className="relative">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${isFav ? "bg-rose-500/20 ring-1 ring-rose-400/40 shadow-[0_0_16px_rgba(244,63,94,0.3)]" : "bg-white/[0.04] ring-1 ring-white/[0.08]"
                                }`}>
                                <Heart className={`h-3.5 w-3.5 transition-all duration-300 ${isFav ? "fill-rose-400 text-rose-400" : "text-white/25"}`} />
                            </div>
                            <AnimatePresence>
                                {isFav && [...Array(6)].map((_, i) => (
                                    <motion.div key={`b-${i}`}
                                        initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                                        animate={{ opacity: 0, scale: 1, x: Math.cos((i * Math.PI * 2) / 6) * 16, y: Math.sin((i * Math.PI * 2) / 6) * 16 }}
                                        exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1 w-1 rounded-full bg-rose-400" />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                    <div>
                        <span className="text-[8px] uppercase tracking-widest text-white/25 font-semibold block mb-1">Rating</span>
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <motion.div key={s}
                                    animate={{ scale: s <= rating ? [1, 1.3, 1] : 1 }}
                                    transition={{ duration: 0.25, delay: s <= rating ? (s - 1) * 0.05 : 0 }}>
                                    <Star className={`h-3.5 w-3.5 transition-all duration-300 ${s <= rating ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]" : "text-white/15"
                                        }`} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Activity */}
                <div className="pt-2 border-t border-white/[0.04]">
                    <span className="text-[8px] uppercase tracking-widest text-white/25 font-semibold block mb-1.5">Activity</span>
                    <div className="space-y-1">
                        {[
                            { text: "Added to Wishlist", show: step >= 0 },
                            { text: "Status → Pending", show: step >= 1 },
                            { text: "Status → Watched", show: step >= 2 },
                            { text: "Marked as Favorite", show: step >= 3 },
                            { text: `Rated ${rating}/5 stars`, show: step >= 4 },
                        ].filter(a => a.show).reverse().slice(0, 3).map((a, i) => (
                            <motion.div key={a.text} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: i * 0.04 }}
                                className="flex items-center gap-2 text-[9px]">
                                <div className="h-1 w-1 rounded-full bg-emerald-400/60 flex-shrink-0" />
                                <span className="text-white/45">{a.text}</span>
                            </motion.div>
                        ))}
                    </div>
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
    // Start: hover over first poster (Interstellar) — right side of sidebar
    { tab: "library", px: 32, py: 48, delay: 0 },
    { tab: "library", px: 32, py: 48, delay: 800, posterHighlight: 0 },
    // Move to second poster (Breaking Bad)
    { tab: "library", px: 45, py: 48, delay: 2500, posterHighlight: 1 },
    // Move to third poster (Attack on Titan)
    { tab: "library", px: 58, py: 48, delay: 4000, posterHighlight: 2 },
    // Move cursor up to Dashboard tab (center of tab bar)
    { tab: "library", px: 50, py: 12, delay: 5500 },
    { tab: "dashboard", px: 50, py: 12, delay: 6200, click: true },
    // Explore dashboard — hover over insights area
    { tab: "dashboard", px: 35, py: 35, delay: 7500 },
    // Hover over KPI cards area
    { tab: "dashboard", px: 65, py: 50, delay: 9500 },
    // Move cursor up to Tracking tab
    { tab: "dashboard", px: 78, py: 12, delay: 11500 },
    { tab: "tracking", px: 78, py: 12, delay: 12200, click: true },
    // Explore tracking — hover over poster area
    { tab: "tracking", px: 30, py: 45, delay: 13500 },
    // Hover over status/rating area
    { tab: "tracking", px: 60, py: 60, delay: 16000 },
    // Move cursor up to Library tab to restart
    { tab: "tracking", px: 22, py: 12, delay: 19000 },
    { tab: "library", px: 22, py: 12, delay: 19700, click: true },
];

const CYCLE_DURATION = 21000; // total cycle ms

export default function DemoCard() {
    const [activeTab, setActiveTab] = useState<TabId>("library");
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
                            {activeTab === "tracking" && <TrackingTab />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
