"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Item } from "@/lib/types";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { Star, Edit, Trash2, X, Film } from "lucide-react";

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
  onClose,
  onEdit,
  onDelete,
  onFav,
}: {
  item: Item;
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
  metaParts.push(getStatusText(item.status).toUpperCase());
  if (y) metaParts.push(y);
  if (genres.length > 0) metaParts.push(genres.join(", ").toUpperCase());
  if (item.runtime) metaParts.push(`${item.runtime}MIN`);
  const metaString = metaParts.join(" | ");

  const mediaAccent =
    item.mediaType === "movie"
      ? "var(--accent-amber)"
      : item.mediaType === "tv"
        ? "var(--accent-purple)"
        : "var(--accent-green)";

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, pointerEvents: "none" }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[90] bg-tui-bg/80 backdrop-blur-sm"
      />

      {/* Panel container */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4 pt-16 md:p-0">
        {/* TUI detail panel */}
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="
                        pointer-events-auto
                        relative w-full max-w-[800px] h-[80vh] md:h-[420px]
                        flex flex-col md:grid md:grid-cols-[280px_1fr]
                        bg-tui-panel border border-tui-border text-tui-text font-mono text-xs
                        overflow-hidden
                    "
          style={{ willChange: "transform, opacity" }}
        >
          {/* Close button (top right) */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-tui-text-muted hover:text-tui-text transition-colors z-20 flex items-center justify-center h-8 w-8 hover:bg-tui-input rounded-full"
            title="Close details"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Left Column: Cover Image with sharp border */}
          <div className="relative shrink-0 h-[40%] md:h-full w-full bg-tui-bg border-r border-tui-border-muted overflow-hidden flex items-center justify-center">
            {item.coverUrl ? (
              <img
                src={item.coverUrl}
                alt={item.title}
                className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-tui-text-muted text-3xl">
                <Film className="h-12 w-12 text-tui-text-muted/30" />
              </div>
            )}
          </div>

          {/* Right Column: Monospace Content */}
          <div className="flex flex-col p-6 md:p-8 gap-4 overflow-y-auto w-full relative h-full flex-1 min-h-0 bg-tui-panel">
            {/* Title header block */}
            <div>
              <div className="text-[9px] text-tui-text-muted uppercase tracking-widest mb-1 select-none">
                {/* ENTRY_DETAILS_VIEW */}
              </div>
              <h2
                className="text-2xl font-bold uppercase tracking-wider text-tui-text"
                style={{
                  borderLeft: `3px solid ${mediaAccent}`,
                  paddingLeft: "10px",
                }}
              >
                {item.title}
              </h2>
              <div className="text-[10px] text-tui-text-muted mt-2 uppercase select-none font-bold">
                &gt; {metaString}
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <div className="border-t border-tui-border-muted pt-3">
                <div className="text-[9px] text-tui-text-muted uppercase tracking-widest mb-1.5 select-none">
                  {/* OVERVIEW */}
                </div>
                <p className="text-tui-text-muted leading-relaxed max-w-[65ch] text-justify opacity-90">
                  {item.description}
                </p>
              </div>
            )}

            {/* Notes */}
            {item.notes && (
              <div className="border-t border-tui-border-muted pt-3">
                <div className="text-[9px] text-tui-text-muted uppercase tracking-widest mb-1 select-none">
                  {/* USER_NOTES */}
                </div>
                <p className="text-tui-text-muted leading-relaxed max-w-[65ch] whitespace-pre-wrap opacity-90">
                  {item.notes}
                </p>
              </div>
            )}

            {/* TUI Actions Row */}
            <div className="mt-auto pt-4 border-t border-tui-border-muted flex flex-wrap gap-2 text-xs">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFav();
                }}
                className={`px-3 py-1.5 border transition-all duration-150 uppercase tracking-wider flex items-center gap-1.5 ${
                  item.favorite
                    ? "border-tui-amber text-tui-amber bg-tui-amber/10 font-bold"
                    : "border-tui-border text-tui-text-muted hover:text-tui-text hover:border-tui-border"
                }`}
              >
                <Star
                  className={`h-3.5 w-3.5 ${item.favorite ? "fill-current" : ""}`}
                />
                <span>{item.favorite ? "FAVORITED" : "FAVORITE"}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="px-3 py-1.5 border border-tui-border text-tui-text-muted hover:text-tui-text hover:border-tui-border transition-all uppercase tracking-wider flex items-center gap-1.5"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>EDIT</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteConfirm(true);
                }}
                className="px-3 py-1.5 border border-tui-red/30 text-tui-red bg-tui-red/10 hover:border-tui-red hover:bg-tui-red/5 transition-all uppercase tracking-wider flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>DELETE</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* TUI Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-tui-panel border border-tui-red p-6 font-mono text-xs"
            >
              <div className="text-tui-red font-bold text-sm uppercase tracking-wider mb-2">
                ! WARNING: DESTRUCTIVE_ACTION
              </div>
              <p className="text-tui-text-muted mb-6">
                ARE YOU SURE YOU WANT TO DELETE THIS TITLE? THIS OPERATION
                CANNOT BE UNDONE.
              </p>
              <div className="flex items-center justify-end gap-3 font-bold">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="px-4 py-2 border border-tui-border text-tui-text-muted hover:text-tui-text hover:border-tui-border uppercase transition-all"
                >
                  [ NO, CANCEL ]
                </button>
                <button
                  onClick={() => {
                    setDeleteConfirm(false);
                    onDelete();
                  }}
                  className="px-4 py-2 border border-tui-red bg-tui-red/15 text-tui-red hover:bg-tui-red hover:text-tui-text uppercase transition-all"
                >
                  [ YES, DELETE ]
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
