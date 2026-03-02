"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import CountUp from "react-countup";
import GlassCard from "@/components/GlassCard";
import {
    Film,
    Tv,
    Sparkles,
    Heart,
    Clock,
    TrendingUp,
    BarChart3,
    Activity,
    Flame,
    Trophy,
    Zap,
} from "lucide-react";

/* ─── Animated Counter ─── */
function StatCounter({
    value,
    label,
    icon: Icon,
    delay = 0,
    color,
}: {
    value: number;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    delay?: number;
    color: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });

    return (
        <GlassCard className="p-6">
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
            >
                <div
                    className="inline-flex items-center justify-center h-10 w-10 rounded-xl mb-4"
                    style={{ background: color }}
                >
                    <Icon className="h-5 w-5 text-white/70" />
                </div>
                <div className="text-3xl font-bold tracking-tight tabular-nums text-white/90">
                    {inView ? (
                        <CountUp end={value} duration={2} delay={delay} />
                    ) : (
                        "0"
                    )}
                </div>
                <div className="text-xs text-white/35 mt-1 font-medium uppercase tracking-wider">
                    {label}
                </div>
            </motion.div>
        </GlassCard>
    );
}

/* ─── Donut Chart ─── */
function DonutChart() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });

    const data = [
        { label: "Watched", value: 42, color: "#10B981" },
        { label: "Pending", value: 18, color: "#F59E0B" },
        { label: "Wishlist", value: 23, color: "#8B5CF6" },
    ];

    const total = data.reduce((s, d) => s + d.value, 0);
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return (
        <div ref={ref}>
            <div className="flex items-center gap-8">
                <div className="relative flex-shrink-0">
                    <svg width="150" height="150" viewBox="0 0 150 150">
                        {data.map((seg, i) => {
                            const strokeLength = (seg.value / total) * circumference;
                            const strokeOffset = circumference - offset;
                            offset += strokeLength;
                            return (
                                <circle
                                    key={i}
                                    cx="75"
                                    cy="75"
                                    r={radius}
                                    fill="none"
                                    stroke={seg.color}
                                    strokeWidth="14"
                                    strokeLinecap="round"
                                    strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
                                    strokeDashoffset={strokeOffset}
                                    className="donut-ring"
                                    style={{
                                        transform: "rotate(-90deg)",
                                        transformOrigin: "50% 50%",
                                        opacity: inView ? 1 : 0,
                                        transition: `opacity 0.5s ${0.2 + i * 0.15}s, stroke-dashoffset 1s ${0.2 + i * 0.15}s cubic-bezier(0.25,0.46,0.45,0.94)`,
                                    }}
                                />
                            );
                        })}
                        {/* Center text */}
                        <text
                            x="75"
                            y="70"
                            textAnchor="middle"
                            className="fill-white/80 text-2xl font-bold"
                            style={{ fontSize: "28px" }}
                        >
                            {total}
                        </text>
                        <text
                            x="75"
                            y="90"
                            textAnchor="middle"
                            className="fill-white/35 text-xs"
                            style={{ fontSize: "11px" }}
                        >
                            Total
                        </text>
                    </svg>
                </div>
                <div className="flex flex-col gap-3">
                    {data.map((seg) => (
                        <div key={seg.label} className="flex items-center gap-3">
                            <div
                                className="h-3 w-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: seg.color }}
                            />
                            <span className="text-sm text-white/50">{seg.label}</span>
                            <span className="text-sm font-semibold text-white/80 ml-auto tabular-nums">
                                {seg.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Quick Stats List ─── */
const QUICK_STATS = [
    { label: "This Week", value: "+5 titles", icon: Zap, color: "text-cyan-400" },
    { label: "Avg. Rating", value: "4.2 ★", icon: Trophy, color: "text-amber-400" },
    { label: "Streak", value: "12 days", icon: Flame, color: "text-rose-400" },
    { label: "Completion", value: "68%", icon: Activity, color: "text-emerald-400" },
];

export default function DashboardPage() {
    const heroRef = useRef<HTMLDivElement>(null);
    const heroInView = useInView(heroRef, { once: true, margin: "-40px" });

    return (
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-10"
            >
                <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
                    Dashboard
                </h1>
                <p className="text-sm text-white/40 mt-1">
                    Your watchlist at a glance
                </p>
            </motion.div>

            {/* ── Hero Insight Card ── */}
            <motion.div
                ref={heroRef}
                initial={{ opacity: 0, y: 24 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="mb-10"
            >
                <GlassCard className="relative overflow-hidden p-8 sm:p-10">
                    {/* Animated moving glow */}
                    <div className="absolute inset-0 -z-0 overflow-hidden rounded-2xl">
                        <div
                            className="absolute w-[500px] h-[400px] rounded-full blur-[80px] opacity-60"
                            style={{
                                background:
                                    "radial-gradient(circle, rgba(168,85,247,0.25) 0%, rgba(139,92,246,0.1) 40%, transparent 70%)",
                                animation: "glowOrbit1 8s ease-in-out infinite",
                            }}
                        />
                        <div
                            className="absolute w-[400px] h-[350px] rounded-full blur-[80px] opacity-50"
                            style={{
                                background:
                                    "radial-gradient(circle, rgba(56,189,248,0.2) 0%, rgba(59,130,246,0.08) 40%, transparent 70%)",
                                animation: "glowOrbit2 10s ease-in-out infinite",
                            }}
                        />
                        <div
                            className="absolute w-[300px] h-[250px] rounded-full blur-[60px] opacity-40"
                            style={{
                                background:
                                    "radial-gradient(circle, rgba(236,72,153,0.18) 0%, transparent 70%)",
                                animation: "glowOrbit3 12s ease-in-out infinite",
                            }}
                        />
                    </div>



                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-violet-400" />
                            <span className="text-xs font-semibold uppercase tracking-widest text-white/40">
                                Your Insights
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
                            <div>
                                <div className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                                    1,547
                                </div>
                                <div className="text-sm text-white/40 mt-1">
                                    Hours Watched
                                </div>
                            </div>
                            <div>
                                <div className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                                    Crime
                                </div>
                                <div className="text-sm text-white/40 mt-1">
                                    Top Genre
                                </div>
                            </div>
                            <div>
                                <div className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                                    Breaking Bad
                                </div>
                                <div className="text-sm text-white/40 mt-1">
                                    Longest Series
                                </div>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </motion.div>

            {/* ── KPI Row ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-10">
                <StatCounter
                    value={124}
                    label="Movies"
                    icon={Film}
                    delay={0}
                    color="rgba(255, 56, 100, 0.15)"
                />
                <StatCounter
                    value={47}
                    label="TV Shows"
                    icon={Tv}
                    delay={0.1}
                    color="rgba(168, 85, 247, 0.15)"
                />
                <StatCounter
                    value={38}
                    label="Anime"
                    icon={Sparkles}
                    delay={0.2}
                    color="rgba(56, 189, 248, 0.15)"
                />
                <StatCounter
                    value={56}
                    label="Favorites"
                    icon={Heart}
                    delay={0.3}
                    color="rgba(250, 204, 21, 0.15)"
                />
            </div>

            {/* ── Analytics Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Status Breakdown donut */}
                <GlassCard className="p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="h-4 w-4 text-white/30" />
                        <span className="text-xs font-semibold uppercase tracking-widest text-white/40">
                            Status Breakdown
                        </span>
                    </div>
                    <DonutChart />
                </GlassCard>

                {/* Quick Stats */}
                <GlassCard className="p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-6">
                        <Activity className="h-4 w-4 text-white/30" />
                        <span className="text-xs font-semibold uppercase tracking-widest text-white/40">
                            Quick Stats
                        </span>
                    </div>
                    <div className="flex flex-col gap-4">
                        {QUICK_STATS.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                                className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
                            >
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                <span className="text-sm text-white/50">{stat.label}</span>
                                <span className="ml-auto text-sm font-semibold text-white/80 tabular-nums">
                                    {stat.value}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
