"use client";
import React, { useEffect, useRef, useState } from "react";
import type { Item, MediaType, Status } from "@/lib/types";
import { GlassSelect } from "@/components/GlassSelect";

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
      setError("Title is required.");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-zinc-950 ring-1 ring-white/10">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs text-white/50">Details</div>
            <div className="text-lg font-semibold">{item.title || "New item"}</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-white/5 px-3 py-2 text-sm ring-1 ring-white/10 hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="p-5 space-y-3">
          {error && (
            <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300 ring-1 ring-red-500/20">
              {error}
            </div>
          )}

          <input
            ref={firstRef}
            value={item.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Title"
            className="w-full rounded-xl bg-white/5 px-3 py-2 text-sm ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/20"
          />

          <input
            type="text"
            value={item.year ?? ""}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              set("year", val ? Number(val) : undefined);
            }}
            placeholder="Year"
            className="w-full rounded-xl bg-white/5 px-3 py-2 text-sm ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/20"
          />

          <input
            value={(item.genres ?? []).join(", ")}
            onChange={(e) =>
              set(
                "genres",
                e.target.value.split(",").map((g) => g.trim()).filter(Boolean)
              )
            }
            placeholder="Genres (comma separated)"
            className="w-full rounded-xl bg-white/5 px-3 py-2 text-sm ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/20"
          />

          <div className="grid grid-cols-2 gap-2">
            <GlassSelect
              value={item.status}
              onChange={(v) => set("status", v)}
              options={[
                { value: "watched", label: "Watched" },
                { value: "pending", label: "Pending" },
                { value: "wishlist", label: "Wishlisted" }
              ]}
              className="w-full"
              buttonClassName="w-full justify-between !rounded-xl !px-3 font-normal"
              minWidth="100%"
            />

            <input
              value={item.coverUrl ?? ""}
              onChange={(e) => set("coverUrl", e.target.value || undefined)}
              placeholder="Custom cover URL (optional)"
              className="w-full rounded-xl bg-white/5 px-3 py-2 text-sm ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
        </div>

        <div className="p-5 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={() => set("favorite", !item.favorite)}
            className="rounded-xl bg-white/5 px-4 py-2 text-sm ring-1 ring-white/10 hover:bg-white/10"
          >
            {item.favorite ? "★ Favorited" : "☆ Favorite"}
          </button>

          <div className="flex gap-2">
            {onDelete && (
              <button
                onClick={onDelete}
                className="rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-200 ring-1 ring-red-500/20 hover:bg-red-500/15"
              >
                Delete
              </button>
            )}
            <button
              onClick={handleSave}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-white/90"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
