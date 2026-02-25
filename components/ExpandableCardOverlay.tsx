"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Item } from "@/lib/types";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { X, Pencil, Trash2, Star, Calendar, Tag, Clock, FileText } from "lucide-react";

function statusLabel(s: string) {
    if (s === "watched") return "Watched";
    if (s === "pending") return "Pending";
    return "Wishlisted";
}

function statusColor(s: string) {
    if (s === "watched") return "bg-emerald-500/20 text-emerald-300 ring-emerald-500/30";
    if (s === "pending") return "bg-amber-500/20 text-amber-300 ring-amber-500/30";
    return "bg-sky-500/20 text-sky-300 ring-sky-500/30";
}

function yearLabel(item: Item): string {
    if (item.mediaType === "movie") return item.year ? String(item.year) : "";
    const start = item.year;
    const end = item.endYear;
    const running = item.running;
    if (start && end) return `${start}–${end}`;
    if (start && running) return `${start}–Running`;
    if (!start && running) return "Running";
    if (start) return String(start);
    return "";
}

export default function ExpandableCardOverlay({
    item,
    layoutId,
    onClose,
    onEdit,
    onDelete,
    onFav,
}: {
    item: Item;
    layoutId: string;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onFav: () => void;
}) {
    const panelRef = useRef<HTMLDivElement>(null);

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    useOutsideClick(panelRef, handleClose);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") handleClose();
        }

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", onKey);
        };
    }, [handleClose]);

    const y = yearLabel(item);
    const genres = item.genres?.slice(0, 4) || [];

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, pointerEvents: "none" }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm"
            />

            {/* Panel container */}
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 pointer-events-none overscroll-contain">
                {/* Animated card */}
                <motion.div
                    ref={panelRef}
                    layoutId={layoutId}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 1, pointerEvents: "none", transition: { duration: 0.35 } }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="
                        pointer-events-auto
                        relative w-full max-w-[480px] md:max-w-[840px] max-h-[90vh] md:max-h-[80vh]
                        flex flex-col md:flex-row
                        rounded-3xl overflow-hidden
                        bg-zinc-950/95 ring-1 ring-white/10
                        shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9),0_0_60px_-10px_rgba(56,189,248,0.08)]
                        backdrop-blur-2xl
                    "
                    style={{ willChange: "transform, opacity" }}
                >
                    {/* Floating close button (desktop) */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1, transition: { delay: 0.2 } }}
                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.1 } }}
                        onClick={handleClose}
                        className="absolute top-4 right-4 z-[110] hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 backdrop-blur-xl hover:bg-white/10 hover:scale-105 transition-all"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4 text-white/80" />
                    </motion.button>

                    {/* Floating close button (mobile) */}
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { delay: 0.15 } }}
                        exit={{ opacity: 0, transition: { duration: 0.1 } }}
                        onClick={handleClose}
                        className="absolute top-4 right-4 z-[110] flex h-10 w-10 items-center justify-center rounded-full bg-black/40 ring-1 ring-white/20 backdrop-blur-xl hover:bg-black/60 transition-colors md:hidden"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5 text-white" />
                    </motion.button>

                    {/* Poster - Mobile: max-h-[40vh], Desktop: w-[340px] aspect-[2/3] */}
                    <div className="relative w-full md:w-[340px] shrink-0 bg-zinc-900 border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-center overflow-hidden">
                        <motion.div layoutId={`img-${layoutId}`} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="relative w-full aspect-[2/3] max-h-[40vh] md:max-h-none mx-auto">
                            {item.coverUrl ? (
                                <img
                                    src={item.coverUrl}
                                    alt={item.title}
                                    className="absolute inset-0 h-full w-full object-contain md:object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950">
                                    <span className="text-white/30 text-lg font-medium text-center px-4">{item.title}</span>
                                </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-zinc-950 to-transparent md:hidden" />
                            <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-zinc-950 to-transparent hidden md:block" />
                        </motion.div>
                    </div>

                    {/* Content (fades out instantly on close so it doesn't look garbled during morph) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { delay: 0.15, duration: 0.3 } }}
                        exit={{ opacity: 0, transition: { duration: 0.1 } }}
                        className="flex flex-col p-6 sm:p-8 overflow-y-auto flex-1 w-full"
                        style={{ scrollbarWidth: "none" }}
                    >
                        {/* Title + status */}
                        <div className="flex items-start justify-between gap-3 mb-4 md:pr-12">
                            <div className="min-w-0">
                                <motion.h2
                                    layoutId={`title-${layoutId}`}
                                    className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight"
                                >
                                    {item.title}
                                </motion.h2>
                            </div>
                        </div>

                        {/* Status Label */}
                        <div className="mb-6 flex">
                            <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ring-1 shadow-sm ${statusColor(item.status)}`}>
                                {statusLabel(item.status)}
                            </span>
                        </div>

                        {/* Meta chips */}
                        <div className="flex flex-wrap items-center gap-2 mb-6">
                            {y && (
                                <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-3 py-2 text-[13px] text-white/70 ring-1 ring-white/[0.08]">
                                    <Calendar className="h-3.5 w-3.5 opacity-70" />
                                    {y}
                                </div>
                            )}
                            {genres.map((g) => (
                                <div
                                    key={g}
                                    className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-3 py-2 text-[13px] text-white/70 ring-1 ring-white/[0.08]"
                                >
                                    <Tag className="h-3.5 w-3.5 opacity-70" />
                                    {g}
                                </div>
                            ))}
                            {item.runtime && item.runtime > 0 && (
                                <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-3 py-2 text-[13px] text-white/70 ring-1 ring-white/[0.08]">
                                    <Clock className="h-3.5 w-3.5 opacity-70" />
                                    {item.runtime}m
                                </div>
                            )}
                        </div>

                        {/* Description / Synopsis */}
                        {item.description && (
                            <div className="text-[15px] text-white/80 leading-relaxed mb-6 font-medium">
                                {item.description}
                            </div>
                        )}

                        {/* Notes */}
                        {item.notes && (
                            <div className="rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/[0.06] mb-8">
                                <div className="flex items-center gap-2 text-xs font-semibold text-white/40 mb-3 tracking-wide uppercase">
                                    <FileText className="h-3.5 w-3.5" />
                                    Notes
                                </div>
                                <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                                    {item.notes}
                                </p>
                            </div>
                        )}

                        <div className="flex-1 min-h-[2rem]" />

                        {/* Action bar */}
                        <div className="flex flex-wrap items-center gap-3 pt-5 border-t border-white/[0.08] mt-auto">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onFav();
                                }}
                                className={`
                                    flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold
                                    ring-1 transition-all duration-200 shadow-sm
                                    ${item.favorite
                                        ? "bg-amber-500/15 text-amber-300 ring-amber-500/25 hover:bg-amber-500/25 hover:ring-amber-500/40"
                                        : "bg-white/[0.04] text-white/70 ring-white/[0.08] hover:bg-white/10 hover:text-white"
                                    }
                                `}
                            >
                                <Star className={`h-4 w-4 ${item.favorite ? "fill-amber-400 text-amber-400" : ""}`} />
                                {item.favorite ? "Favorited" : "Favorite"}
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit();
                                }}
                                className="flex flex-1 justify-center items-center gap-2 rounded-xl bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/70 ring-1 ring-white/[0.08] shadow-sm hover:bg-white/10 hover:text-white transition-all duration-200 md:ml-auto"
                            >
                                <Pencil className="h-4 w-4" />
                                Edit
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }}
                                className="flex flex-1 justify-center items-center gap-2 rounded-xl bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 ring-1 ring-red-500/20 shadow-sm hover:bg-red-500/20 hover:text-red-200 hover:ring-red-500/30 transition-all duration-200"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </>
    );
}
