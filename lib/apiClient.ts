import { API_BASE, signOut } from "@/lib/auth";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;

    let token = null;
    if (typeof document !== 'undefined') {
        const match = document.cookie.match(/(?:^|;\s*)auth_token=([^;]*)/);
        token = match ? match[1] : null;
    }

    const headers = new Headers(options.headers || {});

    // Auto-inject token if we have one and it isn't already set
    if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    // Default to JSON if method is POST/PATCH/PUT and no content-type is set
    // Note: Do not set Content-Type for FormData as the browser handles boundary generation
    if (options.method && ["POST", "PATCH", "PUT"].includes(options.method.toUpperCase())) {
        if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
            headers.set("Content-Type", "application/json");
        }
    }

    const res = await fetch(url, {
        ...options,
        headers,
    });

    if (res.status === 401) {
        // Exclude specific auth routes from triggering an aggressive signout
        if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
            await signOut();
        }
    }

    return res;
}
