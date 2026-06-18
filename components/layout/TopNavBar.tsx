"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Library,
    Heart,
    Compass,
    Bot,
    Users,
    User,
    LogOut,
    Menu,
    X,
    Film,
    Tv,
    Sparkles,
    ChevronDown,
    Moon,
    Sun,
    Terminal,
    Monitor,
} from "lucide-react";
import { useSession, signOut } from "@/components/SessionProvider";
import { useRetroTheme } from "./RetroThemeContext";

const THEMES = [
    { value: "modern-dark", label: "Modern Dark", icon: Moon },
    { value: "modern-light", label: "Modern Light", icon: Sun },
    { value: "retro-dark", label: "Retro Dark", icon: Terminal },
    { value: "retro-light", label: "Retro Light", icon: Monitor },
] as const;

/* ─── Primary Nav Tabs ─── */
const NAV_TABS = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
        href: "/library",
        label: "Library",
        icon: Library,
        subTabs: [
            { href: '/library/movies', label: 'Movies', icon: Film },
            { href: '/library/tv', label: 'TV Shows', icon: Tv },
            { href: '/library/anime', label: 'Anime', icon: Sparkles },
        ]
    },
    {
        href: "/wishlist",
        label: "Wishlist",
        icon: Heart,
        subTabs: [
            { href: '/wishlist/movies', label: 'Movies', icon: Film },
            { href: '/wishlist/tv', label: 'TV Shows', icon: Tv },
            { href: '/wishlist/anime', label: 'Anime', icon: Sparkles },
        ]
    },
    { href: "/discovery", label: "Discovery", icon: Compass, comingSoon: true },
    { href: "/social", label: "Social", icon: Users, comingSoon: true },
];

