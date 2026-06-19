"use client";

import React, { useRef } from "react";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export default function BentoCard({
  children,
  className = "",
  glowColor = "rgba(255, 56, 100, 0.08)",
}: BentoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--card-mx", `${x}px`);
    cardRef.current.style.setProperty("--card-my", `${y}px`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden bg-neutral-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:border-amber-500/30 ${className}`}
      style={{ "--card-glow-color": glowColor } as React.CSSProperties}
    >
      {/* Spotlight glow overlay */}
      <div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
        style={{
          background: `radial-gradient(400px circle at var(--card-mx, 50%) var(--card-my, 50%), var(--card-glow-color, rgba(255, 56, 100, 0.08)), transparent 60%)`,
        }}
      />
      {/* Top shine */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />
      <div className="relative z-10 h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
}
