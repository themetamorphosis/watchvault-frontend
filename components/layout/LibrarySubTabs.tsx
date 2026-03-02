"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Film, Tv, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const SUB_TABS = [
    { href: "/library/movies", label: "Movies", icon: Film },
    { href: "/library/tv", label: "TV Shows", icon: Tv },
    { href: "/library/anime", label: "Anime", icon: Sparkles },
];

export default function LibrarySubTabs() {
    const pathname = usePathname();
    const activeHref =
        SUB_TABS.find((t) => pathname?.startsWith(t.href))?.href ?? "";

    return (
        <div className="sub-tab-bar">
            <div className="max-w-[1440px] mx-auto px-6 md:px-10">
                <div className="relative flex items-center gap-1">
                    {SUB_TABS.map((tab) => {
                        const isActive = tab.href === activeHref;
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={`sub-tab ${isActive ? "active" : ""}`}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                                {isActive && (
                                    <motion.div
                                        layoutId="library-sub-indicator"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/50 rounded-full"
                                        transition={{
                                            type: "spring",
                                            stiffness: 380,
                                            damping: 30,
                                        }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
