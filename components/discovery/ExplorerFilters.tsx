"use client";

import React from "react";
import { DECADES, SORT_OPTIONS } from "@/lib/discovery-constants";

interface ExplorerFiltersProps {
    genreFilter: string;
    decadeFilter: number | "";
    sortBy: string;
    genres: { id: number; name: string }[];
    onGenreChange: (genre: string) => void;
    onDecadeChange: (decade: number | "") => void;
    onSortChange: (sort: string) => void;
    onReset: () => void;
}

export default function ExplorerFilters({
    genreFilter, decadeFilter, sortBy, genres,
    onGenreChange, onDecadeChange, onSortChange, onReset,
}: ExplorerFiltersProps) {
    return (
        <div className="w-full lg:w-[260px] shrink-0 border border-tui-border bg-tui-panel p-5 space-y-6 font-mono text-xs rounded-xl shadow-lg">
            <div className="flex justify-between items-center border-b border-tui-border pb-2">
                <span className="font-bold uppercase tracking-wider text-tui-text">Filter Grid</span>
                <button onClick={onReset} className="text-[10px] text-tui-text-muted hover:text-tui-text cursor-pointer">[RESET]</button>
            </div>

            <div className="space-y-2">
                <label className="block font-bold text-tui-text-muted uppercase tracking-wider">GENRES</label>
                <select
                    value={genreFilter}
                    onChange={(e) => onGenreChange(e.target.value)}
                    className="w-full h-9 bg-tui-bg border border-tui-border text-tui-text px-3 outline-none focus:border-tui-text transition-all font-mono rounded-lg"
                >
                    <option value="">[ ALL GENRES ]</option>
                    {genres.map((g) => (
                        <option key={g.id} value={String(g.id)}>{g.name.toUpperCase()}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <label className="block font-bold text-tui-text-muted uppercase tracking-wider">RELEASE DECADE</label>
                <select
                    value={decadeFilter}
                    onChange={(e) => onDecadeChange(e.target.value ? Number(e.target.value) : "")}
                    className="w-full h-9 bg-tui-bg border border-tui-border text-tui-text px-3 outline-none focus:border-tui-text transition-all font-mono rounded-lg"
                >
                    <option value="">[ ALL YEARS ]</option>
                    {DECADES.map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <label className="block font-bold text-tui-text-muted uppercase tracking-wider">SORT ORDER</label>
                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="w-full h-9 bg-tui-bg border border-tui-border text-tui-text px-3 outline-none focus:border-tui-text transition-all font-mono rounded-lg"
                >
                    {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label.toUpperCase()}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
