export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export async function signOut({ callbackUrl }: { callbackUrl?: string } = {}) {
    if (typeof window !== "undefined") {
        try {
            // Clear WatchVault-specific cache keys
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("wv-")) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach((k) => localStorage.removeItem(k));
        } catch {
            // ignore
        }

        // Call server action to clear httpOnly cookie
        try {
            const { logout } = await import("@/app/actions/auth");
            await logout();
        } catch {
            // ignore - cookie will expire naturally
        }

        setTimeout(() => {
            window.location.href = callbackUrl || "/login";
        }, 100);
    }
}
