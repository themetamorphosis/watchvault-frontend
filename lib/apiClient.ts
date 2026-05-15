import { API_BASE, signOut } from "@/lib/auth";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;

    const headers = new Headers(options.headers || {});

    // Default to JSON if method is POST/PATCH/PUT and no content-type is set
    if (options.method && ["POST", "PATCH", "PUT"].includes(options.method.toUpperCase())) {
        if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
            headers.set("Content-Type", "application/json");
        }
    }

    const res = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
    });

    if (res.status === 401) {
        if (!url.includes("/auth/login") && !url.includes("/auth/register")) {
            await signOut();
        }
    }

    return res;
}
