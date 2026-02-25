"use client";

import type { Item } from "@/lib/types";

const KEY = "watchvault.v4";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadItems(): Item[] | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Item[]) : null;
  } catch {
    return null;
  }
}

export function saveItems(items: Item[]) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // ignore quota / blocked storage
  }
}

export function clearItems() {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
}
