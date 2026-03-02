"use client";

import React from "react";
import { Search, LayoutGrid, List } from "lucide-react";

const GENRES = [
    "All Genres",
    "Action",
    "Comedy",
    "Drama",
    "Horror",
    "Sci-Fi",
    "Romance",
    "Thriller",
    "Animation",
    "Documentary",
    "Crime",
    "Fantasy",
];

const YEARS = [
    "All Years",
    "2026",
    "2025",
    "2024",
    "2023",
    "2022",
    "2021",
    "2020",
    "2010s",
    "2000s",
    "90s",
    "80s",
    "Classic",
];

const SORTS = [
    { value: "recent", label: "Recently Added" },
    { value: "title", label: "Name (A → Z)" },
    { value: "year", label: "Release Year" },
    { value: "rating", label: "Rating" },
];

interface SearchFilterBarProps {
    search: string;
    onSearchChange: (v: string) => void;
    genre: string;
    onGenreChange: (v: string) => void;
    year: string;
    onYearChange: (v: string) => void;
    sort: string;
    onSortChange: (v: string) => void;
    view: "grid" | "list";
    onViewChange: (v: "grid" | "list") => void;
}

export default function SearchFilterBar({
    search,
    onSearchChange,
    genre,
    onGenreChange,
    year,
    onYearChange,
    sort,
    onSortChange,
    view,
    onViewChange,
}: SearchFilterBarProps) {
    return (
        <div className="search-filter-bar">
            {/* Search */}
            <div className="relative flex items-center flex-1 min-w-[160px]">
                <Search className="absolute left-3 h-4 w-4 text-white/25 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search titles..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="!pl-9"
                />
            </div>

            {/* Genre */}
            <select
                value={genre}
                onChange={(e) => onGenreChange(e.target.value)}
                className="sfb-select hidden sm:block"
            >
                {GENRES.map((g) => (
                    <option key={g} value={g}>
                        {g}
                    </option>
                ))}
            </select>

            {/* Year */}
            <select
                value={year}
                onChange={(e) => onYearChange(e.target.value)}
                className="sfb-select hidden md:block"
            >
                {YEARS.map((y) => (
                    <option key={y} value={y}>
                        {y}
                    </option>
                ))}
            </select>

            {/* Sort */}
            <select
                value={sort}
                onChange={(e) => onSortChange(e.target.value)}
                className="sfb-select hidden sm:block"
            >
                {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                        {s.label}
                    </option>
                ))}
            </select>

            {/* View Toggle */}
            <div className="flex gap-1">
                <button
                    className={`view-toggle-btn ${view === "grid" ? "active" : ""}`}
                    onClick={() => onViewChange("grid")}
                    aria-label="Grid view"
                >
                    <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                    className={`view-toggle-btn ${view === "list" ? "active" : ""}`}
                    onClick={() => onViewChange("list")}
                    aria-label="List view"
                >
                    <List className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
