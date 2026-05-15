"use server";

import { API_BASE } from "@/lib/auth";

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

export async function updateProfile(prevState: unknown, formData: FormData) {
    const name = (formData.get("name") as string)?.trim();
    const image = (formData.get("image") as string)?.trim();

    if (!name || name.length < 1) {
        return { error: "Name is required." };
    }

    if (name.length > 50) {
        return { error: "Name must be 50 characters or less." };
    }

    let parsedImage = image;
    if (parsedImage && parsedImage.length > 0) {
        if (!parsedImage.startsWith("/uploads/")) {
            if (!parsedImage.startsWith("http://") && !parsedImage.startsWith("https://")) {
                parsedImage = "https://" + parsedImage;
            }
            try {
                new URL(parsedImage);
            } catch {
                return { error: "Please enter a valid image URL." };
            }
        }
    }

    try {
        const res = await authedFetch(`/auth/me`, {
            method: "PATCH",
            body: JSON.stringify({ name, image: parsedImage || null }),
        });

        if (!res.ok) {
            return { error: "Failed to update profile." };
        }
    } catch {
        return { error: "Failed to update profile." };
    }

    return { success: true };
}
