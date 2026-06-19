"use client";

import React, { useMemo, useState, useRef } from "react";
import type { Item, MediaType, Status } from "@/lib/types";
import { useModalA11y } from "@/hooks/useModalA11y";

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
  const { containerRef, trapFocus } = useModalA11y(onClose);

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
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 p-4 font-mono text-xs">
      <div className="w-full max-w-xl bg-tui-panel border border-tui-border shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-tui-border-muted p-4 bg-tui-bg/30 shrink-0">
          <div>
            <div className="text-[9px] font-semibold tracking-wider text-tui-text-muted uppercase mb-0.5">// COLLECTION_IMPORT</div>
            <div className="text-sm font-bold tracking-tight text-tui-text uppercase">PASTE OR UPLOAD LIST</div>
          </div>

          <button
            onClick={onClose}
            className="px-2.5 py-1 border border-tui-border text-tui-text-muted hover:border-tui-text hover:text-tui-text uppercase transition-all"
            title="Close modal"
          >
            [X]
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* File Upload buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-tui-border text-tui-text-muted bg-tui-bg hover:text-tui-text hover:border-tui-text hover:bg-tui-input/50 transition-all uppercase"
            >
              [ UPLOAD .TXT ]
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-tui-border text-tui-text-muted bg-tui-bg hover:text-tui-text hover:border-tui-text hover:bg-tui-input/50 transition-all uppercase"
            >
              [ UPLOAD .CSV ]
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-tui-border text-tui-text-muted bg-tui-bg hover:text-tui-text hover:border-tui-text hover:bg-tui-input/50 transition-all uppercase"
            >
              [ UPLOAD .JSON ]
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".txt,.csv,.json"
              onChange={handleFileUpload}
            />
          </div>

          {/* Textarea for bulk paste */}
          <div className="space-y-1">
            <label className="text-[10px] text-tui-text-muted uppercase font-bold tracking-wider select-none">
              PASTE COLLECTION DATA HERE &gt;
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                tab === "movie"
                  ? `EXAMPLE (TEXT):\nTHE GODFATHER (1972)\nINCEPTION (2010)\n\nEXAMPLE (CSV):\nTITLE,YEAR\nTHE GODFATHER,1972\n\nEXAMPLE (JSON):\n[{"title":"INCEPTION", "year":2010}]`
                  : `EXAMPLE (TEXT):\nDARK (2017–2020)\n\nEXAMPLE (CSV):\nTITLE,YEAR,STATUS\nDARK,2017,ENDED\n\nEXAMPLE (JSON):\n[{"title":"DARK", "year":2017}]`
              }
              className="h-44 w-full resize-none bg-tui-input border border-tui-border p-4 text-xs text-tui-text placeholder:text-tui-text-muted/30 outline-none focus:border-tui-amber transition-all scrollbar-thin uppercase"
            />
          </div>

          {/* Preview Panel */}
          <div className="border border-tui-border-muted bg-tui-bg/30 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-tui-text-muted">// IMPORT_PREVIEW</div>
              {parsedPreview.length > 0 && (
                <div className="text-[10px] font-bold text-tui-text-muted uppercase">{parsedPreview.length} {parsedPreview.length === 1 ? 'ITEM' : 'ITEMS'} DETECTED</div>
              )}
            </div>
            <div className="space-y-2">
              {previewSliced.length ? (
                previewSliced.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 px-3 py-1.5 border border-tui-border bg-tui-panel/40">
                    <div className="truncate font-bold text-tui-text uppercase">{p.title}</div>
                    <div className="text-tui-text-muted text-[10px] px-1.5 py-0.5 border border-tui-border-muted font-medium shrink-0">{formatYears(p)}</div>
                  </div>
                ))
              ) : (
                <div className="text-tui-text-muted/50 text-center py-4 uppercase">PASTE LINES OR UPLOAD A FILE TO SEE PREVIEW...</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-tui-border-muted shrink-0 flex items-center justify-between bg-tui-bg/30">
          <div className="text-[9px] text-tui-text-muted leading-relaxed hidden sm:block uppercase font-semibold">
            FORMATS: <span className="text-tui-text">JSON ARRAYS</span> | <span className="text-tui-text">CSV WITH HEADER</span> | <span className="text-tui-text">PLAIN TEXT</span>
          </div>
          <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto font-bold justify-end">
            <button
              onClick={() => setText("")}
              className="px-4 py-2.5 border border-tui-border text-tui-text-muted hover:border-tui-text hover:text-tui-text transition-all uppercase"
            >
              [ CLEAR ]
            </button>

            <button
              onClick={() => onImport(buildItems())}
              disabled={!text.trim() || parsedPreview.length === 0}
              className="px-4 py-2.5 border border-tui-border bg-tui-text text-tui-bg hover:bg-tui-text/90 transition-all uppercase disabled:opacity-30 disabled:cursor-not-allowed"
            >
              [ IMPORT {parsedPreview.length > 0 ? `${parsedPreview.length} ` : ''}ENTRIES ]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
