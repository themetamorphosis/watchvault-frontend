"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getSession } from "@/app/actions/auth";

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

    const update = useCallback(async () => {
        try {
            const user = await getSession();
            if (user) {
                setSession({ user });
                setStatus("authenticated");
            } else {
                setSession(null);
                setStatus("unauthenticated");
            }
        } catch {
            setSession(null);
            setStatus("unauthenticated");
        }
    }, []);

    useEffect(() => {
        if (!initialSession) {
            update();
        }
    }, [initialSession, update]);


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

export { signOut } from "@/lib/auth";
