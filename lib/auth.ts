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

        // Use Next.js router for client-side navigation
        const { useRouter } = await import("next/navigation");
        // We can't get a router instance outside of a component,
        // so we use window.location.href as a fallback but with a short delay
        // to allow the logout to complete
        if (callbackUrl) {
            window.location.href = callbackUrl;
        } else {
            window.location.href = "/login";
        }
    }
}