export default function TopNavBar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { theme, toggleTheme, setTheme } = useRetroTheme();
    const [profileOpen, setProfileOpen] = useState(false);
    const [themeOpen, setThemeOpen] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [toastExiting, setToastExiting] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const themeRef = useRef<HTMLDivElement>(null);
    const toastShownRef = useRef<Set<string>>(new Set());

    /* Close dropdowns on outside click */
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (
                profileRef.current &&
                !profileRef.current.contains(e.target as Node)
            ) {
                setProfileOpen(false);
            }
            if (
                themeRef.current &&
                !themeRef.current.contains(e.target as Node)
            ) {
                setThemeOpen(false);
            }
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    /* Toast auto-dismiss */
    useEffect(() => {
        if (!toast) return;
        const t1 = setTimeout(() => setToastExiting(true), 2400);
        const t2 = setTimeout(() => {
            setToast(null);
            setToastExiting(false);
        }, 2700);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [toast]);

    const handleComingSoonClick = useCallback((label: string) => {
        if (!toastShownRef.current.has(label)) {
            toastShownRef.current.add(label);
            setToast(`${label} is under development`);
            setToastExiting(false);
        }
    }, []);

    /* Determine active tab */
    const activeIdx = NAV_TABS.findIndex(
        (t) =>
            pathname === t.href ||
            (t.href !== "/dashboard" && pathname?.startsWith(t.href + "/")) ||
            (t.href === "/library" && pathname?.startsWith("/library")) ||
            (t.href === "/wishlist" && pathname?.startsWith("/wishlist"))
    );

    const isRetro = theme.startsWith("retro");
    const currentThemeInfo = THEMES.find(t => t.value === theme) || THEMES[0];

    return (
        <>
            <header className={
                isRetro 
                    ? "sticky top-0 z-50 bg-nav-bg border-b border-nav-border font-mono text-sm uppercase"
                    : "sticky top-0 z-50 bg-tui-bg/75 border-b border-tui-border backdrop-blur-xl text-sm font-sans"
            }>
                <div className="mx-auto max-w-[1440px] px-6 lg:px-10 h-20 flex items-center justify-between gap-4">
                    {/* ── Left: Logo ── */}
                    {isRetro ? (
                        <Link
                            href="/"
                            className="flex items-center gap-1 mr-4 flex-shrink-0"
                        >
                            <span className="text-[#f0a500] dark:text-tui-amber font-bold text-sm md:text-base">guest@watchvault</span>
                            <span className="text-nav-text opacity-60 text-sm md:text-base">:</span>
                            <span className="text-blue-400 font-bold text-sm md:text-base">~</span>
                            <span className="text-nav-text font-bold text-sm md:text-base">$</span>
                        </Link>
                    ) : (
                        <Link
                            href="/"
                            className="flex items-center gap-1.5 mr-4 flex-shrink-0 select-none"
                        >
                            <span className="text-[17px] font-bold tracking-tight text-tui-text">
                                WatchVault
                            </span>
                            <span className="text-[15px] font-normal tracking-tight text-tui-text-muted">
                                Personal
                            </span>
                        </Link>
                    )}

                    {/* ── Mobile hamburger button ── */}
                    <button
                        className={
                            isRetro
                                ? "md:hidden ml-auto flex items-center justify-center h-10 px-3 border border-nav-border text-nav-text bg-nav-bg hover:text-nav-hover-text hover:border-nav-hover-text transition-all flex-shrink-0 text-xs font-bold cursor-pointer"
                                : "md:hidden ml-auto flex items-center justify-center h-10 w-10 rounded-full border border-tui-border bg-tui-panel text-tui-text hover:bg-tui-input hover:text-tui-text transition-all flex-shrink-0 cursor-pointer"
                        }
                        onClick={() => setMobileNavOpen(!mobileNavOpen)}
                        aria-label="Toggle navigation"
                    >
                        {isRetro ? (
                            mobileNavOpen ? "[ CLOSE ]" : "[ MENU ]"
                        ) : (
                            mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />
                        )}
                    </button>

                    {/* ── Center: Nav Tabs (hidden on mobile) ── */}
                    <nav className="hidden md:flex flex-1 items-center justify-center px-2">
                        <div className={
                            isRetro 
                                ? "flex items-center border border-nav-border bg-nav-bg/60 p-1"
                                : "flex items-center gap-1 bg-tui-input border border-tui-border rounded-full p-1"
                        }>
                            {NAV_TABS.map((tab, idx) => {
                                const isActive = idx === activeIdx;
                                return (
                                    <React.Fragment key={tab.href}>
                                        {isRetro && idx > 0 && <span className="text-nav-border px-1.5 select-none">|</span>}
                                        <div className="relative group">
                                            <Link
                                                href={
                                                    tab.href === "/library" ? "/library/movies"
                                                    : tab.href === "/wishlist" ? "/wishlist/movies"
                                                    : tab.href
                                                }
                                                onClick={() => {
                                                    if (tab.comingSoon) handleComingSoonClick(tab.label);
                                                }}
                                                className={
                                                    isRetro 
                                                        ? `px-5 py-2.5 transition-all duration-150 block uppercase tracking-wider text-xs md:text-sm ${
                                                            isActive
                                                                ? "bg-nav-active-bg text-nav-active-text font-bold"
                                                                : "text-nav-text hover:text-nav-hover-text hover:bg-nav-hover-bg"
                                                        }`
                                                        : `px-4 py-2 transition-all duration-200 block text-xs md:text-sm font-medium rounded-full ${
                                                            isActive
                                                                ? "bg-tui-panel border border-tui-border/40 text-tui-text font-semibold shadow-sm animate-none"
                                                                : "text-tui-text-muted hover:text-tui-text hover:bg-tui-input"
                                                        }`
                                                }
                                            >
                                                <span className="flex items-center gap-1">
                                                    {tab.label}
                                                    {tab.subTabs && <ChevronDown className="h-3 w-3 opacity-60 group-hover:rotate-180 transition-transform duration-200" />}
                                                </span>
                                            </Link>

                                            {/* Dropdown Menu */}
                                            {tab.subTabs && (
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                                    <div className={
                                                        isRetro 
                                                            ? "flex flex-col p-1 min-w-[140px] bg-nav-bg border border-nav-border shadow-2xl"
                                                            : "flex flex-col p-1.5 min-w-[150px] bg-tui-panel border border-tui-border rounded-2xl backdrop-blur-xl shadow-[0_16px_48px_rgba(0,0,0,0.15)]"
                                                    }>
                                                        {tab.subTabs.map(sub => {
                                                            const isSubActive = pathname === sub.href;
                                                            return (
                                                                <Link
                                                                    key={sub.href}
                                                                    href={sub.href}
                                                                    className={
                                                                        isRetro 
                                                                            ? `flex items-center gap-2 px-3 py-2 transition-colors uppercase ${isSubActive
                                                                                ? "bg-nav-hover-bg text-nav-active-bg border-l-2 border-nav-active-bg font-bold"
                                                                                : "text-nav-text hover:text-nav-hover-text hover:bg-nav-hover-bg"
                                                                                }`
                                                                            : `flex items-center gap-2 px-3.5 py-2 transition-colors rounded-xl text-xs md:text-sm font-medium ${isSubActive
                                                                                ? "bg-tui-input text-tui-amber font-semibold"
                                                                                : "text-tui-text-muted hover:text-tui-text hover:bg-tui-input/50"
                                                                                }`
                                                                    }
                                                                >
                                                                    {sub.label}
                                                                </Link>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </nav>

                    {/* ── Right: Profile & Theme dropdowns ── */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Custom Dropdown Theme Selector */}
                        <div className="relative" ref={themeRef}>
                            {isRetro ? (
                                <button
                                    onClick={() => setThemeOpen(!themeOpen)}
                                    className="flex items-center justify-center h-10 px-3.5 border border-nav-border bg-nav-bg text-nav-text hover:border-nav-active-bg hover:text-nav-hover-text transition-all uppercase text-xs md:text-sm cursor-pointer"
                                >
                                    [ THEME: {currentThemeInfo.label.toUpperCase()} ]
                                </button>
                            ) : (
                                <button
                                    onClick={() => setThemeOpen(!themeOpen)}
                                    className="flex items-center gap-2 h-10 px-4 rounded-full border border-tui-border bg-tui-panel text-tui-text hover:bg-tui-input hover:text-tui-text transition-all text-xs md:text-sm cursor-pointer animate-none"
                                >
                                    <currentThemeInfo.icon className="h-4 w-4 text-tui-amber" />
                                    <span className="font-medium">{currentThemeInfo.label}</span>
                                    <ChevronDown className={`h-3 w-3 opacity-60 transition-transform ${themeOpen ? "rotate-180" : ""}`} />
                                </button>
                            )}

                            <AnimatePresence>
                                {themeOpen && (
                                    <motion.div
                                        initial={isRetro ? { opacity: 0, y: 4 } : { opacity: 0, y: 8, scale: 0.95 }}
                                        animate={isRetro ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, scale: 1 }}
                                        exit={isRetro ? { opacity: 0, y: 4 } : { opacity: 0, y: 8, scale: 0.95 }}
                                        transition={isRetro ? { duration: 0.1 } : { duration: 0.15, ease: "easeOut" }}
                                        className={
                                            isRetro 
                                                ? "absolute right-0 top-full mt-1.5 min-w-[200px] bg-nav-bg border border-nav-border shadow-2xl z-50 p-1 font-mono text-xs uppercase"
                                                : "absolute right-0 top-full mt-2 min-w-[220px] bg-tui-panel border border-tui-border rounded-2xl backdrop-blur-xl shadow-[0_16px_48px_rgba(0,0,0,0.15)] z-50 p-1.5"
                                        }
                                    >
                                        {THEMES.map((t) => (
                                            <button
                                                key={t.value}
                                                onClick={() => {
                                                    setTheme(t.value);
                                                    setThemeOpen(false);
                                                }}
                                                className={
                                                    isRetro 
                                                        ? `flex items-center gap-2 w-full px-3 py-2 text-left transition-colors uppercase ${
                                                            theme === t.value 
                                                                ? "bg-nav-hover-bg text-nav-active-bg font-bold border-l-2 border-nav-active-bg" 
                                                                : "text-nav-text hover:text-nav-hover-text hover:bg-nav-hover-bg"
                                                        }`
                                                        : `flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-left transition-all ${
                                                            theme === t.value 
                                                                ? "bg-tui-input text-tui-amber font-semibold" 
                                                                : "text-tui-text-muted hover:text-tui-text hover:bg-tui-input/50"
                                                        }`
                                                }
                                            >
                                                <t.icon className={`h-4 w-4 ${isRetro ? "" : theme === t.value ? "text-tui-amber" : "text-tui-text-muted group-hover:text-tui-text"}`} />
                                                <span className={isRetro ? "" : "text-sm"}>{isRetro ? `[ ${t.label} ]` : t.label}</span>
                                                {!isRetro && theme === t.value && (
                                                    <span className="ml-auto text-xs text-tui-text-muted font-sans">Active</span>
                                                )}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {session && (
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className={
                                        isRetro 
                                            ? "flex items-center gap-2 px-4 py-2 border border-nav-border bg-nav-bg text-nav-text hover:border-nav-active-bg hover:text-nav-hover-text transition-all uppercase text-xs md:text-sm cursor-pointer"
                                            : "flex items-center gap-2 px-4 py-2 rounded-full border border-tui-border bg-tui-panel text-tui-text hover:bg-tui-input hover:text-tui-text transition-all text-xs md:text-sm cursor-pointer"
                                    }
                                    aria-label="Profile menu"
                                >
                                    {!isRetro && (
                                        session.user?.image ? (
                                            <img 
                                                src={session.user.image} 
                                                alt="" 
                                                className="h-5 w-5 rounded-full object-cover flex-shrink-0"
                                            />
                                        ) : (
                                            <span className="h-5 w-5 rounded-full flex items-center justify-center bg-gradient-to-br from-rose-500/40 to-violet-500/40 text-[9px] font-bold text-white flex-shrink-0">
                                                {session.user?.name?.[0]?.toUpperCase() || "U"}
                                            </span>
                                        )
                                    )}
                                    <span>{session.user?.name || "GUEST"}</span>
                                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                                </button>

                                <AnimatePresence>
                                    {profileOpen && (
                                        <motion.div
                                            initial={isRetro ? { opacity: 0, y: 4 } : { opacity: 0, y: 8, scale: 0.95 }}
                                            animate={isRetro ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, scale: 1 }}
                                            exit={isRetro ? { opacity: 0, y: 4 } : { opacity: 0, y: 8, scale: 0.95 }}
                                            transition={isRetro ? { duration: 0.1 } : { duration: 0.15, ease: "easeOut" }}
                                            className={
                                                isRetro 
                                                    ? "absolute right-0 top-full mt-1.5 min-w-[180px] bg-nav-bg border border-nav-border shadow-2xl z-50 p-1"
                                                    : "absolute right-0 top-full mt-2 min-w-[200px] bg-tui-panel border border-tui-border rounded-2xl backdrop-blur-xl shadow-[0_16px_48px_rgba(0,0,0,0.15)] z-50 p-1.5"
                                            }
                                        >
                                            {isRetro ? (
                                                <>
                                                    <div className="px-3 py-2 border-b border-nav-border mb-1">
                                                        <div className="text-[10px] text-nav-text opacity-80 font-mono">EMAIL</div>
                                                        <div className="text-nav-text-muted truncate text-[11px] font-mono">{session.user?.email}</div>
                                                    </div>
                                                    <Link
                                                        href="/profile"
                                                        className="flex items-center gap-2 w-full px-3 py-2 text-nav-text hover:text-nav-hover-text hover:bg-nav-hover-bg transition-colors font-mono"
                                                        onClick={() => setProfileOpen(false)}
                                                    >
                                                        <User className="h-3.5 w-3.5" />
                                                        [ PROFILE ]
                                                    </Link>
                                                    <button
                                                        className="flex items-center gap-2 w-full px-3 py-2 text-tui-red/80 hover:text-tui-red hover:bg-nav-hover-bg transition-colors text-left font-mono cursor-pointer"
                                                        onClick={() => {
                                                            setProfileOpen(false);
                                                            signOut();
                                                        }}
                                                    >
                                                        <LogOut className="h-3.5 w-3.5" />
                                                        [ SIGN OUT ]
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="px-4 py-3 border-b border-tui-border mb-1.5">
                                                        <div className="text-[10px] text-tui-text-muted font-semibold uppercase tracking-wider">EMAIL</div>
                                                        <div className="text-tui-text truncate text-xs mt-0.5">{session.user?.email}</div>
                                                    </div>
                                                    <Link
                                                        href="/profile"
                                                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-tui-text-muted hover:text-tui-text hover:bg-tui-input/50 transition-colors"
                                                        onClick={() => setProfileOpen(false)}
                                                    >
                                                        <User className="h-4 w-4" />
                                                        <span>Profile</span>
                                                    </Link>
                                                    <button
                                                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-tui-red hover:bg-tui-red/10 transition-colors text-left cursor-pointer"
                                                        onClick={() => {
                                                            setProfileOpen(false);
                                                            signOut();
                                                        }}
                                                    >
                                                        <LogOut className="h-4 w-4" />
                                                        <span>Sign Out</span>
                                                    </button>
                                                </>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile nav drawer */}
            <AnimatePresence>
                {mobileNavOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className={
                            isRetro 
                                ? "md:hidden fixed top-20 left-0 right-0 z-40 overflow-hidden font-mono text-xs uppercase"
                                : "md:hidden fixed top-20 left-0 right-0 z-40 overflow-hidden font-sans text-sm"
                        }
                    >
                        <div className={
                            isRetro 
                                ? "bg-nav-bg border-b border-nav-border"
                                : "bg-tui-panel border-b border-tui-border backdrop-blur-2xl shadow-2xl"
                        }>
                            <div className="px-4 py-3 flex flex-col gap-1">
                                {NAV_TABS.map((tab) => {
                                    const isActive = pathname === tab.href ||
                                        (tab.href !== "/dashboard" && pathname?.startsWith(tab.href + "/")) ||
                                        (tab.href === "/library" && pathname?.startsWith("/library")) ||
                                        (tab.href === "/wishlist" && pathname?.startsWith("/wishlist"));
                                    return (
                                        <Link
                                            key={tab.href}
                                            href={tab.href === "/library" ? "/library/movies" : tab.href === "/wishlist" ? "/wishlist/movies" : tab.href}
                                            onClick={() => {
                                                if (tab.comingSoon) handleComingSoonClick(tab.label);
                                                setMobileNavOpen(false);
                                            }}
                                            className={
                                                isRetro 
                                                    ? `flex items-center gap-3 px-4 py-3 border border-transparent transition-colors ${isActive
                                                        ? "bg-nav-active-bg text-nav-active-text font-bold"
                                                        : "text-nav-text hover:text-nav-hover-text hover:bg-nav-hover-bg"
                                                        }`
                                                    : `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${isActive
                                                        ? "bg-tui-input text-tui-amber font-semibold"
                                                        : "text-tui-text-muted hover:text-tui-text hover:bg-tui-input/50"
                                                        }`
                                            }
                                        >
                                            <span>{tab.label}</span>
                                            {tab.comingSoon && (
                                                <span className={isRetro ? "ml-auto text-[9px] text-nav-text-muted" : "ml-auto text-[9px] text-tui-text-muted"}>
                                                    {isRetro ? "[ DEV ]" : "DEV"}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <div className={
                        isRetro
                            ? "fixed bottom-5 right-5 z-50 px-4 py-2 bg-tui-panel border border-tui-amber text-tui-amber font-mono text-xs uppercase shadow-2xl animate-pulse"
                            : "fixed bottom-5 right-5 z-50 px-5 py-3 bg-tui-panel border border-tui-border rounded-2xl text-tui-text font-sans text-sm shadow-2xl backdrop-blur-xl"
                    }>
                        {isRetro ? `> ${toast}` : toast}
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
