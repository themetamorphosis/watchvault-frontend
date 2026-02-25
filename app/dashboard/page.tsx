"use client";

import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import { useSession, signOut } from "@/components/SessionProvider";
import {
    Film,
    Tv,
    Sparkles,
    Clock,
    Heart,
    TrendingUp,
    BarChart3,
    Calendar,
    Award,
    Flame,
    Eye,
    Loader2,
    LayoutDashboard,
    LogOut,
    User,
    Share,
    Download as DownloadIcon,
    Link as LinkIcon,
    Copy,
    CheckCircle2
} from "lucide-react";
import type { Item, MediaType } from "@/lib/types";
import { getItems, updateMetadata } from "@/app/actions/items";
import { domToPng } from "modern-screenshot";

/* ─── Helpers ─── */
function formatRuntime(totalMinutes: number) {
    if (totalMinutes < 60) return { value: totalMinutes, unit: "min" };
    const hrs = Math.round(totalMinutes / 60);
    return { value: hrs, unit: hrs === 1 ? "hour" : "hours" };
}

function timeAgo(timestamp: number) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
}

const MEDIA_ICONS: Record<MediaType, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
    movie: Film,
    tv: Tv,
    anime: Sparkles,
};

const MEDIA_COLORS: Record<MediaType, { accent: string; bg: string }> = {
    movie: { accent: "#FF3864", bg: "rgba(255, 56, 100, 0.15)" },
    tv: { accent: "#A855F7", bg: "rgba(168, 85, 247, 0.15)" },
    anime: { accent: "#38BDF8", bg: "rgba(56, 189, 248, 0.15)" },
};

const MEDIA_LABELS: Record<MediaType, string> = {
    movie: "Movies",
    tv: "TV Shows",
    anime: "Anime",
};

const STATUS_COLORS: Record<string, string> = {
    watched: "#10B981",
    pending: "#F59E0B",
    wishlist: "#8B5CF6",
};

