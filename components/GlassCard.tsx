"use client";

import React, { useRef, useCallback } from "react";

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
}

export default function GlassCard({
    children,
    className = "",
    hover = true,
}: GlassCardProps) {
    const ref = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            ref.current.style.setProperty("--card-mx", `${x}px`);
            ref.current.style.setProperty("--card-my", `${y}px`);
        },
        []
    );

    return (
        <div
            ref={ref}
            onMouseMove={handleMouseMove}
            className={`
        relative rounded-2xl
        bg-white/[0.04] border border-white/[0.08]
        backdrop-blur-xl
        shadow-[0_8px_32px_rgba(0,0,0,0.25)]
        ${hover ? "transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.06] hover:shadow-[0_16px_48px_rgba(0,0,0,0.35)] hover:translate-y-[-2px]" : ""}
        ${className}
      `}
        >
            {children}
        </div>
    );
}
