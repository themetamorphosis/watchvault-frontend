"use client";

import React from "react";
import CountUp from "react-countup";
import { BarChart2, Eye, Clock, Heart } from "lucide-react";
import type { DashboardStats } from "@/hooks/useDashboardStats";
import type { GenreCount } from "@/hooks/useTopGenres";

interface GenreChartProps {
  stats: DashboardStats;
  topGenres: GenreCount[];
  decadesData: { decade: string; count: number }[];
  activeTab: "genres" | "status" | "decades";
  setActiveTab: (tab: "genres" | "status" | "decades") => void;
}

export default function GenreChart({
  stats,
  topGenres,
  decadesData,
  activeTab,
  setActiveTab,
}: GenreChartProps) {
  return (
    <div className="col-span-full md:col-span-3 bg-neutral-900/30 border border-white/10 rounded-3xl p-6 flex flex-col justify-between transition-all duration-500 hover:border-white/15 hover:shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-widest flex items-center gap-1.5">
            <BarChart2 className="h-4 w-4 text-violet-400" />
            Genre & Trend Breakdown
          </h3>
          <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
            {(["genres", "status", "decades"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-white/10 text-white"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[200px]">
          {activeTab === "genres" && (
            <div className="space-y-3">
              {topGenres.length > 0 ? (
                topGenres.map((g) => {
                  const maxCount = Math.max(
                    ...topGenres.map((x) => x.count),
                    1,
                  );
                  const barPercent = Math.round((g.count / maxCount) * 100);
                  return (
                    <div key={g.name} className="space-y-1">
                      <div className="flex justify-between text-[10px] text-neutral-400 font-semibold">
                        <span className="text-white">{g.name}</span>
                        <span>{g.count} titles</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${barPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-xs text-neutral-500 py-6 uppercase font-mono">
                  No genre data logged
                </div>
              )}
            </div>
          )}

          {activeTab === "status" && (
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                <Eye className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
                <div className="text-lg font-bold text-white">
                  <CountUp end={stats.watchedCount} duration={1} />
                </div>
                <div className="text-[9px] text-neutral-400 font-mono uppercase mt-1">
                  Watched
                </div>
              </div>
              <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                <Clock className="h-5 w-5 text-amber-400 mx-auto mb-2" />
                <div className="text-lg font-bold text-white">
                  <CountUp end={stats.pendingCount} duration={1} />
                </div>
                <div className="text-[9px] text-neutral-400 font-mono uppercase mt-1">
                  Pending
                </div>
              </div>
              <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                <Heart className="h-5 w-5 text-violet-400 mx-auto mb-2" />
                <div className="text-lg font-bold text-white">
                  <CountUp end={stats.wishlistCount} duration={1} />
                </div>
                <div className="text-[9px] text-neutral-400 font-mono uppercase mt-1">
                  Wishlist
                </div>
              </div>
            </div>
          )}

          {activeTab === "decades" && (
            <div className="space-y-3">
              {decadesData.length > 0 ? (
                decadesData.map((d) => {
                  const maxCount = Math.max(
                    ...decadesData.map((x) => x.count),
                    1,
                  );
                  const barPercent = Math.round((d.count / maxCount) * 100);
                  return (
                    <div key={d.decade} className="space-y-1">
                      <div className="flex justify-between text-[10px] text-neutral-400 font-semibold">
                        <span className="text-white">{d.decade}</span>
                        <span>{d.count} titles</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${barPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-xs text-neutral-500 py-6 uppercase font-mono">
                  No decade data logged
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/5 pt-3 mt-3 flex justify-between items-center text-[10px] font-mono text-neutral-500">
        <span>TOTAL RUNTIME WATCHED:</span>
        <span className="text-white font-bold">
          {stats.hoursWatched * 60} MIN
        </span>
      </div>
    </div>
  );
}