/* ─── Scroll-triggered reveal ─── */
function Reveal({
    children,
    delay = 0,
    className = "",
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-40px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/* ─── Animated stat card ─── */
function StatCard({
    value,
    label,
    icon: Icon,
    color,
    bg,
    suffix = "",
    delay = 0,
    href,
}: {
    value: number;
    label: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    color: string;
    bg: string;
    suffix?: string;
    delay?: number;
    href?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-40px" });

    const inner = (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
            className="dash-stat-card group"
        >
            {/* Glow */}
            <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background: `radial-gradient(ellipse 80% 80% at 50% 100%, ${bg}, transparent 70%)`,
                }}
            />

            <div className="relative z-10">
                <div
                    className="inline-flex items-center justify-center h-11 w-11 rounded-xl mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: bg }}
                >
                    <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <div className="text-4xl sm:text-5xl font-bold tracking-tight tabular-nums mb-1">
                    {inView ? (
                        <CountUp end={value} duration={2} delay={delay} suffix={suffix} decimals={suffix === "" && value % 1 !== 0 ? 1 : 0} />
                    ) : (
                        <span>0{suffix}</span>
                    )}
                </div>
                <div className="text-sm text-white/40 font-medium tracking-wide">{label}</div>
            </div>
        </motion.div>
    );

    if (href) {
        return <Link href={href} className="block">{inner}</Link>;
    }
    return inner;
}

/* ─── Ring / Donut chart ─── */
function RingChart({
    segments,
    size = 120,
    strokeWidth = 10,
}: {
    segments: { value: number; color: string; label: string }[];
    size?: number;
    strokeWidth?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-40px" });
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    if (total === 0) return null;

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    let offset = 0;

    return (
        <div ref={ref} className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={strokeWidth}
                />
                {/* Segments */}
                {segments.map((seg, i) => {
                    const pct = seg.value / total;
                    const dashLength = pct * circumference;
                    const dashOffset = -offset * circumference;
                    offset += pct;

                    return (
                        <motion.circle
                            key={i}
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={seg.color}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                            strokeDashoffset={dashOffset}
                            initial={{ opacity: 0 }}
                            animate={inView ? { opacity: 1 } : {}}
                            transition={{ duration: 0.8, delay: 0.3 + i * 0.15 }}
                        />
                    );
                })}
            </svg>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
                    className="text-2xl font-bold tabular-nums"
                >
                    {total}
                </motion.span>
                <span className="text-xs text-white/35">total</span>
            </div>
        </div>
    );
}

/* ─── Progress bar ─── */
function ProgressBar({
    value,
    max,
    color,
    label,
    delay = 0,
}: {
    value: number;
    max: number;
    color: string;
    label: string;
    delay?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-20px" });
    const pct = max > 0 ? (value / max) * 100 : 0;

    return (
        <div ref={ref} className="mb-3 last:mb-0">
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium text-white/70 truncate">{label}</span>
                <span className="text-xs text-white/35 tabular-nums ml-2">{value}</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${Math.min(pct, 100)}%` } : {}}
                    transition={{ duration: 1, delay: delay + 0.2, ease: [0.22, 1, 0.36, 1] }}
                />
            </div>
        </div>
    );
}

/* ─── Recent activity item ─── */
function ActivityItem({ item, delay }: { item: Item; delay: number }) {
    const Icon = MEDIA_ICONS[item.mediaType];
    const colors = MEDIA_COLORS[item.mediaType];

    return (
        <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0 group"
        >
            <div
                className="flex-shrink-0 h-9 w-9 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                style={{ background: colors.bg }}
            >
                <Icon className="h-4 w-4" style={{ color: colors.accent }} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white/80 truncate group-hover:text-white transition-colors">
                    {item.title}
                </div>
                <div className="text-xs text-white/30">
                    {MEDIA_LABELS[item.mediaType]}
                    {item.year ? ` · ${item.year}` : ""}
                </div>
            </div>
            <div className="flex items-center gap-2">
                {item.favorite && <Heart className="h-3.5 w-3.5 text-rose-400/60" fill="currentColor" />}
                <span className="text-xs text-white/25 whitespace-nowrap">{timeAgo(item.updatedAt)}</span>
            </div>
        </motion.div>
    );
}

/* ─── Favorite card ─── */
function FavoriteCard({ item }: { item: Item }) {
    const colors = MEDIA_COLORS[item.mediaType];

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="flex-shrink-0 w-40 sm:w-44 rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02] group cursor-pointer"
        >
            {/* Poster or placeholder */}
            <div className="relative h-56 overflow-hidden">
                {item.coverUrl ? (
                    <img
                        src={item.coverUrl}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div
                        className="h-full w-full flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${colors.bg}, rgba(255,255,255,0.02))` }}
                    >
                        <Film className="h-8 w-8 text-white/15" />
                    </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                {/* Fav badge */}
                <div className="absolute top-2 right-2">
                    <Heart className="h-4 w-4 text-rose-400" fill="currentColor" />
                </div>
            </div>
            <div className="p-3">
                <div className="text-sm font-medium text-white/80 truncate">{item.title}</div>
                <div className="text-xs text-white/30 mt-0.5">
                    {MEDIA_LABELS[item.mediaType]}{item.year ? ` · ${item.year}` : ""}
                </div>
            </div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════
   DASHBOARD PAGE
   ═══════════════════════════════════════════════ */

const NAV = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/movies", label: "Movies", icon: Film },
    { href: "/tv", label: "TV", icon: Tv },
    { href: "/anime", label: "Anime", icon: Sparkles },
];

/* ─── User Avatar Menu ─── */
function UserAvatarMenu() {
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const [imageError, setImageError] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setImageError(false);
    }, [session?.user?.image]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={menuRef} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full hover:bg-white/[0.06] transition-all duration-200"
            >
                <div className="h-8 w-8 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                    {session?.user?.image && !imageError ? (
                        <img
                            src={session.user.image}
                            alt=""
                            className="h-full w-full object-cover"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-rose-500/30 to-violet-500/30 text-xs font-semibold text-white/70">
                            {session?.user?.name?.[0]?.toUpperCase() || "U"}
                        </div>
                    )}
                </div>
                <span className="hidden md:block text-sm text-white/60 font-medium max-w-[120px] truncate">
                    {session?.user?.name || "User"}
                </span>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/[0.08] bg-[#111]/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden z-50"
                    >
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-white/[0.06]">
                            <div className="text-sm font-medium text-white/80 truncate">
                                {session?.user?.name || "User"}
                            </div>
                            <div className="text-xs text-white/30 truncate">
                                {session?.user?.email}
                            </div>
                        </div>

                        {/* Menu items */}
                        <div className="p-1.5">
                            <Link
                                href="/profile"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-all duration-150"
                            >
                                <User className="h-4 w-4" />
                                Profile
                            </Link>
                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-150"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function DashboardPage() {
    const [items, setItems] = useState<Item[]>([]);
    const [ready, setReady] = useState(false);
    const [runtimeLoading, setRuntimeLoading] = useState(false);
    const [runtimeDone, setRuntimeDone] = useState(false);
    const [runtimeProgress, setRuntimeProgress] = useState(0);

    /* ── Load items from server ── */
    useEffect(() => {
        getItems().then((dbItems) => {
            setItems(dbItems);
            setReady(true);
        }).catch(() => {
            setReady(true);
        });
    }, []);

    /* ── Fetch runtimes for items that don't have them ── */
    const fetchRuntimes = useCallback(async (currentItems: Item[]) => {
        const missing = currentItems.filter((it) => {
            if (it.status !== "watched" || it.runtime != null) return false;
            try { if (sessionStorage.getItem(`wv-runtime-skip-${it.id}`)) return false; } catch { }
            return true;
        });

        if (missing.length === 0) {
            setRuntimeDone(true);
            return;
        }

        setRuntimeLoading(true);
        setRuntimeProgress(0);

        const BATCH_SIZE = 3;
        const updated = new Map<string, number>();

        for (let i = 0; i < missing.length; i += BATCH_SIZE) {
            const batch = missing.slice(i, i + BATCH_SIZE);
            const results = await Promise.allSettled(
                batch.map(async (it) => {
                    const params = new URLSearchParams();
                    params.set("title", it.title);
                    params.set("type", it.mediaType);
                    if (it.year) params.set("year", String(it.year));
                    const r = await fetch(`http://127.0.0.1:8000/api/v1/media/runtime?${params.toString()}`);
                    if (!r.ok) return { id: it.id, runtime: null };
                    const data = await r.json();
                    return { id: it.id, runtime: data.runtime as number | null };
                })
            );

            for (const r of results) {
                if (r.status === "fulfilled") {
                    if (r.value.runtime != null) {
                        updated.set(r.value.id, r.value.runtime);
                        updateMetadata(r.value.id, { runtime: r.value.runtime }).catch(() => { });
                    } else {
                        try { sessionStorage.setItem(`wv-runtime-skip-${r.value.id}`, '1'); } catch { }
                    }
                }
            }
            setRuntimeProgress(Math.min(i + BATCH_SIZE, missing.length));
        }

        if (updated.size > 0) {
            setItems((prev) => {
                const next = prev.map((it) => {
                    const rt = updated.get(it.id);
                    return rt != null ? { ...it, runtime: rt, updatedAt: it.updatedAt } : it;
                });
                return next;
            });
        }

        setRuntimeLoading(false);
        setRuntimeDone(true);
    }, []);

    useEffect(() => {
        if (ready && items.length > 0) {
            fetchRuntimes(items);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ready]);

    /* ── Share feature ── */
    const [sharing, setSharing] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareLink, setShareLink] = useState<string | null>(null);
    const [generatingLink, setGeneratingLink] = useState(false);
    const [copied, setCopied] = useState(false);

    const dashboardRef = useRef<HTMLDivElement>(null);

    const handleShareClick = () => {
        setShareModalOpen(true);
        setShareLink(null);
        setCopied(false);
    };

    const generateDashboardImage = async () => {
        if (!dashboardRef.current) return null;
        try {
            await new Promise((resolve) => setTimeout(resolve, 300)); // wait for rendering and animations
            // Using modern-screenshot, which supports modern CSS (oklab/oklch) natively
            const dataUrl = await domToPng(dashboardRef.current, {
                scale: 2,
                backgroundColor: "#050505",
                style: { transform: 'scale(1)', transformOrigin: 'top left' },
                filter: (node) => {
                    const el = node as HTMLElement;
                    return el?.hasAttribute?.('data-html2canvas-ignore') ? false : true;
                }
            });
            return dataUrl;
        } catch (e) {
            console.error("Image generation error:", e);
            return null;
        }
    };

    const handleDownloadPng = async () => {
        setSharing(true);
        try {
            const dataUrl = await generateDashboardImage();
            if (dataUrl) downloadImage(dataUrl);
        } finally {
            setSharing(false);
        }
    };

    const handleGenerateLink = async () => {
        setGeneratingLink(true);
        try {
            const dataUrl = await generateDashboardImage();
            if (!dataUrl) return;

            // Convert data URI to Blob
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const file = new File([blob], "dashboard.png", { type: "image/png" });

            const formData = new FormData();
            formData.append("file", file);

            const match = document.cookie.match(/(?:^|;\s*)auth_token=([^;]*)/);
            const token = match ? match[1] : "";

            const uploadRes = await fetch("http://127.0.0.1:8000/api/v1/snapshots", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData,
            });

            if (uploadRes.ok) {
                const data = await uploadRes.json();
                if (data.url) {
                    setShareLink(data.url);
                }
            } else {
                console.error("Failed to upload image");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setGeneratingLink(false);
        }
    };

    const handleCopy = () => {
        if (shareLink) {
            navigator.clipboard.writeText(shareLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const downloadImage = (dataUrl: string) => {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `watchvault-stats-${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    /* ── Computed stats ── */
    const stats = useMemo(() => {
        const movieCount = items.filter((i) => i.mediaType === "movie").length;
        const tvCount = items.filter((i) => i.mediaType === "tv").length;
        const animeCount = items.filter((i) => i.mediaType === "anime").length;
        const totalCount = items.length;

        const watchedCount = items.filter((i) => i.status === "watched").length;
        const pendingCount = items.filter((i) => i.status === "pending").length;
        const wishlistCount = items.filter((i) => i.status === "wishlist").length;
        const favCount = items.filter((i) => i.favorite).length;

        // Total runtime
        const totalRuntime = items
            .filter((i) => i.status === "watched" && i.runtime)
            .reduce((sum, i) => sum + (i.runtime ?? 0), 0);

        // Genres
        const genreMap = new Map<string, number>();
        for (const it of items) {
            for (const g of it.genres ?? []) {
                const normalized = g.trim();
                if (normalized) genreMap.set(normalized, (genreMap.get(normalized) ?? 0) + 1);
            }
        }
        const topGenres = [...genreMap.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);
        const maxGenreCount = topGenres[0]?.[1] ?? 0;

        // Recent activity
        const recent = [...items].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 8);

        // Favorites
        const favorites = items.filter((i) => i.favorite);

        // Year distribution
        const yearMap = new Map<number, number>();
        for (const it of items) {
            if (it.year) {
                const decade = Math.floor(it.year / 10) * 10;
                yearMap.set(decade, (yearMap.get(decade) ?? 0) + 1);
            }
        }
        const decades = [...yearMap.entries()].sort((a, b) => a[0] - b[0]);

        // Items with runtime cached
        const runtimeCached = items.filter((i) => i.runtime != null).length;
        const watchedTotal = items.filter((i) => i.status === "watched").length;

        return {
            movieCount,
            tvCount,
            animeCount,
            totalCount,
            watchedCount,
            pendingCount,
            wishlistCount,
            favCount,
            totalRuntime,
            topGenres,
            maxGenreCount,
            recent,
            favorites,
            decades,
            runtimeCached,
            watchedTotal,
        };
    }, [items]);

    const runtimeFormatted = formatRuntime(stats.totalRuntime);

    if (!ready) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white/30 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#050505] text-white">
            {/* top ambient glow */}
            <div
                className="pointer-events-none fixed inset-x-0 top-0 h-72 z-0"
                style={{
                    background:
                        "radial-gradient(ellipse 70% 100% at 50% 0%, rgba(168, 85, 247, 0.08), transparent 60%)",
                }}
            />

            {/* ━━━ HEADER ━━━ */}
            <div
                className="sticky top-0 z-40 border-b border-white/[0.06]"
                style={{ background: "rgba(5, 5, 5, 0.75)", backdropFilter: "blur(20px) saturate(160%)" }}
            >
                <div className="mx-auto w-full max-w-[1600px] px-6 lg:px-10">
                    <div className="flex items-center justify-between py-4 gap-4">
                        {/* Logo */}
                        <Link
                            href="/"
                            className="text-lg font-semibold tracking-tight text-white/90 hover:text-white transition-colors duration-200"
                        >
                            WatchVault
                        </Link>

                        {/* Nav pills */}
                        <div className="hidden md:flex liquid-glass liquid-glass-pill px-1.5 py-1.5">
                            <div className="relative flex items-center gap-0.5">
                                {NAV.map((link) => {
                                    const isActive = link.href === "/dashboard";
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`relative z-10 flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium tracking-tight transition-colors duration-200 select-none ${isActive ? "text-white" : "text-white/50 hover:text-white/75"
                                                }`}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="dash-nav-pill"
                                                    className="absolute inset-0 rounded-full bg-white/[0.12]"
                                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
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

                        {/* User avatar menu */}
                        <UserAvatarMenu />
                    </div>

                    {/* Mobile nav row */}
                    <div className="md:hidden pb-3">
                        <div className="liquid-glass liquid-glass-pill px-1.5 py-1.5">
                            <div className="flex items-center justify-between gap-1">
                                {NAV.map((link) => {
                                    const isActive = link.href === "/dashboard";
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`flex-1 text-center rounded-full px-3 py-2 text-sm font-medium tracking-tight transition-all duration-200 ${isActive ? "text-white bg-white/[0.12]" : "text-white/50 hover:text-white/75"
                                                }`}
                                        >
                                            {link.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ━━━ PAGE CONTENT ━━━ */}
            <div className="relative z-10 mx-auto w-full max-w-[1600px] px-6 lg:px-10 pt-10 pb-16">

                {/* 📸 CAPTURE WRAPPER */}
                <div ref={dashboardRef} className="bg-[#050505] p-6 -mx-6 sm:p-10 sm:-mx-10 rounded-[2.5rem] mb-2 relative">
                    {/* Title */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
                    >
                        <div>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-2">
                                Dashboard
                            </h1>
                            <p className="text-sm text-white/35">
                                Your watching journey at a glance · {stats.totalCount} titles tracked
                            </p>
                        </div>

                        {/* Share Button (hidden from final capture) */}
                        <button
                            onClick={handleShareClick}
                            data-html2canvas-ignore="true"
                            className="p-3 rounded-full bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] hover:border-white/10 text-white/50 hover:text-white/90 transition-all duration-300 flex-shrink-0 relative"
                            title="Share Dashboard"
                        >
                            {sharing ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Share className="h-5 w-5" />
                            )}
                        </button>
                    </motion.div>

                    {/* ═══ MAIN STATS ROW ═══ */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatCard
                            value={stats.movieCount}
                            label="Movies"
                            icon={Film}
                            color="#FF3864"
                            bg="rgba(255, 56, 100, 0.15)"
                            delay={0}
                            href="/movies"
                        />
                        <StatCard
                            value={stats.tvCount}
                            label="TV Shows"
                            icon={Tv}
                            color="#A855F7"
                            bg="rgba(168, 85, 247, 0.15)"
                            delay={0.08}
                            href="/tv"
                        />
                        <StatCard
                            value={stats.animeCount}
                            label="Anime"
                            icon={Sparkles}
                            color="#38BDF8"
                            bg="rgba(56, 189, 248, 0.15)"
                            delay={0.16}
                            href="/anime"
                        />
                        <StatCard
                            value={stats.favCount}
                            label="Favorites"
                            icon={Heart}
                            color="#F43F5E"
                            bg="rgba(244, 63, 94, 0.12)"
                            delay={0.24}
                        />
                    </div>

                    {/* ═══ WATCH TIME + STATUS BREAKDOWN ═══ */}
                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                        {/* Watch time card */}
                        <Reveal className="md:col-span-1">
                            <div className="dash-card h-full flex flex-col items-center justify-center text-center p-8">
                                <div
                                    className="inline-flex items-center justify-center h-14 w-14 rounded-2xl mb-5"
                                    style={{ background: "rgba(16, 185, 129, 0.12)" }}
                                >
                                    <Clock className="h-7 w-7 text-emerald-400" />
                                </div>

                                <div className="text-5xl sm:text-6xl font-bold tracking-tight tabular-nums stat-value mb-1">
                                    {stats.totalRuntime > 0 ? (
                                        <CountUp end={runtimeFormatted.value} duration={2.5} decimals={runtimeFormatted.unit === "days" ? 1 : 0} />
                                    ) : runtimeDone ? (
                                        "0"
                                    ) : (
                                        "—"
                                    )}
                                </div>
                                <div className="text-lg text-white/50 font-medium mb-2">
                                    {stats.totalRuntime > 0
                                        ? runtimeFormatted.unit
                                        : runtimeLoading
                                            ? "calculating..."
                                            : runtimeDone
                                                ? "hours"
                                                : "loading..."}
                                </div>
                                <div className="text-xs text-white/30">
                                    {runtimeDone && stats.totalRuntime === 0
                                        ? "add items to track watch time"
                                        : "of content watched"}
                                </div>

                                {runtimeLoading && (
                                    <div className="mt-4 w-full max-w-[200px]">
                                        <div className="flex items-center justify-center gap-2 text-xs text-white/30 mb-2">
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            <span>Fetching runtimes...</span>
                                        </div>
                                        <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                                            <motion.div
                                                className="h-full rounded-full bg-emerald-400/60"
                                                animate={{ width: `${stats.watchedTotal > 0 ? (runtimeProgress / Math.max(stats.watchedTotal, 1)) * 100 : 0}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Reveal>

                        {/* Status breakdown */}
                        <Reveal delay={0.1} className="md:col-span-1">
                            <div className="dash-card h-full p-7">
                                <div className="flex items-center gap-2 mb-6">
                                    <BarChart3 className="h-4 w-4 text-white/40" />
                                    <h3 className="text-sm font-semibold text-white/60 tracking-wide uppercase">
                                        Status Breakdown
                                    </h3>
                                </div>

                                <div className="flex items-center justify-center mb-6">
                                    <RingChart
                                        segments={[
                                            { value: stats.watchedCount, color: STATUS_COLORS.watched, label: "Watched" },
                                            { value: stats.pendingCount, color: STATUS_COLORS.pending, label: "Pending" },
                                            { value: stats.wishlistCount, color: STATUS_COLORS.wishlist, label: "Wishlist" },
                                        ]}
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    {[
                                        { label: "Watched", count: stats.watchedCount, color: STATUS_COLORS.watched },
                                        { label: "Pending", count: stats.pendingCount, color: STATUS_COLORS.pending },
                                        { label: "Wishlist", count: stats.wishlistCount, color: STATUS_COLORS.wishlist },
                                    ].map((s) => (
                                        <div key={s.label} className="flex items-center gap-2.5">
                                            <div className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                                            <span className="text-sm text-white/60 flex-1">{s.label}</span>
                                            <span className="text-sm text-white/40 tabular-nums">{s.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Reveal>

                        {/* Fun facts */}
                        <Reveal delay={0.2} className="md:col-span-1">
                            <div className="dash-card h-full p-7">
                                <div className="flex items-center gap-2 mb-6">
                                    <Award className="h-4 w-4 text-white/40" />
                                    <h3 className="text-sm font-semibold text-white/60 tracking-wide uppercase">
                                        Quick Stats
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    {/* Total titles */}
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-violet-500/10">
                                            <Eye className="h-4 w-4 text-violet-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white/80">{stats.totalCount} titles</div>
                                            <div className="text-xs text-white/30">in your library</div>
                                        </div>
                                    </div>

                                    {/* Completion rate */}
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-emerald-500/10">
                                            <TrendingUp className="h-4 w-4 text-emerald-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white/80">
                                                {stats.totalCount > 0
                                                    ? Math.round((stats.watchedCount / stats.totalCount) * 100)
                                                    : 0}
                                                % completed
                                            </div>
                                            <div className="text-xs text-white/30">watched rate</div>
                                        </div>
                                    </div>

                                    {/* Top category */}
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-rose-500/10">
                                            <Flame className="h-4 w-4 text-rose-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white/80">
                                                {stats.movieCount >= stats.tvCount && stats.movieCount >= stats.animeCount
                                                    ? "Movies"
                                                    : stats.tvCount >= stats.animeCount
                                                        ? "TV Shows"
                                                        : "Anime"}{" "}
                                                lover
                                            </div>
                                            <div className="text-xs text-white/30">your top category</div>
                                        </div>
                                    </div>

                                    {/* Genre count */}
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-cyan-500/10">
                                            <Calendar className="h-4 w-4 text-cyan-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white/80">
                                                {stats.topGenres.length} genres
                                            </div>
                                            <div className="text-xs text-white/30">explored</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div> {/* End Capture Wrapper */}

                {/* ═══ GENRES + RECENT ACTIVITY ═══ */}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    {/* Top genres */}
                    <Reveal >
                        <div className="dash-card relative overflow-hidden p-7 border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-3xl shadow-xl shadow-black/50">
                            {/* Glassmorphic glow layer */}
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px] pointer-events-none" />
                            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-8">
                                    <div className="p-2 bg-white/[0.04] rounded-lg border border-white/[0.05]">
                                        <BarChart3 className="h-5 w-5 text-fuchsia-400" />
                                    </div>
                                    <h3 className="text-base font-semibold text-white/90 tracking-wide uppercase">
                                        Top Genres
                                    </h3>
                                </div>

                                {stats.topGenres.length > 0 ? (
                                    <div className="space-y-5">
                                        {stats.topGenres.map(([genre, count], i) => {
                                            const colors = [
                                                "#FF3864", "#A855F7", "#38BDF8", "#10B981",
                                                "#F59E0B", "#EC4899", "#6366F1", "#14B8A6",
                                            ];
                                            return (
                                                <ProgressBar
                                                    key={genre}
                                                    label={genre}
                                                    value={count}
                                                    max={stats.maxGenreCount}
                                                    color={colors[i % colors.length]}
                                                    delay={i * 0.05}
                                                />
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <div className="h-12 w-12 rounded-2xl bg-white/[0.02] flex items-center justify-center mb-4">
                                            <Sparkles className="h-6 w-6 text-white/20" />
                                        </div>
                                        <p className="text-sm font-medium text-white/50 mb-1">No genre data yet</p>
                                        <p className="text-xs text-white/30">Add genres to items to see your analytics</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Reveal>

                    {/* Recent activity */}
                    <Reveal delay={0.1}>
                        <div className="dash-card relative overflow-hidden p-7 border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-3xl shadow-xl shadow-black/50">
                            {/* Glassmorphic glow layer */}
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

                            <div className="relative z-10 flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-white/[0.04] rounded-lg border border-white/[0.05]">
                                        <Clock className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <h3 className="text-base font-semibold text-white/90 tracking-wide uppercase">
                                        Recent Activity
                                    </h3>
                                </div>
                            </div>

                            {stats.recent.length > 0 ? (
                                <div>
                                    {stats.recent.map((item, i) => (
                                        <ActivityItem key={item.id} item={item} delay={i * 0.04} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-white/25 text-center py-8">
                                    No items yet. Start adding to your library!
                                </p>
                            )}
                        </div>
                    </Reveal>
                </div>

                {/* ═══ DECADE DISTRIBUTION ═══ */}
                {stats.decades.length > 0 && (
                    <Reveal className="mb-8">
                        <div className="dash-card relative overflow-hidden p-7 border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-3xl shadow-xl shadow-black/50">
                            {/* Glassmorphic glow layer */}
                            <div className="absolute top-0 left-0 -ml-16 -mt-16 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />
                            <div className="absolute bottom-0 right-0 -mr-16 -mb-16 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

                            <div className="relative z-10 flex items-center gap-2 mb-8">
                                <div className="p-2 bg-white/[0.04] rounded-lg border border-white/[0.05]">
                                    <Calendar className="h-5 w-5 text-violet-400" />
                                </div>
                                <h3 className="text-base font-semibold text-white/90 tracking-wide uppercase">
                                    Era Distribution
                                </h3>
                            </div>

                            <div className="flex items-end gap-2 sm:gap-4 h-48 mt-8 pb-4 px-2 sm:px-4">
                                {stats.decades.map(([decade, count], i) => {
                                    const maxCount = Math.max(1, ...stats.decades.map((d) => d[1]));
                                    // Make sure bars have a small minimum height
                                    let heightPct = (count / maxCount) * 100;
                                    heightPct = Math.max(10, heightPct);

                                    return (
                                        <Reveal key={decade} delay={i * 0.05} className="flex-1 h-full flex flex-col items-center justify-end gap-3 group relative cursor-pointer">
                                            {/* Top Tooltip */}
                                            <div className="absolute top-0 -translate-y-full opacity-0 group-hover:-translate-y-[150%] group-hover:opacity-100 transition-all duration-300 pointer-events-none z-30 flex flex-col items-center">
                                                <div className="bg-white text-black text-xs font-bold py-1.5 px-3 rounded-xl shadow-2xl shadow-white/10 whitespace-nowrap tabular-nums">
                                                    {count} {count === 1 ? 'title' : 'titles'}
                                                </div>
                                                <div className="w-2 h-2 bg-white rotate-45 -mt-1" />
                                            </div>

                                            {/* Track Container */}
                                            <div className="w-full max-w-[48px] relative flex-1 flex flex-col justify-end items-center mx-auto z-10 
                                                group-hover:-translate-y-2 transition-transform duration-500 ease-out">

                                                {/* Dim glass track behind the bar */}
                                                <div className="absolute inset-0 w-full rounded-2xl bg-white/[0.02] border border-white/[0.04] backdrop-blur-sm transition-colors duration-300 group-hover:bg-white/[0.04]" />

                                                {/* Animated color fill */}
                                                <motion.div
                                                    className="w-full relative overflow-hidden rounded-2xl border-t border-white/40 shadow-[0_0_15px_rgba(56,189,248,0)] group-hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-shadow duration-300"
                                                    style={{
                                                        background: `linear-gradient(to top, rgba(168, 85, 247, 0.6), rgba(56, 189, 248, 1))`,
                                                    }}
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: `${heightPct}%`, opacity: 1 }}
                                                    transition={{
                                                        duration: 1.2,
                                                        delay: 0.1 + (i * 0.06),
                                                        type: "spring",
                                                        bounce: 0.35
                                                    }}
                                                >
                                                    {/* Specular highlight on bar */}
                                                    <div
                                                        className="absolute inset-0 w-full group-hover:opacity-100 opacity-60 transition-opacity duration-300 pointer-events-none"
                                                        style={{
                                                            background: 'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, transparent 15%, transparent 100%)'
                                                        }}
                                                    />

                                                    {/* Glowing shadow effect */}
                                                    <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-fuchsia-500/50 to-transparent blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                </motion.div>
                                            </div>

                                            {/* Decade Label */}
                                            <div className="text-xs sm:text-sm font-bold tracking-tight text-white/40 group-hover:text-white transition-colors duration-300">
                                                {decade}s
                                            </div>
                                        </Reveal>
                                    );
                                })}
                            </div>
                        </div>
                    </Reveal>
                )}

                {/* ═══ FAVORITES SHOWCASE ═══ */}
                {stats.favorites.length > 0 && (
                    <Reveal className="mb-8">
                        <div className="dash-card p-7">
                            <div className="flex items-center gap-2 mb-6">
                                <Heart className="h-4 w-4 text-rose-400/60" />
                                <h3 className="text-sm font-semibold text-white/60 tracking-wide uppercase">
                                    Your Favorites
                                </h3>
                            </div>

                            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                                <AnimatePresence>
                                    {stats.favorites.map((item, i) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05, duration: 0.4 }}
                                        >
                                            <FavoriteCard item={item} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </Reveal>
                )}

                {/* ═══ MEDIA BREAKDOWN PER TYPE ═══ */}
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                    {(["movie", "tv", "anime"] as MediaType[]).map((type, i) => {
                        const typeItems = items.filter((it) => it.mediaType === type);
                        const watched = typeItems.filter((it) => it.status === "watched").length;
                        const pending = typeItems.filter((it) => it.status === "pending").length;
                        const wishlist = typeItems.filter((it) => it.status === "wishlist").length;
                        const Icon = MEDIA_ICONS[type];
                        const colors = MEDIA_COLORS[type];

                        return (
                            <Reveal key={type} delay={i * 0.1}>
                                <Link href={type === "movie" ? "/movies" : `/${type}`}>
                                    <div className="dash-card p-6 group cursor-pointer hover:border-white/[0.12] transition-all duration-300">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="h-10 w-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                                                    style={{ background: colors.bg }}
                                                >
                                                    <Icon className="h-5 w-5" style={{ color: colors.accent }} />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-semibold text-white/80 group-hover:text-white transition-colors">
                                                        {MEDIA_LABELS[type]}
                                                    </h3>
                                                    <p className="text-xs text-white/30">{typeItems.length} total</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold tabular-nums text-white/80 group-hover:text-white transition-colors">
                                                    {formatRuntime(typeItems.filter(i => i.status === "watched" && i.runtime).reduce((sum, i) => sum + (i.runtime ?? 0), 0)).value}
                                                    <span className="text-[10px] text-white/40 ml-1 uppercase">{formatRuntime(typeItems.filter(i => i.status === "watched" && i.runtime).reduce((sum, i) => sum + (i.runtime ?? 0), 0)).unit}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div className="rounded-lg p-2 bg-white/[0.02]">
                                                <div className="text-lg font-bold tabular-nums" style={{ color: STATUS_COLORS.watched }}>
                                                    {watched}
                                                </div>
                                                <div className="text-xs text-white/25">Watched</div>
                                            </div>
                                            <div className="rounded-lg p-2 bg-white/[0.02]">
                                                <div className="text-lg font-bold tabular-nums" style={{ color: STATUS_COLORS.pending }}>
                                                    {pending}
                                                </div>
                                                <div className="text-xs text-white/25">Pending</div>
                                            </div>
                                            <div className="rounded-lg p-2 bg-white/[0.02]">
                                                <div className="text-lg font-bold tabular-nums" style={{ color: STATUS_COLORS.wishlist }}>
                                                    {wishlist}
                                                </div>
                                                <div className="text-xs text-white/25">Wishlist</div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </Reveal>
                        );
                    })}
                </div>
            </div>

            {/* ━━━ FOOTER ━━━ */}
            <footer className="relative border-t border-white/[0.05] py-8 px-6 sm:px-10">
                <div className="mx-auto max-w-[1600px] flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/25">
                    <span>© 2026 WatchVault</span>
                    <div className="flex items-center gap-6">
                        {NAV.map((l) => (
                            <Link
                                key={l.href}
                                href={l.href}
                                className="hover:text-white/55 transition-colors duration-300"
                            >
                                {l.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </footer>

            {/* ━━━ SHARE MODAL ━━━ */}
            <AnimatePresence>
                {shareModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" data-html2canvas-ignore="true">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShareModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="relative w-full max-w-sm bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/[0.05]">
                                <h3 className="text-lg font-bold text-white mb-1">Share Dashboard</h3>
                                <p className="text-sm text-white/40">Select how you want to share your stats.</p>
                            </div>

                            <div className="p-6 flex flex-col gap-4">
                                <button
                                    onClick={handleDownloadPng}
                                    disabled={sharing || generatingLink}
                                    className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                            {sharing ? <Loader2 className="w-5 h-5 animate-spin" /> : <DownloadIcon className="w-5 h-5" />}
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold text-white/90 text-sm">Download Image</div>
                                            <div className="text-xs text-white/40">Save a high-res PNG</div>
                                        </div>
                                    </div>
                                </button>

                                <div className="h-[1px] w-full bg-white/[0.05]" />

                                {!shareLink ? (
                                    <button
                                        onClick={handleGenerateLink}
                                        disabled={sharing || generatingLink}
                                        className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors disabled:opacity-50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
                                                {generatingLink ? <Loader2 className="w-5 h-5 animate-spin" /> : <LinkIcon className="w-5 h-5" />}
                                            </div>
                                            <div className="text-left">
                                                <div className="font-semibold text-white/90 text-sm">Generate Link</div>
                                                <div className="text-xs text-white/40">Create a photo URL to share</div>
                                            </div>
                                        </div>
                                    </button>
                                ) : (
                                    <div className="p-4 rounded-xl border border-violet-500/30 bg-violet-500/10">
                                        <div className="text-xs font-semibold text-violet-300 mb-2 uppercase tracking-wide">Share Link Generated!</div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70 truncate select-all">
                                                {shareLink}
                                            </div>
                                            <button
                                                onClick={handleCopy}
                                                className="w-9 h-9 shrink-0 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                                            >
                                                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-white/[0.02] border-t border-white/[0.05] flex justify-end">
                                <button
                                    onClick={() => setShareModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
