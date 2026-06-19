"use client";

import React from "react";
import Link from "next/link";
import CountUp from "react-countup";
import { User } from "lucide-react";
import type { DashboardStats } from "@/hooks/useDashboardStats";

interface DashboardStatsHeaderProps {
    greeting: string;
    userName: string;
    userImage?: string | null;
    userEmail: string;
    stats: DashboardStats;
}

export default function DashboardStatsHeader({ greeting, userName, userImage, userEmail, stats }: DashboardStatsHeaderProps) {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-neutral-900/40 border border-white/10 p-6 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-rose-500/30 via-violet-500/30 to-cyan-500/30" />

            <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                    {userImage ? (
                        <img
                            src={userImage}
                            alt="User Avatar"
                            className="h-16 w-16 rounded-2xl border border-white/15 object-cover shadow-2xl transition-transform duration-300 hover:scale-105"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
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
    );
}
