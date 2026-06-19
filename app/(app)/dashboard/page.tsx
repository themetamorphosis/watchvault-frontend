"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "@/components/SessionProvider";
import type { Status } from "@/lib/types";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Flame, CheckCircle } from "lucide-react";
import { useRetroTheme } from "@/components/layout/RetroThemeContext";
import DashboardStatsHeader from "@/components/dashboard/DashboardStats";
import SpotlightHero from "@/components/dashboard/SpotlightHero";
import MediaDistribution from "@/components/dashboard/MediaDistribution";
import ActivityHeatmap from "@/components/dashboard/ActivityHeatmap";
import GenreChart from "@/components/dashboard/GenreChart";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import FavoritesDeck from "@/components/dashboard/FavoritesDeck";
import QuickAddModal from "@/components/dashboard/QuickAddModal";
import RetroDashboard from "@/components/dashboard/RetroDashboard";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useHeatmapData } from "@/hooks/useHeatmapData";
import { useTopGenres } from "@/hooks/useTopGenres";
import { useLibraryData } from "@/hooks/useLibraryData";
import TmdbSearchInput from "@/components/TmdbSearchInput";
import type { TMDBSearchResult } from "@/lib/tmdb";

const DashboardParticles = dynamic(() => import("@/components/DashboardParticles"), { ssr: false });

