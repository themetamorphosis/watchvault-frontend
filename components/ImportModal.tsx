"use client";

import React, { useMemo, useState, useRef } from "react";
import type { Item, MediaType, Status } from "@/lib/types";
import { FileText, FileJson, FileSpreadsheet, X } from "lucide-react";
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
  line = line.split(" – ")[0].split(" - ")[0].trim();

  const paren = line.match(/\(([^)]+)\)\s*$/);
  const inside = paren?.[1]?.trim();
  const title = line.replace(/\s*\([^)]+\)\s*$/, "").trim();

  if (!inside) return { title };

  const norm = inside
    .replace(/[—–]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  const isRunningWord = /running|ongoing|still running|present/i.test(norm);

  if (mediaType === "movie") {
    const y = norm.match(/\b(\d{4})\b/);
    return { title, year: y ? Number(y[1]) : undefined };
  }

  const range = norm.match(/\b(\d{4})\s*-\s*(\d{4})\b/);
  if (range) {
    return { title, year: Number(range[1]), endYear: Number(range[2]), running: false };
  }

  const startRunning = norm.match(/\b(\d{4})\s*-\s*(running|ongoing|present)\b/i);
  if (startRunning) {
    return { title, year: Number(startRunning[1]), endYear: undefined, running: true };
  }

  if (isRunningWord && !norm.match(/\d{4}/)) {
    return { title, running: true };
  }

  const single = norm.match(/\b(\d{4})\b/);
  if (single) {
    return { title, year: Number(single[1]), running: isRunningWord || undefined };
  }

  return { title };
}

function defaultStatusForImport(): Status {
  return "watched";
}

export default function ImportModal({
  defaultMediaType = "movie",
  onClose,
  onImport,
}: {
  defaultMediaType?: MediaType;
  onClose: () => void;
  onImport: (items: Item[]) => void;
}) {
  const [tab] = useState<MediaType>(defaultMediaType);
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsedPreview = useMemo(() => {
    if (!text.trim()) return [];

    // 1. Try JSON
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        return data.map((item: Record<string, unknown>) => {
          if (typeof item === 'string') return parseTitleAndYears(item as string, tab);
          return {
            title: (item.title as string) || (item.name as string) || '',
            year: item.year ? Number(item.year) : undefined,
            endYear: item.endYear ? Number(item.endYear) : undefined,
            running: !!item.running || item.status === 'running' || item.status === 'ongoing',
          };
        }).filter(x => x.title);
      }
    } catch {
      // Ignore: Not JSON array
    }

    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    // 2. Try CSV with header (comma separated)
    if (lines.length > 0) {
      const header = lines[0].toLowerCase();
      if (header.includes(',') && (header.includes('title') || header.includes('name'))) {
        const columns = header.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        const titleIdx = columns.findIndex(c => c === 'title' || c === 'name');
        const yearIdx = columns.findIndex(c => c === 'year' || c === 'release year');
        const statusIdx = columns.findIndex(c => c === 'status');

        const out = [];
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
          const title = titleIdx >= 0 ? parts[titleIdx] : parts[0];
          const year = yearIdx >= 0 ? parseInt(parts[yearIdx], 10) : undefined;
          let running = false;
          if (statusIdx >= 0 && parts[statusIdx]) {
            const stat = parts[statusIdx].toLowerCase();
            running = stat.includes('running') || stat.includes('ongoing');
          }
          if (title) out.push({ title, year: isNaN(year!) ? undefined : year, running });
        }
        return out;
      }
    }

    // 3. Fallback: Plain text parsing line-by-line
    return lines.map((l) => parseTitleAndYears(l, tab));
  }, [text, tab]);

  function buildItems(): Item[] {
    const now = Date.now();
    return parsedPreview.slice(0, 1000).map((p) => ({
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
    }));
  }

  function formatYears(p: Parsed) {
    if (tab === "movie") return p.year ? String(p.year) : "—";
    if (p.year && p.endYear) return `${p.year}–${p.endYear}`;
    if (p.year && p.running) return `${p.year}–Running`;
    if (p.running) return "Running";
    return p.year ? String(p.year) : "—";
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setText(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const previewSliced = parsedPreview.slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-[#0a0a0a] ring-1 ring-white/10 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-white/10 p-5 shrink-0">
          <div>
            <div className="text-xs font-semibold tracking-wider text-white/50 uppercase mb-1">Import</div>
            <div className="text-xl font-bold tracking-tight text-white">Paste or upload list</div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl bg-white/[0.04] p-2 hover:bg-white/[0.08] text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto">

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] transition-colors border border-white/[0.08] border-dashed text-sm font-medium text-white/70 hover:text-white"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Upload .TXT</span>
              <span className="sm:hidden">.TXT</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] transition-colors border border-white/[0.08] border-dashed text-sm font-medium text-white/70 hover:text-white"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Upload .CSV</span>
              <span className="sm:hidden">.CSV</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] transition-colors border border-white/[0.08] border-dashed text-sm font-medium text-white/70 hover:text-white"
            >
              <FileJson className="w-4 h-4" />
              <span className="hidden sm:inline">Upload .JSON</span>
              <span className="sm:hidden">.JSON</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".txt,.csv,.json"
              onChange={handleFileUpload}
            />
          </div>

          <div className="relative group">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                tab === "movie"
                  ? `Example (Text):\nThe Godfather (1972)\nInception (2010)\n\nExample (CSV):\nTitle,Year\nThe Godfather,1972\n\nExample (JSON):\n[{"title":"Inception", "year":2010}]`
                  : `Example (Text):\nDark (2017–2020)\n\nExample (CSV):\nTitle,Year,Status\nDark,2017,Ended\n\nExample (JSON):\n[{"title":"Dark", "year":2017}]`
              }
              className="h-44 w-full resize-none rounded-2xl bg-white/[0.02] p-4 text-sm text-white placeholder:text-white/20 ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/[0.04] transition-all scrollbar-hide"
            />
          </div>

          <div className="mt-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-medium uppercase tracking-wider text-white/40">Preview</div>
              {parsedPreview.length > 0 && (
                <div className="text-xs font-medium text-white/40">{parsedPreview.length} {parsedPreview.length === 1 ? 'item' : 'items'} total</div>
              )}
            </div>
            <div className="space-y-2 text-sm">
              {previewSliced.length ? (
                previewSliced.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-white/[0.03]">
                    <div className="truncate font-medium text-white/90">{p.title}</div>
                    <div className="text-white/50 text-xs px-2 py-1 rounded-md bg-white/[0.06] font-medium shrink-0">{formatYears(p)}</div>
                  </div>
                ))
              ) : (
                <div className="text-white/30 text-center py-4 text-sm">Paste lines or upload a file to see preview…</div>
              )}
            </div>
          </div>

        </div>

        <div className="p-4 border-t border-white/10 shrink-0 flex items-center justify-between bg-black/50 rounded-b-2xl">
          <div className="text-xs text-white/40 leading-relaxed hidden sm:block">
            Supports <span className="text-white/60">JSON Arrays</span>, <span className="text-white/60">CSV w/ headers</span>, <span className="text-white/60">Plain text lists</span>
          </div>
          <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto">
            <button
              onClick={() => setText("")}
              className="flex-1 sm:flex-none rounded-xl px-4 py-2.5 text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              Clear
            </button>

            <button
              onClick={() => onImport(buildItems())}
              disabled={!text.trim() || parsedPreview.length === 0}
              className="flex-1 sm:flex-none rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-black hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import {parsedPreview.length > 0 ? parsedPreview.length : ''} Titles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
