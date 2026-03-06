"use client";

import React from "react";
import TopNavBar from "./TopNavBar";
import AiChatModal from "../AiChatModal";

export default function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative min-h-screen bg-[#050505] text-white">
            {/* Cinematic background */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(168, 85, 247, 0.08), transparent 70%), " +
                            "radial-gradient(ellipse 60% 40% at 80% 50%, rgba(255, 56, 100, 0.04), transparent 60%), " +
                            "radial-gradient(ellipse 60% 40% at 20% 80%, rgba(56, 189, 248, 0.04), transparent 60%)",
                    }}
                />
                {/* Very light noise overlay */}
                <div className="noise-overlay" />
            </div>

            {/* Sticky header */}
            <TopNavBar />

            {/* Global AI Assistant Overlay */}
            <AiChatModal />

            {/* Main content */}
            <main className="relative z-10">{children}</main>
        </div>
    );
}
