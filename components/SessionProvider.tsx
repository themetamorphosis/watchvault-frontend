"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { API_BASE } from "@/lib/auth";

export type User = {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
};

export type Session = {
    user: User;
} | null;

interface SessionContextValue {
    data: Session;
    status: "loading" | "authenticated" | "unauthenticated";
    update: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export default function SessionProvider({ children, session: initialSession }: { children: React.ReactNode, session?: Session }) {
    const [session, setSession] = useState<Session>(initialSession || null);
    const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">(
        initialSession ? "authenticated" : "loading"
    );

    const update = async () => {
        try {
            const match = document.cookie.match(/(?:^|;\s*)auth_token=([^;]*)/);
            const token = match ? match[1] : null;

            if (!token) {
                setSession(null);
                setStatus("unauthenticated");
                return;
            }

            const res = await fetch(`${API_BASE}/auth/me`, {
                headers: { "Authorization": `Bearer ${token}` },
                cache: "no-store"
            });

            if (res.ok) {
                const data = await res.json();
                if (data) {
                    setSession({ user: data });
                    setStatus("authenticated");
                } else {
                    setSession(null);
                    setStatus("unauthenticated");
                }
            } else {
                setSession(null);
                setStatus("unauthenticated");
            }
        } catch {
            setSession(null);
            setStatus("unauthenticated");
        }
    };

    useEffect(() => {
        // We let the Server Component pass down the initial session, so we don't refetch on mount if it's there
        if (!initialSession) {
            update();
        } else {
            setStatus("authenticated");
        }
    }, [initialSession]);

    return (
        <SessionContext.Provider value={{ data: session, status, update }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error("useSession must be used within a SessionProvider");
    }
    return context;
}

export async function signOut({ callbackUrl }: { callbackUrl?: string } = {}) {
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; samesite=lax";
    setTimeout(() => {
        window.location.href = callbackUrl || "/";
    }, 100);
}
