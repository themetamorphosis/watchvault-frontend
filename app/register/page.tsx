"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, UserPlus, AlertCircle } from "lucide-react";
import { register } from "@/app/actions/auth";

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);

    useEffect(() => {
        // Clear auth token when visiting register page
        document.cookie = "auth_token=; max-age=0; path=/; samesite=lax";
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsPending(true);
        const res = await register(null, new FormData(e.currentTarget));
        if (res?.error) {
            setError(res.error);
            setIsPending(false);
        } else if (res?.success) {
            router.push("/dashboard");
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-[#050505] text-white overflow-hidden flex items-center justify-center px-4">
            {/* Background layers */}
            <div className="aurora-bg" />
            <div className="aurora-vignette" />
            <div className="noise-overlay" />

            {/* Floating orbs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="orb orb-1" style={{ top: "10%", right: "15%" }} />
                <div className="orb orb-2" style={{ bottom: "25%", left: "10%" }} />
                <div className="orb orb-3" style={{ top: "50%", right: "5%" }} />
            </div>

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="liquid-glass liquid-glass-round p-8 sm:p-10">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="text-center mb-8"
                    >
                        <Link href="/" className="inline-block mb-6">
                            <span className="text-xl font-semibold tracking-tight text-white/90">
                                WatchVault
                            </span>
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gradient mb-2">
                            Create your account
                        </h1>
                        <p className="text-sm text-white/40">
                            Start tracking your movies, TV shows, and anime
                        </p>
                    </motion.div>

                    {/* Error */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            className="mb-6 flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300"
                        >
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-xs font-medium text-white/50 mb-2 tracking-wide uppercase">
                                Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    autoComplete="name"
                                    placeholder="Your name"
                                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/20 outline-none transition-all duration-300 focus:border-white/20 focus:bg-white/[0.06] focus:ring-1 focus:ring-white/10"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-xs font-medium text-white/50 mb-2 tracking-wide uppercase">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/20 outline-none transition-all duration-300 focus:border-white/20 focus:bg-white/[0.06] focus:ring-1 focus:ring-white/10"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-xs font-medium text-white/50 mb-2 tracking-wide uppercase">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                    placeholder="Min. 6 characters"
                                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/20 outline-none transition-all duration-300 focus:border-white/20 focus:bg-white/[0.06] focus:ring-1 focus:ring-white/10"
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-xs font-medium text-white/50 mb-2 tracking-wide uppercase">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                    placeholder="Repeat your password"
                                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/20 outline-none transition-all duration-300 focus:border-white/20 focus:bg-white/[0.06] focus:ring-1 focus:ring-white/10"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <motion.button
                            type="submit"
                            disabled={isPending}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className="glass-btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="relative flex items-center justify-center gap-2">
                                {isPending ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                                        />
                                        <span>Creating account...</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4" />
                                        <span>Create Account</span>
                                    </>
                                )}
                            </span>
                        </motion.button>
                    </form>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="mt-8 text-center"
                    >
                        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />
                        <p className="text-sm text-white/30">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="text-white/60 hover:text-white transition-colors duration-300 font-medium inline-flex items-center gap-1"
                            >
                                Sign in
                            </Link>
                        </p>
                    </motion.div>
                </div>
            </motion.div >
        </div >
    );
}
