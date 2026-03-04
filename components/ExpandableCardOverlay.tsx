"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Item } from "@/lib/types";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { X, Star, Pencil, Trash2 } from "lucide-react";

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

function getStatusText(s: string) {
    if (s === "watched") return "Watched";
    if (s === "pending") return "Pending";
    return "Wishlisted";
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
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    useOutsideClick(panelRef, () => {
        if (!deleteConfirm) handleClose();
    });

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
    const genres = item.genres?.slice(0, 3) || [];

    // Build meta string
    const metaParts = [];
    metaParts.push(getStatusText(item.status));
    if (y) metaParts.push(y);
    if (genres.length > 0) metaParts.push(genres.join(", "));
    if (item.runtime) metaParts.push(`${item.runtime}m`);
    const metaString = metaParts.join(" • ");

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, pointerEvents: "none" }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-md"
            />

            {/* Panel container */}
            <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none overscroll-contain p-4 pt-24 sm:p-0">
                {/* Animated card */}
                <motion.div
                    ref={panelRef}
                    layoutId={layoutId}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 1, pointerEvents: "none", transition: { duration: 0.2 } }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="
                        pointer-events-auto
                        relative w-full max-w-[900px] h-full max-h-[85vh] sm:h-[70vh] sm:min-h-[600px] sm:max-h-[850px]
                        flex flex-col sm:grid sm:grid-cols-[430px_1fr]
                        rounded-3xl overflow-hidden
                        liquid-glass border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset] shadow-2xl
                    "
                    style={{ willChange: "transform, opacity" }}
                >
                    {/* Left Column: Poster */}
                    <div className="relative shrink-0 h-[45vh] sm:h-full w-full [mask-image:linear-gradient(to_bottom,black_50%,transparent_100%)] sm:[mask-image:linear-gradient(to_right,black_60%,transparent_100%)]">
                        {item.coverUrl ? (
                            <img
                                src={item.coverUrl}
                                alt={item.title}
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-neutral-900" />
                        )}
                    </div>

                    {/* Right Column: Content Panel */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { delay: 0.15, duration: 0.3 } }}
                        exit={{ opacity: 0, transition: { duration: 0.1 } }}
                        className="flex flex-col p-5 sm:p-8 gap-4 sm:gap-5 overflow-y-auto w-full relative h-full flex-1 min-h-0 bg-transparent"
                        style={{ scrollbarWidth: "none" }}
                    >
                        {/* Top Right Actions */}
                        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 z-10">
                            <motion.button
                                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] border border-white/5 hover:bg-white/10 hover:border-white/15 text-white/70 hover:text-white transition-all shadow-sm"
                                title="Edit"
                            >
                                <Pencil className="h-4 w-4" />
                            </motion.button>

                            <motion.button
                                onClick={(e) => { e.stopPropagation(); setDeleteConfirm(true); }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] border border-white/5 hover:bg-red-500/10 hover:border-red-500/20 text-white/70 hover:text-red-400 transition-all shadow-sm"
                                title="Delete"
                            >
                                <Trash2 className="h-4 w-4" />
                            </motion.button>

                            <div className="mx-1 h-5 w-px bg-white/10" />

                            <motion.button
                                onClick={(e) => { e.stopPropagation(); handleClose(); }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 border border-white/10 hover:bg-white/20 hover:border-white/20 text-white/90 transition-all shadow-sm"
                                title="Close"
                            >
                                <X className="h-4 w-4" />
                            </motion.button>
                        </div>

                        {/* Content Readability Wrapper */}
                        <div className="mt-2 sm:mt-8 pr-0 sm:pr-16 bg-transparent">
                            <div className="hidden sm:block">
                                {/* Desktop Title (Animated) */}
                                <motion.h2
                                    layoutId={typeof window !== 'undefined' && window.innerWidth >= 640 ? `title-${layoutId}` : undefined}
                                    className="text-3xl font-semibold tracking-tight text-white leading-tight"
                                >
                                    {item.title}
                                </motion.h2>
                            </div>

                            <div className="flex items-center gap-3 mt-0 sm:mt-3">
                                <div className="text-sm text-white/70 font-medium">
                                    {metaString}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onFav();
                                    }}
                                    className="shrink-0 text-white/50 hover:text-white transition-colors"
                                >
                                    <Star className={`h-5 w-5 sm:h-6 sm:w-6 ${item.favorite ? "fill-white text-white" : ""}`} />
                                </button>
                            </div>

                            {/* Description */}
                            {item.description && (
                                <div className="text-white/80 leading-relaxed max-w-[58ch] mt-6">
                                    {item.description}
                                </div>
                            )}

                            {/* Notes */}
                            {item.notes && (
                                <div className="mt-6">
                                    <div className="text-sm text-neutral-500 uppercase tracking-widest font-semibold mb-2">Notes</div>
                                    <div className="text-white/80 leading-relaxed max-w-[58ch] whitespace-pre-wrap">
                                        {item.notes}
                                    </div>
                                </div>
                            )}
                        </div>

                    </motion.div>
                </motion.div>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={() => setDeleteConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-sm bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl p-6"
                        >
                            <h3 className="text-lg font-semibold text-white mb-2">Delete Item</h3>
                            <p className="text-sm text-neutral-400 mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(false)}
                                    className="px-4 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => { setDeleteConfirm(false); onDelete(); }}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
