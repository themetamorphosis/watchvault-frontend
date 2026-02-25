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

// Client-side header generation
export function getAuthHeaders() {
    const match = document.cookie.match(/(?:^|;\s*)auth_token=([^;]*)/);
    const token = match ? match[1] : null;
    if (!token) throw new Error("Unauthorized");
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

export async function getUserId(): Promise<string> {
    const headers = getAuthHeaders();
    const res = await fetch(`${API_BASE}/auth/me`, {
        headers,
        cache: "no-store",
    });
    if (!res.ok) throw new Error("Unauthorized");
    const user = await res.json();
    return user.id;
}

export async function getItems() {
    const headers = getAuthHeaders();
    const res = await fetch(`${API_BASE}/watchlist`, {
        headers,
        cache: "no-store",
    });
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
    const headers = getAuthHeaders();
    let res;

    if (data.id) {
        res = await fetch(`${API_BASE}/watchlist/${data.id}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify(data),
        });
    } else {
        res = await fetch(`${API_BASE}/watchlist`, {
            method: "POST",
            headers,
            body: JSON.stringify(data),
        });
    }

    if (res.ok) {
        return { success: true };
    }
    return { error: "Failed to save item" };
}

export async function deleteItem(id: string) {
    const headers = getAuthHeaders();
    const res = await fetch(`${API_BASE}/watchlist/${id}`, {
        method: "DELETE",
        headers,
    });
    if (res.ok) {
        return { success: true };
    }
    return { error: "Failed to delete item" };
}

export async function toggleFavorite(id: string) {
    const headers = getAuthHeaders();
    const listRes = await fetch(`${API_BASE}/watchlist`, { headers, cache: "no-store" });
    if (!listRes.ok) return { error: "Item not found" };
    const items = await listRes.json();
    const item = items.find((i: unknown) => (i as { id: string }).id === id) as { favorite: boolean } | undefined;
    if (!item) return { error: "Item not found" };

    const res = await fetch(`${API_BASE}/watchlist/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ favorite: !item.favorite }),
    });

    if (res.ok) {
        return { success: true, favorite: !item.favorite };
    }
    return { error: "Failed to toggle favorite" };
}

export async function updateMetadata(id: string, payload: { coverUrl?: string; genres?: string[]; description?: string; runtime?: number }) {
    const headers = getAuthHeaders();
    const res = await fetch(`${API_BASE}/watchlist/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload),
    });
    if (res.ok) {
        return { success: true };
    }
    return { error: "Failed to update metadata" };
}

export async function importItems(items: ItemInput[]) {
    const headers = getAuthHeaders();

    let imported = 0;
    for (const item of items) {
        try {
            const res = await fetch(`${API_BASE}/watchlist`, {
                method: "POST",
                headers,
                body: JSON.stringify(item),
            });
            if (res.ok) imported++;
        } catch {
            // skip
        }
    }

    return { success: true, imported };
}
