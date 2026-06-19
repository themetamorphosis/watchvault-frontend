"use client";

import React, { useState } from "react";
import { Activity } from "lucide-react";
import type { HeatmapDay } from "@/hooks/useHeatmapData";

interface ActivityHeatmapProps {
    data: HeatmapDay[];
}

export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
    const [hoveredDay, setHoveredDay] = useState<{ dayLabel: string; count: number } | null>(null);

    return (
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
                        <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                    </div>
                    <div className="flex gap-1.5">
                        {Array.from({ length: 12 }).map((_, weekIdx) => (
                            <div key={weekIdx} className="flex flex-col gap-1.5">
                                {Array.from({ length: 7 }).map((_, dayIdx) => {
                                    const index = weekIdx * 7 + dayIdx;
                                    const dayData = data[index];
                                    if (!dayData) return null;
                                    const { count, dayLabel } = dayData;
                                    let colorClass = "bg-white/5 border border-white/5 hover:border-white/20";
                                    if (count > 0 && count <= 1) colorClass = "bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50";
                                    else if (count > 1 && count <= 2) colorClass = "bg-violet-500/40 border border-violet-500/50 hover:border-violet-500/70";
                                    else if (count > 2) colorClass = "bg-cyan-500 border border-cyan-500 hover:scale-105";
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
                        <span className="text-amber-400 font-bold">{hoveredDay.dayLabel}: {hoveredDay.count} added</span>
                    ) : (
                        <span>HOVER TO INSPECT</span>
                    )}
                </div>
            </div>
        </div>
    );
}
