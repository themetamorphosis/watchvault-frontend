"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Wrench, ArrowLeft, ChevronRight } from "lucide-react";

interface UnderDevelopmentPageProps {
    title: string;
    description: string;
    features: string[];
    icon?: React.ReactNode;
}

export default function UnderDevelopmentPage({
    title,
    description,
    features,
    icon,
}: UnderDevelopmentPageProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 py-16">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-lg w-full text-center"
            >
                {/* Icon */}
                <div className="mb-8 flex justify-center">
                    <div className="dev-icon-pulse relative">
                        <div className="flex items-center justify-center h-24 w-24 rounded-3xl bg-white/[0.04] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                            {icon || <Wrench className="h-10 w-10 text-white/20" />}
                        </div>
                        {/* Glow */}
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 blur-2xl -z-10" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white/90 mb-3">
                    {title}
                </h1>

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-400/80 mb-6">
                    <Wrench className="h-3 w-3" />
                    Under Development
                </div>

                {/* Description */}
                <p className="text-base text-white/40 leading-relaxed max-w-md mx-auto mb-10">
                    {description}
                </p>

                {/* Planned Features */}
                <div className="mb-10 space-y-3 text-left max-w-sm mx-auto">
                    <div className="filter-group-title text-center mb-4">
                        Planned Features
                    </div>
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                            className="dev-feature-item"
                        >
                            <div className="bullet" />
                            {feature}
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <Link href="/library/movies" className="glass-btn-primary text-sm">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Library</span>
                </Link>
            </motion.div>
        </div>
    );
}
