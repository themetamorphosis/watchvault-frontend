"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Clock, Heart, CheckCircle } from "lucide-react";
import type { DashboardStats } from "@/hooks/useDashboardStats";
import type { Item } from "@/lib/types";
import TmdbSearchInput from "@/components/TmdbSearchInput";
import type { TMDBSearchResult } from "@/lib/tmdb";

interface RetroDashboardProps {
  greeting: string;
  userName: string;
  userImage?: string | null;
  userEmail: string;
  stats: DashboardStats;
  activeSpotlight: Item | null;
  onQuickAdd: (result: TMDBSearchResult) => void;
  toast: string | null;
}

export default function RetroDashboard({
  greeting,
  userName,
  userImage,
  userEmail,
  stats,
  activeSpotlight,
  onQuickAdd,
  toast,
}: RetroDashboardProps) {
  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-tui-panel border border-tui-border p-6 gap-6 mb-8 rounded-none relative overflow-hidden shadow-xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-tui-amber via-tui-purple to-tui-green" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative shrink-0">
            {userImage ? (
              <img
                src={userImage}
                alt="User Avatar"
                className="h-16 w-16 rounded-none border-2 border-tui-border object-cover shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="h-16 w-16 rounded-none border border-tui-border bg-tui-input flex items-center justify-center text-tui-text shadow-lg">
                <span className="text-xl">?</span>
              </div>
            )}
            <span className="absolute bottom-0 right-0 h-3 w-3 bg-tui-green border-2 border-tui-panel rounded-full" />
          </div>
          <div>
            <div className="text-xs text-tui-text-muted font-mono uppercase tracking-widest">
              {/* ACTIVE SESSION PROFILE */}
            </div>
            <h2 className="text-xl font-bold text-tui-text uppercase tracking-wide mt-0.5">
              {greeting}, {userName}!
            </h2>
            <p className="text-[11px] text-tui-text-muted font-mono mt-0.5">
              {userEmail}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-tui-text-muted border-t md:border-t-0 md:pt-0 pt-4 border-tui-border-muted w-full md:w-auto relative z-10 justify-between md:justify-end">
          <div>
            <span className="opacity-60 uppercase">SYSTEM BUILD: </span>
            <span className="text-tui-text font-bold">2.21</span>
          </div>
          <div>
            <span className="opacity-60 uppercase">STATUS: </span>
            <span className="text-tui-green font-bold">[ ONLINE ]</span>
          </div>
          <Link
            href="/profile"
            className="px-3 py-1.5 border border-tui-border text-[10px] text-tui-text-muted hover:border-tui-text hover:text-tui-text transition-all bg-tui-input uppercase"
          >
            [ EDIT PROFILE ]
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="border border-tui-border bg-tui-panel p-6 shadow-md relative group transition-transform duration-200 ease-out transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all text-tui-amber">
            <Film className="h-12 w-12" />
          </div>
          <div className="text-xs text-tui-text-muted font-mono uppercase tracking-wider">
            TOTAL DIRECTORY SIZE
          </div>
          <div className="text-4xl font-extrabold text-tui-text mt-2 font-mono">
            {stats.totalStatus.toString().padStart(2, "0")}
          </div>
          <div className="text-[10px] text-tui-text-muted font-mono uppercase mt-2 tracking-tight">
            &gt; {stats.counts.movie} MOVIES | {stats.counts.tv} TV |{" "}
            {stats.counts.anime} ANIME
          </div>
        </div>
        <div className="border border-tui-border bg-tui-panel p-6 shadow-md relative group transition-transform duration-200 ease-out transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all text-tui-purple">
            <Clock className="h-12 w-12" />
          </div>
          <div className="text-xs text-tui-text-muted font-mono uppercase tracking-wider">
            HOURS CONSUMED
          </div>
          <div className="text-4xl font-extrabold text-tui-text mt-2 font-mono">
            {stats.hoursWatched.toString().padStart(2, "0")}
          </div>
          <div className="text-[10px] text-tui-text-muted font-mono uppercase mt-2 tracking-tight">
            &gt; AVG {stats.avgWatchedRuntime} MIN / TITLE
          </div>
        </div>
        <div className="border border-tui-border bg-tui-panel p-6 shadow-md relative group transition-transform duration-200 ease-out transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all text-tui-green">
            <Heart className="h-12 w-12" />
          </div>
          <div className="text-xs text-tui-text-muted font-mono uppercase tracking-wider">
            SPOTLIGHT PICKS
          </div>
          <div className="text-4xl font-extrabold text-tui-text mt-2 font-mono">
            {stats.counts.favorites.toString().padStart(2, "0")}
          </div>
          <div className="text-[10px] text-tui-text-muted font-mono uppercase mt-2 tracking-tight">
            &gt; TOP GENRE DIRECTORY: {stats.topGenre}
          </div>
        </div>
        <div className="border border-tui-border bg-tui-panel p-6 shadow-md relative group transition-transform duration-200 ease-out transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all text-tui-amber">
            <CheckCircle className="h-12 w-12" />
          </div>
          <div className="text-xs text-tui-text-muted font-mono uppercase tracking-wider">
            COMPLETION RATIO
          </div>
          <div className="text-4xl font-extrabold text-tui-text mt-2 font-mono">
            {stats.completionRate.toString().padStart(2, "0")}%
          </div>
          <div className="text-[10px] text-tui-text-muted font-mono uppercase mt-2 tracking-tight">
            &gt; {stats.watchedCount} OF {stats.totalStatus} CATALOGED
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-6">
          {/* Spotlight */}
          <div className="bg-tui-panel border border-tui-border p-6">
            <div className="text-[10px] font-bold text-tui-text-muted font-mono uppercase tracking-wider mb-4">
              SPOTLIGHT PICK
            </div>
            {activeSpotlight ? (
              <div className="flex items-start gap-4">
                {activeSpotlight.coverUrl && (
                  <div className="w-20 h-28 bg-tui-input border border-tui-border overflow-hidden shrink-0">
                    <img
                      src={activeSpotlight.coverUrl}
                      alt={activeSpotlight.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-tui-text uppercase tracking-wider truncate">
                    {activeSpotlight.title}
                  </div>
                  <div className="text-[10px] text-tui-text-muted font-mono mt-1 uppercase">
                    {activeSpotlight.mediaType} |{" "}
                    {activeSpotlight.year || "N/A"}
                  </div>
                  <p className="text-xs text-tui-text-muted mt-2 line-clamp-2">
                    {activeSpotlight.description || "No description available."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-tui-text-muted font-mono uppercase">
                No spotlight pick
              </div>
            )}
          </div>

          {/* Favorites */}
          <div className="border border-tui-border bg-tui-panel p-6">
            <div className="text-[10px] font-bold text-tui-text-muted font-mono uppercase tracking-wider mb-4">
              FAVORITES DIRECTORY
            </div>
            {stats.favoritesList.length > 0 ? (
              <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                {stats.favoritesList.map((item) => (
                  <div
                    key={item.id}
                    className="w-[80px] shrink-0 border border-tui-border bg-tui-input"
                  >
                    {item.coverUrl ? (
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        className="w-full aspect-[2/3] object-cover"
                      />
                    ) : (
                      <div className="w-full aspect-[2/3] bg-tui-input flex items-center justify-center text-[8px] text-tui-text-muted font-mono">
                        N/A
                      </div>
                    )}
                    <div className="p-1 text-[8px] text-tui-text-muted font-mono uppercase truncate">
                      {item.title}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-tui-text-muted font-mono uppercase">
                No favorites
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="border border-tui-border bg-tui-panel p-6">
            <div className="text-[10px] font-bold text-tui-text-muted font-mono uppercase tracking-wider mb-4">
              RECENT TRANSACTIONS
            </div>
            <div className="space-y-2">
              {stats.activityLogs.slice(0, 4).map((log, idx) => (
                <div
                  key={log.id + idx}
                  className="flex items-center gap-2 text-[10px] font-mono text-tui-text-muted"
                >
                  <span className="text-tui-text">{log.time}</span>
                  <span className="text-tui-amber font-bold w-10">
                    {log.action}
                  </span>
                  <span className="truncate">{log.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Add */}
          <div className="border border-tui-border bg-tui-panel p-6">
            <div className="text-[10px] font-bold text-tui-text-muted font-mono uppercase tracking-wider mb-4">
              QUICK ADD
            </div>
            <TmdbSearchInput
              mediaType="movie"
              onSelect={onQuickAdd}
              placeholder="SEARCH TMDB..."
            />
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 24, x: "-50%" }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-1/2 z-50 px-6 py-3 bg-tui-panel border border-tui-green text-tui-green font-mono text-xs uppercase shadow-2xl animate-pulse"
          >
            &gt; {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
