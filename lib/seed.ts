import type { Item, MediaType } from "@/lib/types";

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function parseMovieLine(line: string) {
  const m = line.match(/^(.*?)\s*\((\d{4})\)\s*/);
  const title = m ? m[1].trim() : line.trim();
  const year = m ? Number(m[2]) : undefined;

  const parts = line.split(/–|-{1}\s/);
  const right = parts.length > 1 ? parts.slice(1).join(" ").trim() : "";
  const genres =
    right && right.length < 80
      ? right.split(",").map((g) => g.trim()).filter(Boolean)
      : undefined;

  return { title, year, genres };
}

const RAW = String.raw`
PASTE YOUR FULL LIST HERE (same text you sent me)
`;

export function buildSeed(): Item[] {
  const lines = RAW
    .split("\n")
    .map((l) => l.replace(/\r/g, "").trim())
    .filter(Boolean);

  let mode: MediaType = "movie";
  const now = Date.now();
  const items: Item[] = [];

  for (const line of lines) {
    const lower = line.toLowerCase();

    if (lower === "anime" || lower.startsWith("anime")) {
      mode = "anime";
      continue;
    }
    if (lower === "tv" || lower.startsWith("tv")) {
      mode = "tv";
      continue;
    }

    if (mode === "movie") {
      const { title, year, genres } = parseMovieLine(line);
      items.push({
        id: uid(),
        title,
        year,
        genres,
        mediaType: "movie",
        status: "watched",
        favorite: false,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      items.push({
        id: uid(),
        title: line.replace(/\s*~\s*$/g, "").trim(),
        mediaType: mode,
        status: "watched",
        favorite: false,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  // dedupe
  const seen = new Set<string>();
  return items.filter((it) => {
    const k = `${it.mediaType}::${it.title.toLowerCase()}::${it.year ?? ""}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
