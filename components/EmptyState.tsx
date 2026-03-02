"use client";

import React from "react";
import { motion } from "framer-motion";
import { Film, Plus } from "lucide-react";

interface EmptyStateProps {
    icon?: React.ReactNode;
    headline: string;
    subtext: string;
    ctaLabel?: string;
    onCta?: () => void;
}

export default function EmptyState({
    icon,
    headline,
    subtext,
    ctaLabel = "+ Add Title",
    onCta,
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center justify-center py-24 px-6 text-center"
        >
            {/* Icon */}
            <div className="mb-6 flex items-center justify-center h-20 w-20 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                {icon || <Film className="h-8 w-8 text-white/20" />}
            </div>

            {/* Headline */}
            <h3 className="text-2xl font-semibold tracking-tight text-white/80 mb-2">
                {headline}
            </h3>

            {/* Subtext */}
            <p className="text-sm text-white/35 max-w-md leading-relaxed mb-8">
                {subtext}
            </p>

            {/* CTA */}
            {onCta && (
                <button
                    onClick={onCta}
                    className="glass-btn-primary text-sm"
                >
                    <Plus className="h-4 w-4" />
                    <span>{ctaLabel}</span>
                </button>
            )}
        </motion.div>
    );
}
