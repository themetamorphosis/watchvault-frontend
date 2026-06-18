"use client";

import React, { useState } from "react";
import type { Item, Status } from "@/lib/types";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

function statusText(s: Status) {
  if (s === "watched") return "Watched";
  if (s === "pending") return "Pending";
  return "Wishlist";
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

export default function MediaCard({
  item,
  layoutId,
  onFav,
  onOpen,
  onEdit,
  onDelete,
}: {
  item: Item;
  layoutId?: string;
  onFav: () => void;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const [prevCover, setPrevCover] = useState(item.coverUrl);

  if (item.coverUrl !== prevCover) {
    setPrevCover(item.coverUrl);
    setImgFailed(false);
  }

  function handleFavActivate(e: React.SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
    onFav();
  }
  function handleMenuEdit(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onEdit();
  }
  function handleMenuDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onDelete();
  }

  const y = yearLabel(item);
  const meta = [y, ...(item.genres?.slice(0, 2) || [])].filter(Boolean).join(" | ");

  const isMovie = item.mediaType === "movie";
  const isTv = item.mediaType === "tv";
  
  const accentBorder = isMovie 
    ? "group-hover:border-tui-amber" 
    : isTv 
      ? "group-hover:border-tui-purple" 
      : "group-hover:border-tui-green";

  const badgeColor = isMovie 
    ? "border-tui-amber/30 text-tui-amber bg-tui-amber/5" 
    : isTv 
      ? "border-tui-purple/30 text-tui-purple bg-tui-purple/5" 
      : "border-tui-green/30 text-tui-green bg-tui-green/5";

  const favoriteColor = isMovie ? "text-tui-amber" : isTv ? "text-tui-purple" : "text-tui-green";

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen();
      }}
      whileTap={{ scale: 0.98 }}
      className="group relative cursor-pointer select-none text-left outline-none font-mono"
      aria-label={`Open ${item.title}`}
      title="Open"
    >
      <motion.div
        layoutId={layoutId}
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`relative overflow-hidden bg-tui-panel border border-tui-border ${accentBorder} shadow-lg`}
      >
        {/* Poster */}
        <motion.div
          layoutId={layoutId ? `img-${layoutId}` : undefined}
          className="aspect-[2/3] w-full overflow-hidden border-b border-tui-border"
        >
          {item.coverUrl && !imgFailed ? (
            <motion.img
              src={item.coverUrl}
              alt={item.title}
              className="h-full w-full object-cover transition-all duration-200 ease-out group-hover:scale-[1.02] filter brightness-90 group-hover:brightness-100 grayscale group-hover:grayscale-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-tui-input p-4 text-center">
              <div>
                <div className="text-xs font-semibold text-tui-text-muted uppercase tracking-wider">{item.title}</div>
                <div className="mt-1 text-[10px] text-tui-text-muted/50">[ NO POSTER ]</div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Hover Action controls (Monospace CLI buttons) */}
        <div className="absolute top-2 right-2 z-20 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleFavActivate}
            className={`flex h-6 w-6 items-center justify-center font-mono text-[10px] border transition-all ${
              item.favorite 
                ? "border-tui-amber text-tui-amber bg-tui-amber/10" 
                : "border-tui-border text-tui-text-muted bg-tui-panel hover:border-tui-border hover:text-tui-text"
            }`}
            title={item.favorite ? "Unfavorite" : "Favorite"}
          >
            <Star className={`h-3 w-3 ${item.favorite ? "fill-current" : ""}`} />
          </button>
          
          <button
            onClick={handleMenuEdit}
            className="flex h-6 px-1.5 items-center justify-center font-mono text-[9px] border border-tui-border text-tui-text-muted bg-tui-panel hover:border-tui-text-muted hover:text-tui-text transition-all"
            title="Edit"
          >
            EDIT
          </button>

          <button
            onClick={handleMenuDelete}
            className="flex h-6 px-1.5 items-center justify-center font-mono text-[9px] border border-tui-border text-tui-text-muted bg-tui-panel hover:border-red-900/50 hover:text-red-400 transition-all"
            title="Delete"
          >
            DEL
          </button>
        </div>

        {/* Info Strip */}
        <div className="p-3 bg-tui-panel border-t border-tui-border/50">
          <motion.div
            layoutId={layoutId ? `title-${layoutId}` : undefined}
            className="truncate text-[12px] font-bold text-tui-text uppercase tracking-wider"
          >
            {item.title}
          </motion.div>
          
          {meta && (
            <div className="mt-0.5 truncate text-[10px] text-tui-text-muted uppercase">
              {meta}
            </div>
          )}
          
          <div className="mt-2 flex items-center justify-between">
            <span className={`inline-block font-mono text-[9px] px-1.5 py-0.5 border ${badgeColor}`}>
              {statusText(item.status)}
            </span>
            {item.favorite && (
              <Star className={`${favoriteColor} h-3.5 w-3.5 fill-current`} />
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
