"use client";

import React from "react";
import TopNavBar from "./TopNavBar";
import AiChatModal from "../AiChatModal";
import { RetroThemeProvider, useRetroTheme } from "./RetroThemeContext";

function AppShellInner({ children }: { children: React.ReactNode }) {
    const { scanlines, theme } = useRetroTheme();
    const isRetro = theme.startsWith("retro");

    return (
        <div 
            data-theme={theme}
            className={`relative min-h-screen bg-tui-bg text-tui-text ${
                isRetro 
                    ? `retro-container ${scanlines ? 'retro-scanlines' : ''}` 
                    : "font-sans"
            }`}
        >
            {/* Cinematic background */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(168, 85, 247, 0.03), transparent 70%), " +
                            "radial-gradient(ellipse 60% 40% at 80% 50%, rgba(255, 56, 100, 0.02), transparent 60%), " +
                            "radial-gradient(ellipse 60% 40% at 20% 80%, rgba(56, 189, 248, 0.02), transparent 60%)",
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

export default function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <RetroThemeProvider>
            <AppShellInner>{children}</AppShellInner>
        </RetroThemeProvider>
    );
}
