"use client";

import React from "react";
import { Activity, CheckCircle, Heart, Clock } from "lucide-react";
import type { DashboardStats } from "@/hooks/useDashboardStats";

interface ActivityFeedProps {
    logs: DashboardStats["activityLogs"];
}

export default function ActivityFeed({ logs }: ActivityFeedProps) {
    return (
        <div className="col-span-full md:col-span-3 bg-neutral-900/30 border border-white/10 rounded-3xl p-6 flex flex-col justify-between transition-all duration-500 hover:border-white/15 hover:shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
            <div>
                <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                    <Activity className="h-4 w-4 text-cyan-400" />
                    Live Vault Feed
                </h3>

                <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1 scrollbar-hide">
                    {logs.map((log, index) => {
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
    );
}
