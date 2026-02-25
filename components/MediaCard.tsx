"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Item, Status } from "@/lib/types";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";

function statusText(s: Status) {
  if (s === "watched") return "Watched";
  if (s === "pending") return "Pending";
  return "Wishlisted";
}

function emitGlow(x: number, y: number, boost: number) {
  window.dispatchEvent(new CustomEvent("wv-glow", { detail: { x, y, boost } }));
}

function yearLabel(item: Item): string {
  // Movies: single year only
  if (item.mediaType === "movie") return item.year ? String(item.year) : "";

  // TV/Anime: range or running
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
  onNeedCover,
  onFav,
  onOpen,
}: {
  item: Item;
  onNeedCover: () => void | Promise<void>;
  onFav: () => void;
  onOpen: () => void;
}) {
  const [attempted, setAttempted] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const glowRaf = useRef<number | null>(null);

  // cover/metadata fetch (one time)
  useEffect(() => {
    const hasCover = !!item.coverUrl;
    const hasGenres = !!(item.genres && item.genres.length > 0);
    if (hasCover && hasGenres) return;
    if (attempted) return;
    setAttempted(true);
    onNeedCover();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id, item.coverUrl, item.genres]);

  // reset if url changes
  useEffect(() => {
    setImgFailed(false);
  }, [item.coverUrl]);

  const y = yearLabel(item);
  const meta = [y, ...(item.genres?.slice(0, 2) || [])].filter(Boolean).join(" • ");

  // --- Fancy tilt ---
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 280, damping: 22, mass: 0.5 });
  const sy = useSpring(ry, { stiffness: 280, damping: 22, mass: 0.5 });
  const transform = useMotionTemplate`perspective(900px) rotateX(${sx}deg) rotateY(${sy}deg) translateZ(0)`;

  function handleMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width; // 0..1
    const py = (e.clientY - r.top) / r.height; // 0..1

    const tilt = 8;
    rx.set((0.5 - py) * tilt);
    ry.set((px - 0.5) * tilt);

    if (glowRaf.current) cancelAnimationFrame(glowRaf.current);
    glowRaf.current = requestAnimationFrame(() => emitGlow(e.clientX, e.clientY, 1.0));
  }

  function handleEnter() {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    emitGlow(r.left + r.width / 2, r.top + r.height / 2, 1.0);
  }

  function handleLeave() {
    rx.set(0);
    ry.set(0);
    emitGlow(-9999, -9999, 0.25);
  }

  function handleFavActivate(e: React.SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
    onFav();
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
      onPointerMove={handleMove}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      style={{ transform }}
      whileHover={{ y: -8, scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="group relative cursor-pointer select-none text-left outline-none"
      aria-label={`Open ${item.title}`}
      title="Open"
    >
      {/* Card shell */}
      <div
        className="
          relative overflow-hidden rounded-2xl bg-white/[0.035] ring-1 ring-white/10
          group-hover:ring-white/25
          shadow-[0_10px_40px_-20px_rgba(0,0,0,0.9)]
        "
      >
        {/* Poster */}
        <div className="aspect-[2/3] w-full bg-white/[0.03]">
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
        </div>

        {/* Premium light sweep */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
          style={{
            background:
              "radial-gradient(450px 250px at 30% 10%, rgba(255,255,255,0.18), transparent 60%)",
          }}
        />

        {/* Bottom gradient + text */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{item.title}</div>
              <div className="mt-0.5 truncate text-xs text-white/70">{meta || " "}</div>
            </div>

            {/* Favorite control (NOT a real <button>) */}
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
      </div>

      {/* Glow behind */}
      <motion.div
        className="pointer-events-none absolute -inset-2 -z-10 rounded-[22px] blur-2xl"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        style={{
          background:
            "radial-gradient(closest-side, rgba(56,189,248,0.22), transparent), radial-gradient(closest-side, rgba(232,121,249,0.16), transparent)",
        }}
      />
    </motion.div>
  );
}
