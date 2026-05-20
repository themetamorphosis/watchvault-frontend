"use client";

import React, { useEffect, useState } from "react";
import type { Item, Status } from "@/lib/types";
import { motion } from "framer-motion";
import { Pencil, Trash2, Star } from "lucide-react";

function statusText(s: Status) {
  if (s === "watched") return "Watched";
  if (s === "pending") return "Pending";
  return "Wishlisted";
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

  useEffect(() => {
    setImgFailed(false);
  }, [item.coverUrl]);

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
  const meta = [y, ...(item.genres?.slice(0, 2) || [])].filter(Boolean).join(" • ");

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen();
      }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group relative cursor-pointer select-none text-left outline-none"
      aria-label={`Open ${item.title}`}
      title="Open"
    >
      <motion.div
        layoutId={layoutId}
        className="relative overflow-hidden rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06] group-hover:ring-white/[0.12] shadow-lg group-hover:shadow-2xl transition-shadow duration-500"
      >
        {/* Poster */}
        <motion.div
          layoutId={layoutId ? `img-${layoutId}` : undefined}
          className="aspect-[2/3] w-full overflow-hidden"
        >
          {item.coverUrl && !imgFailed ? (
            <motion.img
              src={item.coverUrl}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              onError={() => setImgFailed(true)}
            />
          ) : item.coverUrl ? (
            <div className="flex h-full w-full items-center justify-center bg-zinc-900">
              <div className="px-4 text-center">
                <div className="text-sm font-medium text-white/70">{item.title}</div>
                <div className="mt-1 text-xs text-white/30">Poster unavailable</div>
              </div>
            </div>
          ) : (
            <div className="h-full w-full skeleton" />
          )}
        </motion.div>

        {/* Hover overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Action buttons */}
        <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
          <motion.button
            onClick={handleFavActivate}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-black/50 ring-1 ring-white/10 backdrop-blur-md hover:bg-black/70 hover:ring-white/20 transition-all ${item.favorite ? "!ring-yellow-400/40" : ""}`}
            aria-label={item.favorite ? "Unmark favorite" : "Mark favorite"}
            title="Favorite"
          >
            <Star className={`h-3.5 w-3.5 ${item.favorite ? "fill-yellow-400 text-yellow-400" : "text-white/70"}`} />
          </motion.button>

          <motion.button
            onClick={handleMenuEdit}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 ring-1 ring-white/10 backdrop-blur-md hover:bg-black/70 hover:ring-white/20 transition-all"
            aria-label="Edit title"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5 text-white/70" />
          </motion.button>

          <motion.button
            onClick={handleMenuDelete}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 ring-1 ring-white/10 backdrop-blur-md hover:bg-red-500/20 hover:ring-red-500/30 transition-all"
            aria-label="Delete title"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5 text-white/70 group-hover/del:text-red-400" />
          </motion.button>
        </div>

        {/* Bottom info */}
        <div className="absolute inset-x-0 bottom-0 p-3 pt-12">
          <motion.div
            layoutId={layoutId ? `title-${layoutId}` : undefined}
            className="truncate text-[13px] font-medium text-white/90"
          >
            {item.title}
          </motion.div>
          {meta && (
            <div className="mt-0.5 truncate text-[11px] text-white/50">
              {meta}
            </div>
          )}
          <div className="mt-1.5">
            <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/70 ring-1 ring-white/10">
              {statusText(item.status)}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
