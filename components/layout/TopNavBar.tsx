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
} from "lucide-react";
import { useSession, signOut } from "@/components/SessionProvider";

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
    { href: "/ai", label: "AI Agent", icon: Bot, comingSoon: true },
    { href: "/social", label: "Social", icon: Users, comingSoon: true },
];

export default function TopNavBar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [profileOpen, setProfileOpen] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [toastExiting, setToastExiting] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const toastShownRef = useRef<Set<string>>(new Set());
    const navContainerRef = useRef<HTMLDivElement>(null);
    const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
    const [pillStyle, setPillStyle] = useState<{
        left: number;
        width: number;
    } | null>(null);

    /* Close profile dropdown on outside click */
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (
                profileRef.current &&
                !profileRef.current.contains(e.target as Node)
            ) {
                setProfileOpen(false);
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

    /* Measure active tab and position pill */
    useEffect(() => {
        if (activeIdx < 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPillStyle(null);
            return;
        }
        const el = tabRefs.current[activeIdx];
        if (!el) return;
        const container = navContainerRef.current;
        if (!container) return;
        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();

        setPillStyle({
            left: elRect.left - containerRect.left,
            width: elRect.width,
        });
    }, [activeIdx, pathname]);

    return (
        <>
            <header className="app-header">
                <div className="app-header-inner">
                    {/* ── Left: Logo ── */}
                    <Link
                        href="/"
                        className="flex items-center gap-1.5 mr-4 flex-shrink-0"
                    >
                        <span className="text-[17px] font-bold tracking-tight text-white/90">
                            WatchVault
                        </span>
                        <span className="text-[15px] font-normal tracking-tight text-white/40">
                            Personal
                        </span>
                    </Link>

                    {/* ── Mobile hamburger button ── */}
                    <button
                        className="md:hidden ml-auto flex items-center justify-center h-9 w-9 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.10] transition-all duration-200 flex-shrink-0"
                        onClick={() => setMobileNavOpen(!mobileNavOpen)}
                        aria-label="Toggle navigation"
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            {mobileNavOpen ? (
                                <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                                    <X className="h-4 w-4" />
                                </motion.div>
                            ) : (
                                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                                    <Menu className="h-4 w-4" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>

                    {/* ── Center: Nav Tabs (hidden on mobile) ── */}
                    <nav className="hidden md:flex flex-1 items-center justify-start sm:justify-center gap-0.5 px-2">
                        <div ref={navContainerRef} className="relative flex items-center gap-0.5">
                            {/* Animated pill background — positioned via ref measurements */}
                            {pillStyle && (
                                <motion.div
                                    className="absolute top-0 bottom-0 rounded-[10px] bg-white/[0.08]"
                                    animate={{
                                        left: pillStyle.left,
                                        width: pillStyle.width,
                                    }}
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    style={{ height: "100%", pointerEvents: "none" }}
                                />
                            )}

                            {NAV_TABS.map((tab, idx) => {
                                const isActive = idx === activeIdx;
                                return (
                                    <div key={tab.href} className="relative group">
                                        <Link
                                            ref={(el) => {
                                                tabRefs.current[idx] = el;
                                            }}
                                            href={
                                                tab.href === "/library" ? "/library/movies"
                                                : tab.href === "/wishlist" ? "/wishlist/movies"
                                                : tab.href
                                            }
                                            onClick={() => {
                                                if (tab.comingSoon) handleComingSoonClick(tab.label);
                                            }}
                                            className={`nav-tab ${isActive ? "active" : ""}`}
                                        >
                                            <span className="flex items-center gap-1.5">
                                                <tab.icon className="h-4 w-4" />
                                                <span className="hidden md:inline">{tab.label}</span>
                                                {tab.subTabs && <ChevronDown className="h-3 w-3 opacity-40 ml-0.5 group-hover:rotate-180 transition-transform duration-200" />}
                                            </span>
                                            {tab.comingSoon && (
                                                <span className="coming-soon-dot hidden md:block">
                                                    • Coming Soon
                                                </span>
                                            )}
                                        </Link>

                                        {/* Dropdown Menu */}
                                        {tab.subTabs && (
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                                <div className="flex flex-col gap-1 p-1.5 min-w-[150px] rounded-2xl bg-[rgba(10,10,10,0.95)] backdrop-blur-xl border border-white/[0.08] shadow-2xl">
                                                    {tab.subTabs.map(sub => {
                                                        const isSubActive = pathname === sub.href;
                                                        return (
                                                            <Link
                                                                key={sub.href}
                                                                href={sub.href}
                                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isSubActive
                                                                    ? "text-white bg-white/[0.08]"
                                                                    : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                                                                    }`}
                                                            >
                                                                <sub.icon className="h-4 w-4" />
                                                                {sub.label}
                                                            </Link>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </nav>

                    {/* ── Right: Profile ── */}
                    <div className="flex items-center gap-3 flex-shrink-0">

                        {/* Profile */}
                        {session && (
                            <div className="profile-menu" ref={profileRef}>
                                <button
                                    className="profile-btn"
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    aria-label="Profile menu"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden border border-white/10 bg-gradient-to-br from-rose-500/25 to-violet-500/25">
                                        {session.user?.image ? (
                                            <img
                                                src={session.user.image}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xs font-semibold text-white/80">
                                                {session.user?.name?.[0]?.toUpperCase() || "U"}
                                            </span>
                                        )}
                                    </span>
                                </button>

                                <AnimatePresence>
                                    {profileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -4, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -4, scale: 0.96 }}
                                            transition={{ duration: 0.15 }}
                                            className="profile-dropdown"
                                        >
                                            <div className="px-3 py-2 mb-1">
                                                <div className="text-sm font-medium text-white/80 truncate">
                                                    {session.user?.name || "User"}
                                                </div>
                                                <div className="text-xs text-white/35 truncate">
                                                    {session.user?.email}
                                                </div>
                                            </div>
                                            <div className="h-px bg-white/6 mx-2 mb-1" />
                                            <Link
                                                href="/profile"
                                                className="profile-dropdown-item"
                                                onClick={() => setProfileOpen(false)}
                                            >
                                                <User className="h-4 w-4" />
                                                Profile
                                            </Link>
                                            <button
                                                className="profile-dropdown-item text-rose-400/80 hover:text-rose-400"
                                                onClick={() => {
                                                    setProfileOpen(false);
                                                    signOut();
                                                }}
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Sign Out
                                            </button>
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
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="md:hidden fixed top-[64px] left-0 right-0 z-40 overflow-hidden"
                    >
                        <div className="bg-[rgba(5,5,5,0.95)] border-b border-white/[0.06] backdrop-blur-2xl">
                            <div className="px-4 py-3 flex flex-col gap-0.5">
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
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 ${isActive
                                                ? "text-white bg-white/[0.08]"
                                                : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                                                }`}
                                        >
                                            <tab.icon className="h-4 w-4" />
                                            <span>{tab.label}</span>
                                            {tab.comingSoon && (
                                                <span className="ml-auto text-[10px] uppercase tracking-wider text-white/25 font-medium">
                                                    Coming Soon
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
                    <div className={`toast ${toastExiting ? "exiting" : ""}`}>
                        {toast}
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
