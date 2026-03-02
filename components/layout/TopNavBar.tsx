"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Library,
    Compass,
    Bot,
    Users,
    User,
    LogOut,
} from "lucide-react";
import { useSession, signOut } from "@/components/SessionProvider";

/* ─── Primary Nav Tabs ─── */
const NAV_TABS = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/library", label: "Library", icon: Library },
    { href: "/discovery", label: "Discovery", icon: Compass, comingSoon: true },
    { href: "/ai", label: "AI Agent", icon: Bot, comingSoon: true },
    { href: "/social", label: "Social", icon: Users, comingSoon: true },
];

export default function TopNavBar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [profileOpen, setProfileOpen] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [toastExiting, setToastExiting] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const toastShownRef = useRef<Set<string>>(new Set());
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
            (t.href === "/library" && pathname?.startsWith("/library"))
    );

    /* Measure active tab and position pill */
    useEffect(() => {
        if (activeIdx < 0) {
            setPillStyle(null);
            return;
        }
        const el = tabRefs.current[activeIdx];
        if (!el) return;
        const parent = el.parentElement;
        if (!parent) return;
        const parentRect = parent.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        setPillStyle({
            left: elRect.left - parentRect.left,
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
                        className="flex items-center gap-2.5 mr-4 flex-shrink-0"
                    >
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-500/30 to-violet-500/30 border border-white/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-white/90">W</span>
                        </div>
                        <span className="text-[15px] font-semibold tracking-tight text-white/90 hidden sm:inline">
                            WatchVault
                        </span>
                    </Link>

                    {/* ── Center: Nav Tabs ── */}
                    <nav className="flex-1 flex items-center justify-center gap-0.5 overflow-x-auto scrollbar-hide">
                        <div className="relative flex items-center gap-0.5">
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
                                    <Link
                                        key={tab.href}
                                        ref={(el) => {
                                            tabRefs.current[idx] = el;
                                        }}
                                        href={
                                            tab.href === "/library" ? "/library/movies" : tab.href
                                        }
                                        onClick={() => {
                                            if (tab.comingSoon) handleComingSoonClick(tab.label);
                                        }}
                                        className={`nav-tab ${isActive ? "active" : ""}`}
                                    >
                                        <span className="flex items-center gap-1.5">
                                            <tab.icon className="h-4 w-4" />
                                            <span className="hidden md:inline">{tab.label}</span>
                                        </span>
                                        {tab.comingSoon && (
                                            <span className="coming-soon-dot hidden md:block">
                                                • Coming Soon
                                            </span>
                                        )}
                                    </Link>
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
