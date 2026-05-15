"use server";

import { API_BASE } from "@/lib/auth";
import type { MediaType, Status } from "@/lib/types";

type ItemInput = {
    id?: string;
    title: string;
    mediaType: MediaType;
    status: Status;
    favorite: boolean;
    genres?: string[];
    notes?: string;
    description?: string;
    year?: number;
    endYear?: number;
    running?: boolean;
    coverUrl?: string;
    runtime?: number;
};

async function authedFetch(endpoint: string, options: RequestInit = {}) {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
    const headers = new Headers(options.headers || {});
    if (options.method && ["POST", "PATCH", "PUT"].includes(options.method.toUpperCase())) {
        if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
            headers.set("Content-Type", "application/json");
        }
    }
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (token) headers.set("Cookie", `auth_token=${token}`);
    return fetch(url, { ...options, headers });
}

export async function getUserId(): Promise<string> {
    const res = await authedFetch(`/auth/me`, { cache: "no-store" });
    if (!res.ok) throw new Error("Unauthorized");
    const user = await res.json();
    return user.id;
}

export async function getItems() {
    const res = await authedFetch(`/watchlist`, { cache: "no-store" });
    if (!res.ok) return [];
    const items = await res.json();
    return items.map((i: unknown) => {
        const item = i as { createdAt: string | number, updatedAt: string | number } & Record<string, unknown>;
        return {
            ...item,
            createdAt: new Date(item.createdAt).getTime(),
            updatedAt: new Date(item.updatedAt).getTime(),
        };
    });
}

export async function upsertItem(data: ItemInput) {
    let res;
    if (data.id) {
        res = await authedFetch(`/watchlist/${data.id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    } else {
        res = await authedFetch(`/watchlist`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
    if (res.ok) return { success: true };
    return { error: "Failed to save item" };
}

export async function deleteItem(id: string) {
    const res = await authedFetch(`/watchlist/${id}`, { method: "DELETE" });
    if (res.ok) return { success: true };
    return { error: "Failed to delete item" };
}

export async function toggleFavorite(id: string) {
    const res = await authedFetch(`/watchlist/${id}/toggle-favorite`, { method: "PATCH" });
    if (res.ok) {
        const data = await res.json();
        return { success: true, favorite: data.favorite };
    }
    return { error: "Failed to toggle favorite" };
}

export async function updateMetadata(id: string, payload: { coverUrl?: string; genres?: string[]; description?: string; runtime?: number }) {
    const res = await authedFetch(`/watchlist/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
    if (res.ok) return { success: true };
    return { error: "Failed to update metadata" };
}

export async function importItems(items: ItemInput[]) {
    let imported = 0;
    for (const item of items) {
        try {
            const res = await authedFetch(`/watchlist`, {
                method: "POST",
                body: JSON.stringify(item),
            });
            if (res.ok) imported++;
        } catch {
            // skip
        }
    }
    return { success: true, imported };
}
