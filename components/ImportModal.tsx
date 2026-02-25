"use client";

import React, { useMemo, useState } from "react";
import type { Item, MediaType, Status } from "@/lib/types";

type Parsed = {
  title: string;
  year?: number;
  endYear?: number;
  running?: boolean;
};

function cleanLine(raw: string) {
  let line = (raw || "").trim();
  line = line.replace(/^\s*[-*•]+\s*/, "");
  line = line.replace(/^\s*\d+\.\s*/, "");
  return line.trim();
}

function parseTitleAndYears(raw: string, mediaType: MediaType): Parsed {
  let line = cleanLine(raw);

  // Cut off metadata after dash (genres etc.)
  // keep left side where title + years usually exist
  line = line.split(" – ")[0].split(" - ")[0].trim();

  // Extract (...) at the end if present
  // examples:
  // "Dark (2017–2020)"
  // "Attack on Titan (2013–2023)"
  // "Violet Evergarden (Running)"
  // "Demon Slayer (2019–Running)"
  // "Your Name (2016)"
  const paren = line.match(/\(([^)]+)\)\s*$/);
  const inside = paren?.[1]?.trim();
  const title = line.replace(/\s*\([^)]+\)\s*$/, "").trim();

  if (!inside) return { title };

  // Normalize separators
  const norm = inside
    .replace(/[—–]/g, "-") // em/en dash -> hyphen
    .replace(/\s+/g, " ")
    .trim();

  const isRunningWord = /running|ongoing|still running/i.test(norm);

  // Movie: single year only
  if (mediaType === "movie") {
    const y = norm.match(/\b(\d{4})\b/);
    return { title, year: y ? Number(y[1]) : undefined };
  }

  // TV/Anime:
  // 1) Range: 2017-2020
  const range = norm.match(/\b(\d{4})\s*-\s*(\d{4})\b/);
  if (range) {
    return { title, year: Number(range[1]), endYear: Number(range[2]), running: false };
  }

  // 2) Start + Running: 2019-Running OR 2019 - ongoing
  const startRunning = norm.match(/\b(\d{4})\s*-\s*(running|ongoing|present)\b/i);
  if (startRunning) {
    return { title, year: Number(startRunning[1]), endYear: undefined, running: true };
  }

  // 3) Just "Running" with no start year (rare)
  if (isRunningWord && !norm.match(/\d{4}/)) {
    return { title, running: true };
  }

  // 4) Single year
  const single = norm.match(/\b(\d{4})\b/);
  if (single) {
    // If it says running anywhere, mark running
    return { title, year: Number(single[1]), running: isRunningWord || undefined };
  }

  // Otherwise ignore
  return { title };
}

function defaultStatusForImport(): Status {
  return "watched";
}

export default function ImportModal({
  onClose,
  onImport,
}: {
  onClose: () => void;
  onImport: (items: Item[]) => void;
}) {
  const [tab, setTab] = useState<MediaType>("movie");
  const [text, setText] = useState("");

  const preview = useMemo(() => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    return lines.slice(0, 6).map((l) => parseTitleAndYears(l, tab));
  }, [text, tab]);

  function buildItems(): Item[] {
    const now = Date.now();
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const out: Item[] = [];
    for (const line of lines) {
      const p = parseTitleAndYears(line, tab);
      if (!p.title) continue;

      out.push({
        id: crypto.randomUUID?.() ?? Math.random().toString(16).slice(2),
        title: p.title,
        year: p.year,
        endYear: p.endYear,
        running: p.running,
        mediaType: tab,
        status: defaultStatusForImport(),
        favorite: false,
        createdAt: now,
        updatedAt: now,
      });
    }
    return out;
  }

  function formatYears(p: Parsed) {
    if (tab === "movie") return p.year ? String(p.year) : "—";
    if (p.year && p.endYear) return `${p.year}–${p.endYear}`;
    if (p.year && p.running) return `${p.year}–Running`;
    if (p.running) return "Running";
    return p.year ? String(p.year) : "—";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-zinc-950 ring-1 ring-white/10">
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div>
            <div className="text-xs text-white/60">Import</div>
            <div className="text-lg font-semibold">Paste your list</div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl bg-white/5 px-3 py-2 text-sm ring-1 ring-white/10 hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="p-4">
          <div className="mb-3 flex gap-2">
            {(["movie", "tv", "anime"] as MediaType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={
                  "rounded-xl px-3 py-2 text-sm ring-1 ring-white/10 " +
                  (tab === t ? "bg-white/15" : "bg-white/5 hover:bg-white/10")
                }
              >
                {t === "movie" ? "Movies" : t === "tv" ? "TV" : "Anime"}
              </button>
            ))}
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              tab === "movie"
                ? `Example:\nThe Godfather (1972)\nInception (2010)\n`
                : `Example:\nDark (2017–2020)\nAttack on Titan (2013–2023)\nDemon Slayer (2019–Running)\nViolet Evergarden (Running)\n`
            }
            className="h-56 w-full resize-none rounded-2xl bg-white/5 p-3 text-sm text-white placeholder:text-white/35 ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/20"
          />

          <div className="mt-3 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
            <div className="text-xs text-white/60">Preview (first 6)</div>
            <div className="mt-2 space-y-1 text-sm">
              {preview.length ? (
                preview.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3">
                    <div className="truncate">{p.title}</div>
                    <div className="text-white/60">{formatYears(p)}</div>
                  </div>
                ))
              ) : (
                <div className="text-white/50">Paste lines to see preview…</div>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              onClick={() => setText("")}
              className="rounded-xl bg-white/5 px-3 py-2 text-sm ring-1 ring-white/10 hover:bg-white/10"
            >
              Clear
            </button>

            <button
              onClick={() => onImport(buildItems())}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-white/90"
            >
              Import
            </button>
          </div>

          <div className="mt-3 text-xs text-white/50">
            TV/Anime formats supported: <span className="text-white/70">(2017–2020)</span>,{" "}
            <span className="text-white/70">(2019–Running)</span>,{" "}
            <span className="text-white/70">(Running)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