export default function DashboardPage() {
    const { data: session } = useSession();
    const userId = session?.user?.id || "guest";
    const userName = session?.user?.name || "User";
    const userImage = session?.user?.image;
    const userEmail = session?.user?.email || "";

    const { theme } = useRetroTheme();
    const isRetro = theme.startsWith("retro");

    const { items, ready, mounted, handleUpsert, ensureCover, syncingRefs } = useLibraryData(userId);
    const stats = useDashboardStats(items);
    const heatmapData = useHeatmapData(items);
    const topGenres = useTopGenres(items, 5);

    const [greeting, setGreeting] = useState("Welcome back");
    const [toast, setToast] = useState<string | null>(null);
    const [shuffledId, setShuffledId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"genres" | "status" | "decades">("genres");
    const [selectedAddResult, setSelectedAddResult] = useState<TMDBSearchResult | null>(null);
    const [quickAddStatus, setQuickAddStatus] = useState<Status>("watched");
    const [quickAddFav, setQuickAddFav] = useState(false);
    const [quickAddRating, setQuickAddRating] = useState<number>(0);
    const [quickAddNotes, setQuickAddNotes] = useState("");

    const decadesData = useMemo(() => {
        const counts = new Map<string, number>();
        items.forEach(item => {
            if (!item.year) return;
            const decadeKey = `${Math.floor(item.year / 10) * 10}s`;
            counts.set(decadeKey, (counts.get(decadeKey) || 0) + 1);
        });
        return Array.from(counts.entries()).map(([decade, count]) => ({ decade, count })).sort((a, b) => a.decade.localeCompare(b.decade));
    }, [items]);

    const activeSpotlight = useMemo(() => {
        if (shuffledId) { const f = items.find(i => i.id === shuffledId); if (f) return f; }
        const favors = items.filter(i => i.favorite);
        const withCover = favors.filter(i => i.coverUrl);
        return withCover[0] || favors[0] || items.filter(i => i.coverUrl)[0] || items[0] || null;
    }, [items, shuffledId]);

    useEffect(() => {
        const h = new Date().getHours();
        setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
    }, []);

    useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }, [toast]);

    useEffect(() => {
        if (!ready || stats.favoritesList.length === 0) return;
        stats.favoritesList.filter(it => !syncingRefs.current.has(it.id) && !(it.coverUrl && it.genres?.length && it.description)).slice(0, 3).forEach(it => { syncingRefs.current.add(it.id); ensureCover(it); });
    }, [stats.favoritesList, ready, ensureCover, syncingRefs]);

    const handleShuffle = () => { if (items.length <= 1) return; const pool = activeSpotlight ? items.filter(i => i.id !== activeSpotlight.id) : items; setShuffledId(pool[Math.floor(Math.random() * pool.length)].id); };

    const handleConfirmQuickAdd = async () => {
        if (!selectedAddResult) return;
        const starsStr = quickAddRating > 0 ? "★".repeat(quickAddRating) + "☆".repeat(5 - quickAddRating) + " " : "";
        await handleUpsert({
            title: selectedAddResult.title,
            mediaType: selectedAddResult.mediaType as any,
            status: quickAddStatus,
            favorite: quickAddFav,
            year: selectedAddResult.year ?? undefined,
            coverUrl: selectedAddResult.posterUrl?.replace("/w185/", "/w780/") ?? undefined,
            genres: selectedAddResult.genres,
            description: selectedAddResult.overview ?? undefined,
            notes: (starsStr + quickAddNotes).trim() || undefined,
        });
        setToast(`Added "${selectedAddResult.title}" to library!`);
        setSelectedAddResult(null);
        setQuickAddStatus("watched"); setQuickAddFav(false); setQuickAddRating(0); setQuickAddNotes("");
    };

    if (!mounted || !ready) {
        return isRetro ? (
            <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-8 font-mono text-xs uppercase text-tui-text-muted animate-pulse">&gt; INITIALIZING ANALYTICS DASHBOARD...</div>
        ) : (
            <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-8 font-sans space-y-6 animate-pulse">
                <div className="h-32 bg-tui-panel border border-tui-border rounded-2xl" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-tui-panel border border-tui-border rounded-2xl" />)}</div>
            </div>
        );
    }

    if (isRetro) {
        return <RetroDashboard greeting={greeting} userName={userName} userImage={userImage} userEmail={userEmail} stats={stats} activeSpotlight={activeSpotlight} onQuickAdd={r => setSelectedAddResult(r)} toast={toast} />;
    }

    return (
        <div className="relative min-h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
            <DashboardParticles />
            <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-8">
                <DashboardStatsHeader greeting={greeting} userName={userName} userImage={userImage} userEmail={userEmail} stats={stats} />
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                    <SpotlightHero item={activeSpotlight} onShuffle={handleShuffle} />
                    <MediaDistribution movieCount={stats.counts.movie} tvCount={stats.counts.tv} animeCount={stats.counts.anime} />
                    <ActivityHeatmap data={heatmapData} />
                    <GenreChart stats={stats} topGenres={topGenres} decadesData={decadesData} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <div className="col-span-full md:col-span-3 bg-neutral-900/30 border border-white/10 rounded-3xl p-6 flex flex-col justify-between transition-all duration-500 hover:border-white/15 hover:shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
                        <div>
                            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-widest flex items-center gap-1.5 mb-1"><Plus className="h-4 w-4 text-amber-400" /> Quick Library Add</h3>
                            <p className="text-xs text-neutral-400 mb-6">Search titles from TMDB and catalog them instantly.</p>
                            <div className="relative z-40"><TmdbSearchInput mediaType="movie" onSelect={r => setSelectedAddResult(r)} placeholder="Search movies/shows to add..." /></div>
                        </div>
                        <div className="border-t border-white/5 pt-4 flex items-center gap-2 text-[10px] font-mono text-neutral-500 mt-6"><Flame className="h-3.5 w-3.5 text-amber-500 animate-pulse" /><span>CONNECTED TO TMDB API FOR SYNCED POSTERS</span></div>
                    </div>
                    <ActivityFeed logs={stats.activityLogs} />
                    <FavoritesDeck items={stats.favoritesList} />
                </div>
                <QuickAddModal selectedAddResult={selectedAddResult} quickAddStatus={quickAddStatus} quickAddFav={quickAddFav} quickAddRating={quickAddRating} quickAddNotes={quickAddNotes} setStatus={setQuickAddStatus} setFav={setQuickAddFav} setRating={setQuickAddRating} setNotes={setQuickAddNotes} onConfirm={handleConfirmQuickAdd} onCancel={() => setSelectedAddResult(null)} />
                <AnimatePresence>{toast && <motion.div initial={{ opacity: 0, y: 24, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 24, x: "-50%" }} transition={{ duration: 0.2 }} className="fixed bottom-6 left-1/2 z-50 px-6 py-3 bg-neutral-900 border border-emerald-500 rounded-2xl text-white shadow-2xl backdrop-blur-xl text-xs font-semibold flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" />{toast}</motion.div>}</AnimatePresence>
            </div>
        </div>
    );
}
