"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import type { Item, Status } from "@/lib/types";
import { motion, AnimatePresence, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useOutsideClick } from "@/hooks/use-outside-click";

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
  const [attempted, setAttempted] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const glowRaf = useRef<number | null>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useOutsideClick(menuRef, closeMenu);

  // reset if url changes
  useEffect(() => {
    setImgFailed(false);
  }, [item.coverUrl]);

  const y = yearLabel(item);
  const meta = [y, ...(item.genres?.slice(0, 2) || [])].filter(Boolean).join(" • ");


  function handleFavActivate(e: React.SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
    onFav();
  }

  function handleMenuToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen((v) => !v);
  }

  function handleMenuEdit(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    onEdit();
  }

  function handleMenuDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    onDelete();
  }

  return (
    <motion.div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen();
      }}
      whileHover={{ y: -12, scale: 1.07 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 320, damping: 20 }}
      className="group relative cursor-pointer select-none text-left outline-none"
      aria-label={`Open ${item.title}`}
      title="Open"
    >
      <motion.div
        layoutId={layoutId} // Core visual container transforms into the modal
        className="
          relative overflow-hidden rounded-2xl bg-white/[0.035] ring-1 ring-white/10
          group-hover:ring-white/30
          shadow-[0_10px_40px_-20px_rgba(0,0,0,0.9)]
          group-hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,1),0_0_30px_-5px_rgba(56,189,248,0.12)]
          transition-shadow duration-300
        "
      >
        {/* Poster */}
        <motion.div layoutId={layoutId ? `img-${layoutId}` : undefined} className="aspect-[2/3] w-full bg-white/[0.03]">
          {item.coverUrl && !imgFailed ? (
            <motion.img
              src={item.coverUrl}
              alt={item.title}
              className="h-full w-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
              onError={() => setImgFailed(true)}
            />
          ) : item.coverUrl ? (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950">
              <div className="px-4 text-center">
                <div className="text-sm font-semibold">{item.title}</div>
                <div className="mt-1 text-xs text-white/60">Poster unavailable</div>
              </div>
            </div>
          ) : (
            <div className="h-full w-full animate-pulse bg-white/[0.06]" />
          )}
        </motion.div>

        {/* 3-dot kebab menu */}
        <div className="absolute top-2 right-2 z-20">
          <motion.button
            onClick={handleMenuToggle}
            initial={{ opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`
              flex h-8 w-8 items-center justify-center rounded-full
              bg-black/50 ring-1 ring-white/15 backdrop-blur-xl
              hover:bg-black/70 hover:ring-white/25
              transition-all duration-200
              ${menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
            `}
            aria-label="More options"
          >
            <MoreVertical className="h-4 w-4 text-white/80" />
          </motion.button>

          {/* Dropdown */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                ref={menuRef}
                initial={{ opacity: 0, y: -6, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.92 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-0 top-10 z-30 w-36 overflow-hidden rounded-xl bg-zinc-900/95 ring-1 ring-white/12 shadow-2xl backdrop-blur-2xl"
              >
                <button
                  onClick={handleMenuEdit}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-white/75 hover:bg-white/[0.08] hover:text-white transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <div className="mx-2 h-px bg-white/[0.08]" />
                <button
                  onClick={handleMenuDelete}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Premium light sweep */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
          style={{
            background:
              "radial-gradient(450px 250px at 30% 10%, rgba(255,255,255,0.22), transparent 60%)",
          }}
        />

        {/* Bottom gradient + text */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <motion.div layoutId={layoutId ? `title-${layoutId}` : undefined} className="truncate text-sm font-semibold">{item.title}</motion.div>
              <div className="mt-0.5 truncate text-xs text-white/70">{meta || " "}</div>
            </div>

            {/* Favorite control */}
            <motion.div
              role="button"
              tabIndex={0}
              aria-label={item.favorite ? "Remove favorite" : "Mark favorite"}
              onClick={handleFavActivate}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleFavActivate(e);
              }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              className="pointer-events-auto rounded-xl bg-white/10 px-2.5 py-1.5 text-xs ring-1 ring-white/10 hover:bg-white/15 outline-none"
              title="Favorite"
            >
              {item.favorite ? "★" : "☆"}
            </motion.div>
          </div>

          <div className="mt-2 inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/80 ring-1 ring-white/10">
            {statusText(item.status)}
          </div>
        </div>
      </motion.div>

      {/* Glow behind */}
      <motion.div
        className="pointer-events-none absolute -inset-2 -z-10 rounded-[22px] blur-2xl"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        style={{
          background:
            "radial-gradient(closest-side, rgba(56,189,248,0.28), transparent), radial-gradient(closest-side, rgba(232,121,249,0.20), transparent)",
        }}
      />
    </motion.div >
  );
}

