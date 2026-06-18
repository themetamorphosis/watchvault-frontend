"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSession } from "@/components/SessionProvider";
import type { Item, Status } from "@/lib/types";
import Link from "next/link";
import dynamic from "next/dynamic";
import CountUp from "react-countup";
import { motion, AnimatePresence } from "framer-motion";
import {
    Layout,
    Clock,
    Heart,
    CheckCircle,
    Film,
    Tv,
    Sparkles,
    Activity,
    User,
    ChevronRight,
    TrendingUp,
    Compass,
    Plus,
    Star,
    Shuffle,
    Calendar,
    BookOpen,
    Check,
    X,
    Flame,
    BarChart2,
    Eye,
} from "lucide-react";
import { useRetroTheme } from "@/components/layout/RetroThemeContext";
import { useLibraryData } from "@/hooks/useLibraryData";
import TmdbSearchInput from "@/components/TmdbSearchInput";
import type { TMDBSearchResult } from "@/lib/tmdb";

const DashboardParticles = dynamic(() => import("@/components/DashboardParticles"), {
    ssr: false,
});

interface BentoCardProps {
    children: React.ReactNode;
    className?: string;
    glowColor?: string;
}

function BentoCard({ 
    children, 
    className = "", 
    glowColor = "rgba(255, 56, 100, 0.08)"
}: BentoCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        cardRef.current.style.setProperty("--card-mx", `${x}px`);
        cardRef.current.style.setProperty("--card-my", `${y}px`);
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            className={`relative overflow-hidden bg-neutral-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:border-amber-500/30 ${className}`}
            style={{
                ["--card-glow-color" as any]: glowColor,
            } as React.CSSProperties}
        >
            {/* Spotlight glow overlay */}
            <div 
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
                style={{
                    background: `radial-gradient(400px circle at var(--card-mx, 50%) var(--card-my, 50%), var(--card-glow-color, rgba(255, 56, 100, 0.08)), transparent 60%)`
                }}
            />
            {/* Top shine */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />
            <div className="relative z-10 h-full flex flex-col justify-between">
                {children}
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const userId = session?.user?.id || 'guest';
    const userName = session?.user?.name || "User";
    const userImage = session?.user?.image;
    const userEmail = session?.user?.email || "";

    const { theme } = useRetroTheme();
    const isRetro = theme.startsWith("retro");

    const {
        items,
        ready,
        mounted,
        handleUpsert,
        handleToggleFav,
        ensureCover,
        syncingRefs,
    } = useLibraryData(userId);

    const [greeting, setGreeting] = useState("Welcome back");
    const [toast, setToast] = useState<string | null>(null);

    // Modern theme state variables
    const [shuffledId, setShuffledId] = useState<string | null>(null);
    const [hoveredDay, setHoveredDay] = useState<{ dayLabel: string; count: number } | null>(null);
    const [activeTab, setActiveTab] = useState<"genres" | "status" | "decades">("genres");
    const [selectedAddResult, setSelectedAddResult] = useState<TMDBSearchResult | null>(null);
    const [quickAddStatus, setQuickAddStatus] = useState<Status>("watched");
    const [quickAddFav, setQuickAddFav] = useState(false);
    const [quickAddRating, setQuickAddRating] = useState<number>(0);
    const [quickAddNotes, setQuickAddNotes] = useState("");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good morning");
        else if (hour < 18) setGreeting("Good afternoon");
        else setGreeting("Good evening");
    }, []);

    /* Toast auto-dismiss */
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(timer);
    }, [toast]);

    /* ── Calculate Analytics ── */
    const stats = useMemo(() => {
        const watchedItems = items.filter(i => i.status === 'watched');
        const pendingItems = items.filter(i => i.status === 'pending');
        const wishlistItems = items.filter(i => i.status === 'wishlist');

        let totalRuntimeMinutes = 0;
        const genreCounts = new Map<string, number>();
        let longestSeriesName = "N/A";
        let maxSeriesRuntime = 0;

        watchedItems.forEach(i => {
            if (i.runtime) totalRuntimeMinutes += i.runtime;
            (i.genres || []).forEach(g => {
                genreCounts.set(g, (genreCounts.get(g) || 0) + 1);
            });
            if ((i.mediaType === 'tv' || i.mediaType === 'anime') && i.runtime && i.runtime > maxSeriesRuntime) {
                maxSeriesRuntime = i.runtime;
                longestSeriesName = i.title;
            }
        });

        const hoursWatched = Math.round(totalRuntimeMinutes / 60);

        let topGenre = "N/A";
        let maxCount = 0;
        genreCounts.forEach((count, genre) => {
            if (count > maxCount) {
                maxCount = count;
                topGenre = genre;
            }
        });

        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const addedThisWeekCount = items.filter(i => i.createdAt > oneWeekAgo).length;
        const completionRate = items.length > 0 ? Math.round((watchedItems.length / items.length) * 100) : 0;
        const avgWatchedRuntime = watchedItems.length > 0 ? Math.round(totalRuntimeMinutes / watchedItems.length) : 0;

        const counts = {
            movie: items.filter(i => i.mediaType === 'movie').length,
            tv: items.filter(i => i.mediaType === 'tv').length,
            anime: items.filter(i => i.mediaType === 'anime').length,
            favorites: items.filter(i => i.favorite).length,
        };

        const totalStatus = watchedItems.length + pendingItems.length + wishlistItems.length;

        // Recents Sorted
        const recentActivity = [...items]
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .slice(0, 5)
            .map(item => {
                const date = new Date(item.updatedAt);
                const timeStr = date.toTimeString().split(' ')[0];
                const action = item.status === 'watched' ? 'WATCH' : item.status === 'wishlist' ? 'WISHL' : 'PENDG';
                return {
                    id: item.id,
                    time: timeStr,
                    title: item.title.toUpperCase(),
                    action,
                    media: item.mediaType.toUpperCase(),
                };
            });

        const activityLogs = recentActivity.length > 0 ? recentActivity : [
            { id: "empty", time: "00:00:00", title: "SYSTEM STABLE — NO RECENT ACTIVITY RECORDED", action: "INFO", media: "SYS" },
        ];

        const favoritesList = items.filter(i => i.favorite).slice(0, 8);

        return {
            hoursWatched,
            topGenre,
            longestSeriesName,
            counts,
            totalStatus,
            watchedCount: watchedItems.length,
            pendingCount: pendingItems.length,
            wishlistCount: wishlistItems.length,
            addedThisWeekCount,
            completionRate,
            avgWatchedRuntime,
            activityLogs,
            favoritesList,
        };
    }, [items]);

    // Poster enrichment for favorites
    useEffect(() => {
        if (!ready || stats.favoritesList.length === 0) return;
        const missing = stats.favoritesList.filter(it => {
            if (syncingRefs.current.has(it.id)) return false;
            if (it.coverUrl && it.genres && it.genres.length > 0 && it.description) return false;
            return true;
        });
        if (missing.length === 0) return;
        missing.slice(0, 3).forEach(it => {
            syncingRefs.current.add(it.id);
            ensureCover(it);
        });
    }, [stats.favoritesList, ready, ensureCover, syncingRefs]);

    // Heatmap data calculation: 84 days (12 weeks)
    const heatmapData = useMemo(() => {
        const data: { date: Date; count: number; dayLabel: string }[] = [];
        const now = new Date();
        const startDate = new Date();
        startDate.setDate(now.getDate() - 83);
        startDate.setHours(0, 0, 0, 0);

        const dateCounts = new Map<string, number>();
        items.forEach(item => {
            const d = new Date(item.createdAt || item.updatedAt);
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            dateCounts.set(key, (dateCounts.get(key) || 0) + 1);
        });

        for (let i = 0; i <= 83; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            const count = dateCounts.get(key) || 0;

            const formatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
            data.push({
                date: d,
                count,
                dayLabel: formatter.format(d),
            });
        }
        return data;
    }, [items]);

    // Top 5 Genres
    const topGenresList = useMemo(() => {
        const counts = new Map<string, number>();
        items.forEach(item => {
            (item.genres || []).forEach(g => {
                counts.set(g, (counts.get(g) || 0) + 1);
            });
        });
        return Array.from(counts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [items]);

    // Decades Distribution
    const decadesData = useMemo(() => {
        const counts = new Map<string, number>();
        items.forEach(item => {
            if (!item.year) return;
            const decadeStart = Math.floor(item.year / 10) * 10;
            const decadeKey = `${decadeStart}s`;
            counts.set(decadeKey, (counts.get(decadeKey) || 0) + 1);
        });
        return Array.from(counts.entries())
            .map(([decade, count]) => ({ decade, count }))
            .sort((a, b) => a.decade.localeCompare(b.decade));
    }, [items]);

    const handleQuickAdd = (result: TMDBSearchResult) => {
        setSelectedAddResult(result);
    };

    const handleConfirmQuickAdd = async () => {
        if (!selectedAddResult) return;

        let starsStr = "";
        if (quickAddRating > 0) {
            starsStr = "★".repeat(quickAddRating) + "☆".repeat(5 - quickAddRating) + " ";
        }

        const finalNotes = starsStr + quickAddNotes;

        await handleUpsert({
            title: selectedAddResult.title,
            mediaType: selectedAddResult.mediaType as any,
            status: quickAddStatus,
            favorite: quickAddFav,
            year: selectedAddResult.year ?? undefined,
            coverUrl: selectedAddResult.posterUrl ? selectedAddResult.posterUrl.replace('/w185/', '/w780/') : undefined,
            genres: selectedAddResult.genres,
            description: selectedAddResult.overview ?? undefined,
            notes: finalNotes.trim() || undefined,
        });

        setToast(`Added "${selectedAddResult.title}" to library!`);
        setSelectedAddResult(null);
        setQuickAddStatus("watched");
        setQuickAddFav(false);
        setQuickAddRating(0);
        setQuickAddNotes("");
    };

    // Select dynamic spotlight movie/show
    const activeSpotlight = useMemo(() => {
        if (shuffledId) {
            const found = items.find(i => i.id === shuffledId);
            if (found) return found;
        }
        const favors = items.filter(i => i.favorite);
        const withCover = favors.filter(i => i.coverUrl);
        if (withCover.length > 0) return withCover[0];
        if (favors.length > 0) return favors[0];
        const allWithCover = items.filter(i => i.coverUrl);
        if (allWithCover.length > 0) return allWithCover[0];
        if (items.length > 0) return items[0];
        return null;
    }, [items, shuffledId]);

    const handleShuffleSpotlight = () => {
        if (items.length <= 1) return;
        let pool = items;
        if (activeSpotlight) {
            pool = items.filter(i => i.id !== activeSpotlight.id);
        }
        const rand = pool[Math.floor(Math.random() * pool.length)];
        setShuffledId(rand.id);
    };

    if (!mounted || !ready) {
        return isRetro ? (
            <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-8 font-mono text-xs uppercase text-tui-text-muted animate-pulse">
                &gt; INITIALIZING ANALYTICS DASHBOARD...
            </div>
        ) : (
            <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-8 font-sans space-y-6 animate-pulse">
                <div className="h-32 bg-tui-panel border border-tui-border rounded-2xl" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-28 bg-tui-panel border border-tui-border rounded-2xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
                    <div className="h-[300px] bg-tui-panel border border-tui-border rounded-2xl" />
                    <div className="h-[300px] bg-tui-panel border border-tui-border rounded-2xl" />
                </div>
            </div>
        );
    }

    return isRetro ? (
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-8 font-sans">
            
            {/* ── Top Dashboard Welcome Header with Profile ── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-tui-panel border border-tui-border p-6 gap-6 mb-8 rounded-none relative overflow-hidden shadow-xl">
                {/* Visual Accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-tui-amber via-tui-purple to-tui-green" />
                
                <div className="flex items-center gap-4 relative z-10">
                    <div className="relative shrink-0">
                        {userImage ? (
                            <img
                                src={userImage}
                                alt="User Avatar"
                                className="h-16 w-16 rounded-none border-2 border-tui-border object-cover shadow-lg"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="h-16 w-16 rounded-none border border-tui-border bg-tui-input flex items-center justify-center text-tui-text shadow-lg">
                                <User className="h-7 w-7 text-tui-text-muted" />
                            </div>
                        )}
                        <span className="absolute bottom-0 right-0 h-3 w-3 bg-tui-green border-2 border-tui-panel rounded-full" />
                    </div>
                    <div>
                        <div className="text-xs text-tui-text-muted font-mono uppercase tracking-widest">// ACTIVE SESSION PROFILE</div>
                        <h2 className="text-xl font-bold text-tui-text uppercase tracking-wide mt-0.5">{greeting}, {userName}!</h2>
                        <p className="text-[11px] text-tui-text-muted font-mono mt-0.5">{userEmail}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-tui-text-muted border-t md:border-t-0 md:pt-0 pt-4 border-tui-border-muted w-full md:w-auto relative z-10 justify-between md:justify-end">
                    <div>
                        <span className="opacity-60 uppercase">SYSTEM BUILD: </span>
                        <span className="text-tui-text font-bold">2.21</span>
                    </div>
                    <div>
                        <span className="opacity-60 uppercase">STATUS: </span>
                        <span className="text-tui-green font-bold">[ ONLINE ]</span>
                    </div>
                    <Link
                        href="/profile"
                        className="px-3 py-1.5 border border-tui-border text-[10px] text-tui-text-muted hover:border-tui-text hover:text-tui-text transition-all bg-tui-input uppercase"
                    >
                        [ EDIT PROFILE ]
                    </Link>
                </div>
            </div>

            {/* ── 4-Grid Premium Analytics Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                
                {/* Card 1: Total Collection */}
                <div
                    className="border border-tui-border bg-tui-panel p-6 shadow-md relative group transition-transform duration-200 ease-out transform hover:-translate-y-1"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all text-tui-amber">
                        <Film className="h-12 w-12" />
                    </div>
                    <div className="text-xs text-tui-text-muted font-mono uppercase tracking-wider">TOTAL DIRECTORY SIZE</div>
                    <div className="text-4xl font-extrabold text-tui-text mt-2 font-mono">{stats.totalStatus.toString().padStart(2, '0')}</div>
                    <div className="text-[10px] text-tui-text-muted font-mono uppercase mt-2 tracking-tight">
                        &gt; {stats.counts.movie} MOVIES | {stats.counts.tv} TV | {stats.counts.anime} ANIME
                    </div>
                </div>

                {/* Card 2: Hours Spent */}
                <div
                    className="border border-tui-border bg-tui-panel p-6 shadow-md relative group transition-transform duration-200 ease-out transform hover:-translate-y-1"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all text-tui-green">
                        <Clock className="h-12 w-12" />
                    </div>
                    <div className="text-xs text-tui-text-muted font-mono uppercase tracking-wider">TIME WATCHED RUNTIME</div>
                    <div className="text-4xl font-extrabold text-tui-green mt-2 font-mono">
                        {stats.hoursWatched.toLocaleString()} <span className="text-xs font-normal text-tui-text-muted">HRS</span>
                    </div>
                    <div className="text-[10px] text-tui-text-muted font-mono uppercase mt-2 tracking-tight">
                        &gt; AVG TICKET LENGTH: {stats.avgWatchedRuntime} MIN
                    </div>
                </div>

                {/* Card 3: Favorites */}
                <div
                    className="border border-tui-border bg-tui-panel p-6 shadow-md relative group transition-transform duration-200 ease-out transform hover:-translate-y-1"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all text-tui-red">
                        <Heart className="h-12 w-12" />
                    </div>
                    <div className="text-xs text-tui-text-muted font-mono uppercase tracking-wider">FAVORITES ARCHIVE</div>
                    <div className="text-4xl font-extrabold text-tui-red mt-2 font-mono">
                        {stats.counts.favorites.toString().padStart(2, '0')} <span className="text-xs font-normal text-tui-text-muted">ITEMS</span>
                    </div>
                    <div className="text-[10px] text-tui-text-muted font-mono uppercase mt-2 tracking-tight">
                        &gt; TOP GENRE DIRECTORY: {stats.topGenre}
                    </div>
                </div>

                {/* Card 4: Completion Rate */}
                <div
                    className="border border-tui-border bg-tui-panel p-6 shadow-md relative group transition-transform duration-200 ease-out transform hover:-translate-y-1"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all text-tui-purple">
                        <CheckCircle className="h-12 w-12" />
                    </div>
                    <div className="text-xs text-tui-text-muted font-mono uppercase tracking-wider">COMPLETION COEFFICIENT</div>
                    <div className="text-4xl font-extrabold text-tui-purple mt-2 font-mono">{stats.completionRate}%</div>
                    <div className="text-[10px] text-tui-text-muted font-mono uppercase mt-2 tracking-tight">
                        &gt; {stats.watchedCount} COMPLETED | {stats.pendingCount} ACTIVE | {stats.wishlistCount} WISHLISTED
                    </div>
                </div>
            </div>

            {/* ── Two Column Dashboard Layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
                
                {/* ── LEFT COLUMN: Core Stats & Visual Analytics ── */}
                <div className="space-y-6">
                    
                    {/* Panel 1: Media Library Breakdown */}
                    <div className="border border-tui-border bg-tui-panel p-6 shadow-md relative">
                        <div className="text-xs text-tui-text font-mono font-bold uppercase mb-4 tracking-wider flex items-center gap-2">
                            <Compass className="h-4 w-4 text-tui-amber" />
                            [ MEDIA DISTRIBUTION ]
                        </div>
                        <div className="grid grid-cols-3 gap-6 text-center">
                            <div className="border border-tui-border bg-tui-input p-4 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-tui-amber" />
                                <div className="text-[10px] text-tui-text-muted font-mono uppercase tracking-wider">MOVIES</div>
                                <div className="text-2xl font-bold text-tui-amber mt-2 font-mono">
                                    {stats.counts.movie.toString().padStart(2, '0')}
                                </div>
                            </div>
                            <div className="border border-tui-border bg-tui-input p-4 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-tui-purple" />
                                <div className="text-[10px] text-tui-text-muted font-mono uppercase tracking-wider">TV SHOWS</div>
                                <div className="text-2xl font-bold text-tui-purple mt-2 font-mono">
                                    {stats.counts.tv.toString().padStart(2, '0')}
                                </div>
                            </div>
                            <div className="border border-tui-border bg-tui-input p-4 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-tui-green" />
                                <div className="text-[10px] text-tui-text-muted font-mono uppercase tracking-wider">ANIME</div>
                                <div className="text-2xl font-bold text-tui-green mt-2 font-mono">
                                    {stats.counts.anime.toString().padStart(2, '0')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Panel 2: Favorites Spotlight (Grid/Cards) */}
                    <div className="border border-tui-border bg-tui-panel p-6 shadow-md">
                        <div className="text-xs text-tui-text font-mono font-bold uppercase mb-4 tracking-wider flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Heart className="h-4 w-4 text-tui-red" />
                                [ FAVORITES DIRECTORY ]
                            </span>
                            <Link href="/library/movies?favorite=true" className="text-[10px] text-tui-text-muted hover:text-tui-text font-mono uppercase transition-colors">
                                View All &gt;
                            </Link>
                        </div>

                        {stats.favoritesList.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {stats.favoritesList.slice(0, 6).map((item) => (
                                    <div 
                                        key={item.id}
                                        className="border border-tui-border bg-tui-input relative group overflow-hidden flex flex-col h-full"
                                    >
                                        <div className="aspect-[2/3] w-full bg-tui-panel border-b border-tui-border-muted overflow-hidden relative">
                                            {item.coverUrl ? (
                                                <img 
                                                    src={item.coverUrl} 
                                                    alt={item.title} 
                                                    className="w-full h-full object-cover filter brightness-90 group-hover:brightness-100 group-hover:scale-105 transition-all duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] text-tui-text-muted uppercase font-mono bg-tui-input">
                                                    NO POSTER
                                                </div>
                                            )}
                                            {/* Type Badge */}
                                            <span className={`absolute top-2 right-2 px-1.5 py-0.5 text-[8px] font-mono border uppercase tracking-wider ${
                                                item.mediaType === 'movie' ? 'border-tui-amber bg-tui-amber/20 text-tui-amber'
                                                : item.mediaType === 'tv' ? 'border-tui-purple bg-tui-purple/20 text-tui-purple'
                                                : 'border-tui-green bg-tui-green/20 text-tui-green'
                                            }`}>
                                                {item.mediaType}
                                            </span>
                                        </div>
                                        <div className="p-3 flex-1 flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-bold text-tui-text uppercase tracking-wide truncate text-[11px] group-hover:text-tui-amber transition-colors" title={item.title}>
                                                    {item.title}
                                                </h4>
                                                <p className="text-[9px] text-tui-text-muted font-mono uppercase mt-0.5">
                                                    {item.year || "—"}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center justify-between">
                                                <span className={`px-1.5 py-0.5 border text-[8px] font-mono uppercase ${
                                                    item.status === 'watched' ? 'border-tui-green text-tui-green bg-tui-green/5'
                                                    : item.status === 'pending' ? 'border-tui-amber text-tui-amber bg-tui-amber/5'
                                                    : 'border-tui-purple text-tui-purple bg-tui-purple/5'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="border border-dashed border-tui-border-muted p-8 text-center bg-tui-input">
                                <div className="flex justify-center mb-2">
                                    <Star className="h-8 w-8 text-tui-text-muted/40 animate-none" />
                                </div>
                                <div className="text-[11px] text-tui-text-muted uppercase font-mono tracking-wide">NO FAVORITES REGISTERED</div>
                                <p className="text-[9px] text-tui-text-muted/50 uppercase font-mono mt-1">Mark entries in your libraries as favorite to highlight them here</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── RIGHT COLUMN: Activity Logs & Progress Bars ── */}
                <div className="space-y-6">
                    
                    {/* Panel 1: Live Status Distribution (Radial Completion SVG) */}
                    <div className="border border-tui-border bg-tui-panel p-6 shadow-md relative">
                        <div className="text-xs text-tui-text font-mono font-bold uppercase mb-4 tracking-wider flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-tui-green" />
                            [ LIBRARY RATIO ]
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-6 justify-center py-2">
                            {/* SVG Radial Ring */}
                            <div className="relative h-28 w-28 shrink-0">
                                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                                    <circle
                                        cx="18"
                                        cy="18"
                                        r="15.915"
                                        fill="transparent"
                                        stroke="var(--bg-input)"
                                        strokeWidth="3"
                                    />
                                    <circle
                                        cx="18"
                                        cy="18"
                                        r="15.915"
                                        fill="transparent"
                                        stroke="var(--accent-green)"
                                        strokeWidth="3"
                                        strokeDasharray={`${stats.completionRate} ${100 - stats.completionRate}`}
                                        strokeDashoffset="0"
                                        className="transition-all duration-500 ease-out"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center font-mono text-center select-none">
                                    <span className="text-lg font-bold text-tui-text leading-none">{stats.completionRate}%</span>
                                    <span className="text-[8px] text-tui-text-muted uppercase mt-0.5">COMPLETED</span>
                                </div>
                            </div>

                            <div className="w-full space-y-3 font-mono text-[10px]">
                                <div className="flex justify-between items-center border-b border-tui-border-muted pb-1.5">
                                    <span className="text-tui-text-muted flex items-center gap-1.5">
                                        <span className="h-2 w-2 bg-tui-green inline-block" />
                                        WATCHED
                                    </span>
                                    <span className="font-bold text-tui-text">{stats.watchedCount} / {stats.totalStatus}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-tui-border-muted pb-1.5">
                                    <span className="text-tui-text-muted flex items-center gap-1.5">
                                        <span className="h-2 w-2 bg-tui-amber inline-block" />
                                        PENDING
                                    </span>
                                    <span className="font-bold text-tui-text">{stats.pendingCount} / {stats.totalStatus}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-tui-text-muted flex items-center gap-1.5">
                                        <span className="h-2 w-2 bg-tui-purple inline-block" />
                                        WISHLIST
                                    </span>
                                    <span className="font-bold text-tui-text">{stats.wishlistCount} / {stats.totalStatus}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Panel 2: Live Activity Logs Feed */}
                    <div className="border border-tui-border bg-tui-panel p-6 shadow-md">
                        <div className="text-xs text-tui-text font-mono font-bold uppercase mb-4 tracking-wider flex items-center gap-2">
                            <Activity className="h-4 w-4 text-tui-purple" />
                            [ RECENT TRANSACTIONS ]
                        </div>
                        <div className="bg-tui-input border border-tui-border p-3 h-44 overflow-y-auto space-y-2.5 scrollbar-thin select-none">
                            {stats.activityLogs.map((log, index) => (
                                <div key={log.id + index} className="flex gap-2 items-start font-mono text-[10px] leading-relaxed">
                                    <span className="text-tui-text-muted select-none shrink-0">[{log.time}]</span>
                                    <span className={`px-1 font-bold shrink-0 text-[8px] border ${
                                        log.action === 'WATCH' ? 'border-tui-green/30 text-tui-green bg-tui-green/5'
                                        : log.action === 'WISHL' ? 'border-tui-purple/30 text-tui-purple bg-tui-purple/5'
                                        : log.action === 'PENDG' ? 'border-tui-amber/30 text-tui-amber bg-tui-amber/5'
                                        : 'border-tui-border text-tui-text-muted'
                                    }`}>
                                        {log.action}
                                    </span>
                                    <span className="text-tui-text-muted shrink-0 select-none">[{log.media}]</span>
                                    <span className="text-tui-text truncate flex-1 font-semibold">{log.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Panel 3: Quick Insights */}
                    <div className="border border-tui-border bg-tui-panel p-6 shadow-md">
                        <div className="text-xs text-tui-text font-mono font-bold uppercase mb-4 tracking-wider flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-tui-green" />
                            [ QUICK STATS ]
                        </div>
                        <ul className="space-y-3 font-mono text-xs">
                            <li className="flex items-center justify-between border-b border-tui-border-muted pb-2">
                                <span className="text-tui-text-muted">&gt; ADDED_THIS_WEEK</span>
                                <span className="text-tui-amber font-bold">{stats.addedThisWeekCount} titles</span>
                            </li>
                            <li className="flex items-center justify-between border-b border-tui-border-muted pb-2">
                                <span className="text-tui-text-muted">&gt; AVG_WATCH_DURATION</span>
                                <span className="text-tui-purple font-bold">{stats.avgWatchedRuntime} min</span>
                            </li>
                            <li className="flex items-center justify-between">
                                <span className="text-tui-text-muted">&gt; LONGEST_SERIES</span>
                                <span className="text-tui-green font-bold truncate max-w-[180px]" title={stats.longestSeriesName}>
                                    {stats.longestSeriesName}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <div className="relative min-h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
            {/* Ambient WebGL backdrop */}
            <DashboardParticles />
            
            <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-8">
                
                {/* ── Top Dashboard Welcome Header with Profile ── */}
                <div className="relative overflow-hidden rounded-3xl bg-neutral-900/40 border border-white/10 p-6 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    {/* Glowing highlight border */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-rose-500/30 via-violet-500/30 to-cyan-500/30" />
                    
                    <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                            {userImage ? (
                                <img
                                    src={userImage}
                                    alt="User Avatar"
                                    className="h-16 w-16 rounded-2xl border border-white/15 object-cover shadow-2xl transition-transform duration-300 hover:scale-105"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="h-16 w-16 rounded-2xl border border-white/10 bg-neutral-800/50 flex items-center justify-center text-white shadow-2xl">
                                    <User className="h-7 w-7 text-neutral-400" />
                                </div>
                            )}
                            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400 border-2 border-neutral-950" />
                            </span>
                        </div>
                        <div>
                            <div className="text-[10px] text-neutral-400 font-mono tracking-widest flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                OPERATOR CONSOLE // ONLINE
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
                                {greeting}, {userName}!
                            </h2>
                            <p className="text-xs text-neutral-400 font-mono mt-0.5">{userEmail}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-neutral-400 border-t md:border-t-0 md:pt-0 pt-4 border-white/5 w-full md:w-auto justify-between md:justify-end">
                        <div className="flex flex-col md:items-end">
                            <span className="text-[9px] text-neutral-500 uppercase tracking-wider">VAULT SIZE</span>
                            <span className="text-white font-bold text-base mt-0.5">
                                <CountUp end={stats.totalStatus} duration={1.5} />
                            </span>
                        </div>
                        <div className="w-px h-8 bg-white/10 hidden md:block" />
                        <div className="flex flex-col md:items-end">
                            <span className="text-[9px] text-neutral-500 uppercase tracking-wider">COMPLETION</span>
                            <span className="text-emerald-400 font-bold text-base mt-0.5">
                                <CountUp end={stats.completionRate} duration={1.5} suffix="%" />
                            </span>
                        </div>
                        <div className="w-px h-8 bg-white/10 hidden md:block" />
                        <div className="flex flex-col md:items-end">
                            <span className="text-[9px] text-neutral-500 uppercase tracking-wider">HOURS WATCHED</span>
                            <span className="text-sky-400 font-bold text-base mt-0.5">
                                <CountUp end={stats.hoursWatched} duration={1.5} /> <span className="text-xs font-normal text-neutral-400">h</span>
                            </span>
                        </div>
                        <Link
                            href="/profile"
                            className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-xs font-semibold text-white hover:bg-white/20 transition-all duration-200"
                        >
                            Edit Profile
                        </Link>
                    </div>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                    
                    {/* 1. Cinema Spotlight Card (Hero) - col-span-4 */}
                    <div className="col-span-full md:col-span-4 min-h-[380px] relative overflow-hidden bg-neutral-900/30 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-500 hover:border-white/15 hover:shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
                        {activeSpotlight ? (
                            <>
                                {/* Blurred Backdrop */}
                                <div className="absolute inset-0 z-0 select-none pointer-events-none">
                                    <div 
                                        className="absolute inset-0 bg-cover bg-center filter blur-3xl brightness-[0.25] opacity-60 scale-125 transition-all duration-700"
                                        style={{ backgroundImage: `url(${activeSpotlight.coverUrl || ''})` }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
                                </div>

                                <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-start justify-between h-full w-full">
                                    {/* Poster Display */}
                                    <div className="relative shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:border-amber-500/40 aspect-[2/3] w-[130px] md:w-[160px]">
                                        {activeSpotlight.coverUrl ? (
                                            <img 
                                                src={activeSpotlight.coverUrl} 
                                                alt={activeSpotlight.title} 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-[10px] text-neutral-400 font-mono uppercase">
                                                No Poster
                                            </div>
                                        )}
                                    </div>

                                    {/* Metadata */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full mt-4 sm:mt-0">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-neutral-400 font-mono uppercase tracking-widest mb-3">
                                                <span className="bg-amber-500/10 border border-amber-500/25 text-amber-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                                    <Sparkles className="h-3 w-3 animate-pulse" /> Spotlight
                                                </span>
                                                <span>•</span>
                                                <span className="font-semibold">{activeSpotlight.mediaType}</span>
                                                <span>•</span>
                                                <span>{activeSpotlight.year || 'N/A'}</span>
                                                {activeSpotlight.runtime && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{activeSpotlight.runtime} mins</span>
                                                    </>
                                                )}
                                            </div>
                                            
                                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase leading-tight mb-2 truncate">
                                                {activeSpotlight.title}
                                            </h1>

                                            <p className="text-xs sm:text-sm text-neutral-400 line-clamp-3 mb-4 max-w-2xl leading-relaxed">
                                                {activeSpotlight.description || "No description logged. This cinematic entry is safely cataloged inside your digital WatchVault."}
                                            </p>

                                            {/* Rating and Genres */}
                                            <div className="flex flex-wrap items-center gap-3">
                                                {activeSpotlight.favorite && (
                                                    <div className="flex items-center gap-1 text-xs text-rose-500 font-bold">
                                                        <Heart className="h-4 w-4 fill-current text-rose-500" />
                                                        <span>FAVORITE</span>
                                                    </div>
                                                )}
                                                
                                                {activeSpotlight.genres && activeSpotlight.genres.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {activeSpotlight.genres.slice(0, 3).map(genre => (
                                                            <span key={genre} className="bg-white/5 text-neutral-300 border border-white/5 px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider">
                                                                {genre}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 mt-6">
                                            <button 
                                                onClick={handleShuffleSpotlight}
                                                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-xs font-semibold text-white transition-all flex items-center gap-2 cursor-pointer"
                                            >
                                                <Shuffle className="h-3.5 w-3.5 text-amber-400" />
                                                Shuffle
                                            </button>
                                            <Link 
                                                href={`/library/${activeSpotlight.mediaType === 'movie' ? 'movies' : activeSpotlight.mediaType === 'tv' ? 'tv' : 'anime'}`}
                                                className="px-4 py-2 bg-white text-black hover:bg-neutral-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                                            >
                                                Open Library
                                                <ChevronRight className="h-3.5 w-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center h-full py-12">
                                <Film className="h-12 w-12 text-neutral-600 mb-3" />
                                <h2 className="text-lg font-bold text-white uppercase tracking-wide">WatchVault Spotlight</h2>
                                <p className="text-xs text-neutral-400 max-w-xs mt-1">
                                    Log titles to your catalog and highlight your favorites to showcase them here!
                                </p>
                            </div>
                        )}
                    </div>

                    {/* 2. Media Distribution Card - col-span-2 */}
                    <div className="col-span-full md:col-span-2 bg-neutral-900/30 border border-white/10 rounded-3xl p-6 flex flex-col justify-between transition-all duration-500 hover:border-white/15 hover:shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
                        <div>
                            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-widest flex items-center gap-1.5 mb-6">
                                <Compass className="h-4 w-4 text-rose-500" />
                                Media Distribution
                            </h3>
                            <div className="space-y-4">
                                <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/5 p-4 flex items-center justify-between">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                                    <div>
                                        <div className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">MOVIES</div>
                                        <div className="text-xl font-bold text-white mt-1">
                                            <CountUp end={stats.counts.movie} duration={1} />
                                        </div>
                                    </div>
                                    <Film className="h-8 w-8 text-neutral-700" />
                                </div>
                                <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/5 p-4 flex items-center justify-between">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-violet-500" />
                                    <div>
                                        <div className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">TV SHOWS</div>
                                        <div className="text-xl font-bold text-white mt-1">
                                            <CountUp end={stats.counts.tv} duration={1} />
                                        </div>
                                    </div>
                                    <Tv className="h-8 w-8 text-neutral-700" />
                                </div>
                                <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/5 p-4 flex items-center justify-between">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
                                    <div>
                                        <div className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">ANIME</div>
                                        <div className="text-xl font-bold text-white mt-1">
                                            <CountUp end={stats.counts.anime} duration={1} />
                                        </div>
                                    </div>
                                    <Sparkles className="h-8 w-8 text-neutral-700" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Watch Diary (Heatmap) - col-span-3 */}
                    <div className="col-span-full md:col-span-3 bg-neutral-900/30 border border-white/10 rounded-3xl p-6 flex flex-col justify-between transition-all duration-500 hover:border-white/15 hover:shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-widest flex items-center gap-1.5">
                                    <Activity className="h-4 w-4 text-emerald-400" />
                                    Watch Frequency Diary
                                </h3>
                                <span className="text-[9px] font-mono text-neutral-500 uppercase">Last 12 Weeks</span>
                            </div>
                            
                            <div className="flex items-center gap-2 py-2 overflow-x-auto scrollbar-hide select-none" onMouseLeave={() => setHoveredDay(null)}>
                                <div className="flex flex-col justify-between text-[8px] font-mono text-neutral-500 h-28 pr-1 select-none pointer-events-none">
                                    <span>S</span>
                                    <span>M</span>
                                    <span>T</span>
                                    <span>W</span>
                                    <span>T</span>
                                    <span>F</span>
                                    <span>S</span>
                                </div>
                                
                                <div className="flex gap-1.5">
                                    {Array.from({ length: 12 }).map((_, weekIdx) => (
                                        <div key={weekIdx} className="flex flex-col gap-1.5">
                                            {Array.from({ length: 7 }).map((_, dayIdx) => {
                                                const index = weekIdx * 7 + dayIdx;
                                                const dayData = heatmapData[index];
                                                if (!dayData) return null;
                                                
                                                const { count, dayLabel } = dayData;
                                                
                                                let colorClass = "bg-white/5 border border-white/5 hover:border-white/20";
                                                if (count > 0 && count <= 1) {
                                                    colorClass = "bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50";
                                                } else if (count > 1 && count <= 2) {
                                                    colorClass = "bg-violet-500/40 border border-violet-500/50 hover:border-violet-500/70";
                                                } else if (count > 2) {
                                                    colorClass = "bg-cyan-500 border border-cyan-500 hover:scale-105";
                                                }
                                                
                                                return (
                                                    <div
                                                        key={index}
                                                        onMouseEnter={() => setHoveredDay({ dayLabel, count })}
                                                        className={`w-3.5 h-3.5 rounded-[3px] transition-all duration-150 cursor-pointer ${colorClass}`}
                                                    />
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-3 text-[9px] font-mono text-neutral-500">
                            <div className="flex items-center gap-1.5">
                                <span>Less</span>
                                <div className="w-2.5 h-2.5 rounded-[2px] bg-white/5" />
                                <div className="w-2.5 h-2.5 rounded-[2px] bg-amber-500/20" />
                                <div className="w-2.5 h-2.5 rounded-[2px] bg-violet-500/40" />
                                <div className="w-2.5 h-2.5 rounded-[2px] bg-cyan-500" />
                                <span>More</span>
                            </div>
                            <div>
                                {hoveredDay ? (
                                    <span className="text-amber-400 font-bold">
                                        {hoveredDay.count} logged on {hoveredDay.dayLabel}
                                    </span>
                                ) : (
                                    <span>Hover to view counts</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 4. Library Analytics (Stats Deck) - col-span-3 */}
                    <div className="col-span-full md:col-span-3 bg-neutral-900/30 border border-white/10 rounded-3xl p-6 flex flex-col justify-between transition-all duration-500 hover:border-white/15 hover:shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
                        <div>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                                <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-widest flex items-center gap-1.5">
                                    <BarChart2 className="h-4 w-4 text-violet-500" />
                                    Library Analytics
                                </h3>
                                <div className="flex gap-1 bg-white/5 p-0.5 rounded-xl border border-white/5">
                                    <button
                                        onClick={() => setActiveTab("genres")}
                                        className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                                            activeTab === "genres" ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-400 hover:text-white"
                                        }`}
                                    >
                                        Genres
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("status")}
                                        className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                                            activeTab === "status" ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-400 hover:text-white"
                                        }`}
                                    >
                                        Ratio
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("decades")}
                                        className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                                            activeTab === "decades" ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-400 hover:text-white"
                                        }`}
                                    >
                                        Decades
                                    </button>
                                </div>
                            </div>

                            {/* Chart content */}
                            <div className="min-h-[140px] flex flex-col justify-center">
                                {activeTab === "genres" && (
                                    <div className="space-y-3">
                                        {topGenresList.length > 0 ? (
                                            topGenresList.map(g => {
                                                const percent = items.length > 0 ? Math.round((g.count / items.length) * 100) : 0;
                                                return (
                                                    <div key={g.name} className="space-y-1">
                                                        <div className="flex justify-between text-[10px] text-neutral-400 font-semibold">
                                                            <span className="uppercase text-white">{g.name}</span>
                                                            <span>{g.count} titles ({percent}%)</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                            <div 
                                                                className="h-full bg-gradient-to-r from-rose-500 to-violet-500 rounded-full transition-all duration-500 ease-out"
                                                                style={{ width: `${percent}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center text-xs text-neutral-500 py-6 uppercase font-mono">No genre data logged</div>
                                        )}
                                    </div>
                                )}

                                {activeTab === "status" && (
                                    <div className="flex items-center justify-around gap-6 py-2">
                                        <div className="relative h-20 w-20 shrink-0">
                                            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                                                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                                                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#38bdf8" strokeWidth="3"
                                                        strokeDasharray={`${stats.completionRate} ${100 - stats.completionRate}`} strokeDashoffset="0" className="transition-all duration-500 ease-out" />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none font-mono">
                                                <span className="text-sm font-extrabold text-white">{stats.completionRate}%</span>
                                                <span className="text-[7px] text-neutral-500 uppercase font-bold mt-0.5">Done</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-2 text-xs font-mono">
                                            <div className="flex justify-between items-center border-b border-white/5 pb-1">
                                                <span className="text-neutral-400 flex items-center gap-1.5">
                                                    <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" />
                                                    WATCHED
                                                </span>
                                                <span className="font-bold text-white">{stats.watchedCount}</span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-white/5 pb-1">
                                                <span className="text-neutral-400 flex items-center gap-1.5">
                                                    <span className="h-2 w-2 rounded-full bg-amber-400 inline-block" />
                                                    PENDING
                                                </span>
                                                <span className="font-bold text-white">{stats.pendingCount}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-neutral-400 flex items-center gap-1.5">
                                                    <span className="h-2 w-2 rounded-full bg-purple-400 inline-block" />
                                                    WISHLIST
                                                </span>
                                                <span className="font-bold text-white">{stats.wishlistCount}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "decades" && (
                                    <div className="space-y-3">
                                        {decadesData.length > 0 ? (
                                            decadesData.map(d => {
                                                const maxCount = Math.max(...decadesData.map(x => x.count), 1);
                                                const barPercent = Math.round((d.count / maxCount) * 100);
                                                return (
                                                    <div key={d.decade} className="space-y-1">
                                                        <div className="flex justify-between text-[10px] text-neutral-400 font-semibold">
                                                            <span className="text-white">{d.decade}</span>
                                                            <span>{d.count} titles</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                            <div 
                                                                className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all duration-500 ease-out"
                                                                style={{ width: `${barPercent}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center text-xs text-neutral-500 py-6 uppercase font-mono">No decade data logged</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-white/5 pt-3 mt-3 flex justify-between items-center text-[10px] font-mono text-neutral-500">
                            <span>TOTAL RUNTIME WATCHED:</span>
                            <span className="text-white font-bold">{stats.hoursWatched * 60} MIN</span>
                        </div>
                    </div>

                    {/* 5. Quick Add Autocomplete Card - col-span-3 */}
                    <div className="col-span-full md:col-span-3 bg-neutral-900/30 border border-white/10 rounded-3xl p-6 flex flex-col justify-between transition-all duration-500 hover:border-white/15 hover:shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
                        <div>
                            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                <Plus className="h-4 w-4 text-amber-400" />
                                Quick Library Add
                            </h3>
                            <p className="text-xs text-neutral-400 mb-6">
                                Search titles from TMDB and catalog them instantly.
                            </p>
                            <div className="relative z-40">
                                <TmdbSearchInput
                                    mediaType="movie"
                                    onSelect={handleQuickAdd}
                                    placeholder="Search movies/shows to add..."
                                />
                            </div>
                        </div>
                        <div className="border-t border-white/5 pt-4 flex items-center gap-2 text-[10px] font-mono text-neutral-500 mt-6">
                            <Flame className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                            <span>CONNECTED TO TMDB API FOR SYNCED POSTERS</span>
                        </div>
                    </div>

                    {/* 6. Live Vault Feed (Activity) - col-span-3 */}
                    <div className="col-span-full md:col-span-3 bg-neutral-900/30 border border-white/10 rounded-3xl p-6 flex flex-col justify-between transition-all duration-500 hover:border-white/15 hover:shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
                        <div>
                            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                                <Activity className="h-4 w-4 text-cyan-400" />
                                Live Vault Feed
                            </h3>
                            
                            <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1 scrollbar-hide">
                                {stats.activityLogs.map((log, index) => {
                                    const isSystem = log.id === "empty";
                                    return (
                                        <div key={log.id + index} className="flex gap-2.5 items-start text-[11px] group">
                                            <div className="shrink-0 mt-0.5">
                                                {log.action === 'WATCH' ? (
                                                    <div className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                                        <CheckCircle className="h-3 w-3 text-emerald-400" />
                                                    </div>
                                                ) : log.action === 'WISHL' ? (
                                                    <div className="h-5 w-5 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                                        <Heart className="h-3 w-3 text-violet-400 fill-current" />
                                                    </div>
                                                ) : log.action === 'PENDG' ? (
                                                    <div className="h-5 w-5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                                        <Clock className="h-3 w-3 text-amber-400" />
                                                    </div>
                                                ) : (
                                                    <div className="h-5 w-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                                        <Activity className="h-3 w-3 text-neutral-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-1.5">
                                                    <span className="font-bold text-white truncate block group-hover:text-amber-400 transition-colors text-xs">
                                                        {isSystem ? "SYSTEM INITIALIZED" : log.title}
                                                    </span>
                                                    <span className="text-[9px] text-neutral-500 font-mono shrink-0">
                                                        {log.time}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-neutral-400 mt-0.5">
                                                    {isSystem 
                                                        ? log.title 
                                                        : `${log.action === 'WATCH' ? 'Completed watching' : log.action === 'WISHL' ? 'Added to wishlist' : 'Moved to pending'} ${log.media.toLowerCase()}`}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="border-t border-white/5 pt-3 mt-3 flex justify-between items-center text-[10px] font-mono text-neutral-500">
                            <span>LAST TRANSACTION STATUS:</span>
                            <span className="text-emerald-400 font-bold">STABLE</span>
                        </div>
                    </div>

                    {/* 7. Favorites Showcase Carousel - col-span-full */}
                    <div className="col-span-full bg-neutral-900/30 border border-white/10 rounded-3xl p-6 flex flex-col justify-between transition-all duration-500 hover:border-white/15 hover:shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-widest flex items-center gap-1.5">
                                <Heart className="h-4 w-4 text-rose-500 fill-current" />
                                Favorites Spotlight Deck
                            </h3>
                            <Link href="/library/movies?favorite=true" className="text-[10px] font-bold text-amber-400 hover:underline flex items-center gap-0.5 uppercase tracking-wider">
                                Manage Favorites <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>

                        {stats.favoritesList.length > 0 ? (
                            <div className="flex overflow-x-auto gap-5 pb-3 scrollbar-hide">
                                {stats.favoritesList.map((item) => (
                                    <Link
                                        href={`/library/${item.mediaType === 'movie' ? 'movies' : item.mediaType === 'tv' ? 'tv' : 'anime'}`}
                                        key={item.id}
                                        className="w-[120px] shrink-0 group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-800/40 transition-all duration-500 hover:scale-[1.04] hover:border-amber-500/50 cursor-pointer"
                                    >
                                        <div className="aspect-[2/3] w-full bg-neutral-950 overflow-hidden relative">
                                            {item.coverUrl ? (
                                                <img 
                                                    src={item.coverUrl} 
                                                    alt={item.title} 
                                                    className="w-full h-full object-cover filter brightness-95 group-hover:brightness-100 transition-all duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400 uppercase font-mono bg-neutral-900">
                                                    No Poster
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2.5">
                                                <span className="text-[8px] text-amber-400 font-mono font-bold uppercase tracking-wider mb-0.5">{item.mediaType}</span>
                                                <h4 className="text-[10px] font-extrabold text-white truncate uppercase tracking-tight">{item.title}</h4>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="border border-dashed border-white/10 py-12 text-center bg-white/5 rounded-2xl">
                                <Star className="h-8 w-8 text-neutral-600 mx-auto mb-2 animate-pulse" />
                                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">No Favorites Spotlighted</div>
                                <p className="text-[10px] text-neutral-500 mt-1 uppercase">Mark entries in your libraries as favorite to highlight them here.</p>
                            </div>
                        )}
                    </div>

                </div>

                {/* Interactive Quick Add Detail Preview Popup */}
                <AnimatePresence>
                    {selectedAddResult && (
                        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
                            {/* Glass backdrop */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                                onClick={() => setSelectedAddResult(null)}
                            />
                            
                            {/* Preview Card */}
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                                className="relative w-full max-w-lg bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-[170] flex flex-col font-sans"
                            >
                                {/* Cinematic backdrop behind header */}
                                <div className="absolute top-0 left-0 right-0 h-40 bg-cover bg-center opacity-30 select-none pointer-events-none"
                                     style={{ backgroundImage: `url(${selectedAddResult.posterUrl || ''})`, filter: "blur(20px) brightness(0.6)" }} />
                                <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-[#121212]" />

                                {/* Header details */}
                                <div className="p-6 pb-2 border-b border-white/5 relative z-10 flex gap-4">
                                    <div className="w-16 h-24 rounded-lg overflow-hidden border border-white/10 shadow-lg shrink-0">
                                        {selectedAddResult.posterUrl ? (
                                            <img src={selectedAddResult.posterUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-neutral-800 flex items-center justify-center"><Film className="h-5 w-5 text-neutral-400" /></div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex flex-col justify-end pb-1">
                                        <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">// QUICK ADD PREVIEW</span>
                                        <h2 className="text-lg font-extrabold text-white tracking-tight uppercase mt-1 leading-snug truncate" title={selectedAddResult.title}>
                                            {selectedAddResult.title}
                                        </h2>
                                        <span className="text-xs text-neutral-400 font-mono">{selectedAddResult.year || "Release Year N/A"}</span>
                                    </div>
                                </div>

                                {/* Form & details */}
                                <div className="p-6 space-y-4 max-h-[300px] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                                    {selectedAddResult.overview && (
                                        <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3 bg-white/5 p-3 border border-white/5 rounded-xl">
                                            {selectedAddResult.overview}
                                        </p>
                                    )}

                                    {/* Status Options */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider font-bold">Watch Status</label>
                                        <div className="grid grid-cols-3 gap-2.5">
                                            {(["watched", "pending", "wishlist"] as Status[]).map((st) => (
                                                <button
                                                    key={st}
                                                    type="button"
                                                    onClick={() => setQuickAddStatus(st)}
                                                    className={`py-2 px-3 border text-xs font-semibold rounded-xl uppercase transition-all cursor-pointer ${
                                                        quickAddStatus === st 
                                                            ? st === "watched" ? "border-emerald-500 text-emerald-400 bg-emerald-500/10" 
                                                                : st === "pending" ? "border-amber-500 text-amber-400 bg-amber-500/10"
                                                                : "border-purple-500 text-purple-400 bg-purple-500/10"
                                                            : "border-white/10 text-neutral-400 hover:text-white"
                                                    }`}
                                                >
                                                    {st}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Rating Stars & Favorite */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider font-bold">Your Rating</label>
                                            <div className="flex gap-1.5 items-center py-1">
                                                {Array.from({ length: 5 }).map((_, starIdx) => {
                                                    const val = starIdx + 1;
                                                    return (
                                                        <button
                                                            key={starIdx}
                                                            type="button"
                                                            onClick={() => setQuickAddRating(quickAddRating === val ? 0 : val)}
                                                            className="text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer"
                                                        >
                                                            <Star className={`h-5 w-5 ${val <= quickAddRating ? "fill-current text-amber-400" : "text-neutral-600"}`} />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider font-bold">Spotlight Deck</label>
                                            <button
                                                type="button"
                                                onClick={() => setQuickAddFav(!quickAddFav)}
                                                className={`w-full py-2 px-3 border text-xs font-bold rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                                    quickAddFav 
                                                        ? "border-rose-500 text-rose-400 bg-rose-500/10" 
                                                        : "border-white/10 text-neutral-400 hover:text-white"
                                                }`}
                                            >
                                                <Heart className={`h-4 w-4 ${quickAddFav ? "fill-current" : ""}`} />
                                                <span>{quickAddFav ? "Spotlighted" : "Spotlight"}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Custom Notes */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider font-bold">Personal Comments / Notes</label>
                                        <textarea
                                            value={quickAddNotes}
                                            onChange={(e) => setQuickAddNotes(e.target.value)}
                                            placeholder="Enter notes..."
                                            rows={2}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl text-xs text-white px-3.5 py-2.5 focus:border-amber-400 outline-none resize-none placeholder:text-neutral-600"
                                        />
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="p-6 border-t border-white/5 flex gap-3 justify-end bg-black/10">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedAddResult(null)}
                                        className="px-4 py-2 border border-white/10 hover:border-white/20 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirmQuickAdd}
                                        className="px-5 py-2 bg-white text-black hover:bg-neutral-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                    >
                                        Confirm Add
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Local Toast Message */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 24, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 24, x: "-50%" }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-6 left-1/2 z-50 px-6 py-3 bg-neutral-900 border border-emerald-500 rounded-2xl text-white shadow-2xl backdrop-blur-xl text-xs font-semibold flex items-center gap-2"
                    >
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
