export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export async function signOut({ callbackUrl }: { callbackUrl?: string } = {}) {
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; samesite=lax";
    if (typeof window !== "undefined") {
        try {
            window.localStorage.clear();
        } catch {
            // ignore
        }
    }
    setTimeout(() => {
        window.location.href = callbackUrl || "/login";
    }, 100);
}
