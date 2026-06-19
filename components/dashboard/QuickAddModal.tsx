"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Heart, Check, X } from "lucide-react";
import type { Status } from "@/lib/types";
import type { TMDBSearchResult } from "@/lib/tmdb";

interface QuickAddModalProps {
    selectedAddResult: TMDBSearchResult | null;
    quickAddStatus: Status;
    quickAddFav: boolean;
    quickAddRating: number;
    quickAddNotes: string;
    setStatus: (s: Status) => void;
    setFav: (v: boolean) => void;
    setRating: (n: number) => void;
    setNotes: (s: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function QuickAddModal({
    selectedAddResult,
    quickAddStatus,
    quickAddFav,
    quickAddRating,
    quickAddNotes,
    setStatus,
    setFav,
    setRating,
    setNotes,
    onConfirm,
    onCancel,
}: QuickAddModalProps) {
    return (
        <AnimatePresence>
            {selectedAddResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={onCancel}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-neutral-900/90 border border-white/10 backdrop-blur-xl shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-white">Add to Library</h2>
                                <p className="text-xs text-neutral-400 mt-0.5 font-mono">{selectedAddResult.title} ({selectedAddResult.year || 'N/A'})</p>
                            </div>
                            <button onClick={onCancel} className="p-2 rounded-xl hover:bg-white/10 transition cursor-pointer">
                                <X className="h-5 w-5 text-neutral-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-5">
                            {/* Status Selection */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider font-bold">Status</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(["watched", "pending", "wishlist"] as Status[]).map(st => (
                                        <button
                                            key={st}
                                            type="button"
                                            onClick={() => setStatus(st)}
                                            className={`py-2.5 border text-xs font-bold rounded-xl uppercase tracking-wider transition-all cursor-pointer ${
                                                quickAddStatus === st
                                                    ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                                                    : "border-white/10 text-neutral-400 hover:text-white hover:border-white/20"
                                            }`}
                                        >
                                            {st === "watched" ? <Check className="h-4 w-4 mx-auto mb-1" /> : null}
                                            {st}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Rating */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider font-bold">Rating</label>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map(val => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => setRating(quickAddRating === val ? 0 : val)}
                                            className="cursor-pointer transition-transform hover:scale-110"
                                        >
                                            <Star className={`h-5 w-5 ${val <= quickAddRating ? "fill-current text-amber-400" : "text-neutral-600"}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider font-bold">Spotlight Deck</label>
                                <button
                                    type="button"
                                    onClick={() => setFav(!quickAddFav)}
                                    className={`w-full py-2 px-3 border text-xs font-bold rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                        quickAddFav 
                                            ? "border-rose-500 text-rose-400 bg-rose-500/10" 
                                            : "border-white/10 text-neutral-400 hover:text-white"
                                    }`}
                                >
                                    <Heart className={`h-4 w-4 ${quickAddFav ? "fill-current" : ""}`} />
                                    <span>{quickAddFav ? "Spotlighted" : "Spotlight"}</span>
                                </button>
                            </div>

                            {/* Notes */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider font-bold">Personal Comments / Notes</label>
                                <textarea
                                    value={quickAddNotes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Enter notes..."
                                    rows={2}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl text-xs text-white px-3.5 py-2.5 focus:border-amber-400 outline-none resize-none placeholder:text-neutral-600"
                                />
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-white/5 flex gap-3 justify-end bg-black/10">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2 border border-white/10 hover:border-white/20 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={onConfirm}
                                className="px-5 py-2 bg-white text-black hover:bg-neutral-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                                Confirm Add
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

