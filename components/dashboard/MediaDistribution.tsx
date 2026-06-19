"use client";

import React from "react";
import CountUp from "react-countup";
import { Compass, Film, Tv, Sparkles } from "lucide-react";

interface MediaDistributionProps {
    movieCount: number;
    tvCount: number;
    animeCount: number;
}

const ITEMS = [
    { key: "movie" as const, label: "MOVIES", color: "bg-rose-500", icon: Film },
    { key: "tv" as const, label: "TV SHOWS", color: "bg-violet-500", icon: Tv },
    { key: "anime" as const, label: "ANIME", color: "bg-cyan-500", icon: Sparkles },
];

export default function MediaDistribution({ movieCount, tvCount, animeCount }: MediaDistributionProps) {
    const counts = { movie: movieCount, tv: tvCount, anime: animeCount };

    return (
        <div className="col-span-full md:col-span-2 bg-neutral-900/30 border border-white/10 rounded-3xl p-6 flex flex-col justify-between transition-all duration-500 hover:border-white/15 hover:shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
            <div>
                <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-widest flex items-center gap-1.5 mb-6">
                    <Compass className="h-4 w-4 text-rose-500" />
                    Media Distribution
                </h3>
                <div className="space-y-4">
                    {ITEMS.map(({ key, label, color, icon: Icon }) => (
                        <div key={label} className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/5 p-4 flex items-center justify-between">
                            <div className={`absolute top-0 left-0 w-1 h-full ${color}`} />
                            <div>
                                <div className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">{label}</div>
                                <div className="text-xl font-bold text-white mt-1"><CountUp end={counts[key]} duration={1} /></div>
                            </div>
                            <Icon className="h-8 w-8 text-neutral-700" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
