"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Item, Status } from "@/lib/types";
import { Star, Trash2 } from "lucide-react";

export default function EditorModal({
  item,
  onClose,
  onChange,
  onSave,
  onDelete,
}: {
  item: Item;
  onClose: () => void;
  onChange: (next: Item) => void;
  onSave: (payload: Omit<Item, "id" | "createdAt" | "updatedAt">) => void;
  onDelete?: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const firstRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    firstRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function set<K extends keyof Item>(key: K, value: Item[K]) {
    onChange({ ...item, [key]: value });
  }

  function handleSave() {
    if (!item.title.trim()) {
      setError("TITLE IS REQUIRED.");
      return;
    }
    setError(null);
    onSave({
      title: item.title.trim(),
      year: item.year,
      genres: item.genres,
      mediaType: item.mediaType,
      status: item.status,
      favorite: item.favorite,
      coverUrl: item.coverUrl,
      notes: item.notes,
    });
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 p-4 font-mono text-xs">
      <div className="w-full max-w-lg bg-tui-panel border border-tui-border shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-tui-border-muted flex items-center justify-between bg-tui-bg/30">
          <div>
            <div className="text-[9px] text-tui-text-muted uppercase tracking-widest">// EDIT_ENTRY_DATA</div>
            <div className="text-sm font-bold text-tui-text uppercase tracking-wider mt-0.5">
              {item.title || "NEW ENTRY"}
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-2.5 py-1 border border-tui-border text-tui-text-muted hover:border-tui-text hover:text-tui-text uppercase transition-all"
            title="Cancel changes"
          >
            [X]
          </button>
        </div>

        {/* Form Fields */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="border border-tui-red/30 bg-tui-red/10 p-3 text-tui-red uppercase font-bold">
              ! ERROR: {error}
            </div>
          )}

          {/* Title Field */}
          <div className="space-y-1">
            <label className="text-[10px] text-tui-text-muted uppercase font-bold tracking-wider select-none">
              TITLE &gt;
            </label>
            <input
              ref={firstRef}
              type="text"
              value={item.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="ENTER TITLE"
              className="w-full bg-tui-input border border-tui-border text-tui-text px-3 py-2 text-xs uppercase outline-none focus:border-tui-amber placeholder:text-tui-text-muted/30"
              autoComplete="off"
            />
          </div>

          {/* Year & Status Fields in Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-tui-text-muted uppercase font-bold tracking-wider select-none">
                YEAR &gt;
              </label>
              <input
                type="text"
                value={item.year ?? ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  set("year", val ? Number(val) : undefined);
                }}
                placeholder="YYYY"
                maxLength={4}
                className="w-full bg-tui-input border border-tui-border text-tui-text px-3 py-2 text-xs uppercase outline-none focus:border-tui-amber placeholder:text-tui-text-muted/30"
                autoComplete="off"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-tui-text-muted uppercase font-bold tracking-wider select-none">
                STATUS &gt;
              </label>
              <select
                value={item.status}
                onChange={(e) => set("status", e.target.value as Status)}
                className="w-full bg-tui-input border border-tui-border text-tui-text px-3 py-2 text-xs uppercase outline-none focus:border-tui-amber"
              >
                <option value="watched">WATCHED</option>
                <option value="pending">PENDING</option>
                <option value="wishlist">WISHLISTED</option>
              </select>
            </div>
          </div>

          {/* Genres Field */}
          <div className="space-y-1">
            <label className="text-[10px] text-tui-text-muted uppercase font-bold tracking-wider select-none">
              GENRES (COMMA SEPARATED) &gt;
            </label>
            <input
              type="text"
              value={(item.genres ?? []).join(", ")}
              onChange={(e) =>
                set(
                  "genres",
                  e.target.value.split(",").map((g) => g.trim()).filter(Boolean)
                )
              }
              placeholder="ACTION, SCI-FI, DRAMA"
              className="w-full bg-tui-input border border-tui-border text-tui-text px-3 py-2 text-xs uppercase outline-none focus:border-tui-amber placeholder:text-tui-text-muted/30"
              autoComplete="off"
            />
          </div>

          {/* Cover Url Field */}
          <div className="space-y-1">
            <label className="text-[10px] text-tui-text-muted uppercase font-bold tracking-wider select-none">
              COVER URL (OPTIONAL) &gt;
            </label>
            <input
              type="text"
              value={item.coverUrl ?? ""}
              onChange={(e) => set("coverUrl", e.target.value || undefined)}
              placeholder="HTTP://IMAGE.URL"
              className="w-full bg-tui-input border border-tui-border text-tui-text px-3 py-2 text-xs outline-none focus:border-tui-amber placeholder:text-tui-text-muted/30"
              autoComplete="off"
            />
          </div>

          {/* Notes Field */}
          <div className="space-y-1">
            <label className="text-[10px] text-tui-text-muted uppercase font-bold tracking-wider select-none">
              NOTES / COMMENTS &gt;
            </label>
            <textarea
              value={item.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="WRITE NOTES HERE..."
              rows={3}
              className="w-full bg-tui-input border border-tui-border text-tui-text px-3 py-2 text-xs uppercase outline-none focus:border-tui-amber placeholder:text-tui-text-muted/30 resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-tui-border-muted flex items-center justify-between bg-tui-bg/30">
          <button
            onClick={() => set("favorite", !item.favorite)}
            className={`px-3 py-1.5 border transition-all duration-150 uppercase tracking-wider flex items-center gap-1.5 ${
              item.favorite
                ? "border-tui-amber text-tui-amber bg-tui-amber/10 font-bold"
                : "border-tui-border text-tui-text-muted hover:text-tui-text hover:border-tui-text"
            }`}
          >
            <Star className={`h-3.5 w-3.5 ${item.favorite ? "fill-current" : ""}`} />
            <span>{item.favorite ? "FAVORITED" : "FAVORITE"}</span>
          </button>

          <div className="flex gap-2 font-bold">
            {onDelete && (
              <button
                onClick={onDelete}
                className="px-3 py-1.5 border border-tui-red/30 text-tui-red bg-tui-red/10 hover:border-tui-red transition-all uppercase tracking-wider flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>DELETE</span>
              </button>
            )}
            <button
              onClick={handleSave}
              className="px-4 py-1.5 border border-tui-border bg-tui-text text-tui-bg hover:bg-tui-text/90 transition-all uppercase tracking-wider"
            >
              SAVE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
