"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession, signOut } from "@/components/SessionProvider";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    User,
    Mail,
    Camera,
    LogOut,
    Check,
    Loader2,
    Upload,
} from "lucide-react";
import { updateProfile } from "@/app/actions/profile";
import { API_BASE } from "@/lib/auth";

export default function ProfilePage() {
    const router = useRouter();
    const { data: session, update: updateSession, status } = useSession();
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageUrlInput, setImageUrlInput] = useState<string>("");
    const [showSaved, setShowSaved] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        if (session?.user?.image) {
            setImagePreview(session.user.image);
            setImageUrlInput(session.user.image);
        }
    }, [session?.user?.image]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsPending(true);
        const res = await updateProfile(null, new FormData(e.currentTarget));
        if (res?.error) {
            setError(res.error);
        } else if (res?.success) {
            setShowSaved(true);
            await updateSession();
            setTimeout(() => setShowSaved(false), 2500);
        }
        setIsPending(false);
    };

    const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setImageUrlInput(url);
        const trimmed = url.trim();
        if (trimmed) {
            if (trimmed.startsWith("/")) {
                setImagePreview(trimmed);
            } else {
                try {
                    new URL(trimmed);
                    setImagePreview(trimmed);
                } catch {
                    setImagePreview(null);
                }
            }
        } else {
            setImagePreview(null);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadError(null);
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const match = document.cookie.match(/(?:^|;\s*)auth_token=([^;]*)/);
            const token = match ? match[1] : "";

            const res = await fetch(`${API_BASE}/upload`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                setUploadError(data.error || "Upload failed");
                return;
            }

            setImagePreview(data.imageUrl);
            setImageUrlInput(data.imageUrl);
            await updateSession();
            setShowSaved(true);
            setTimeout(() => setShowSaved(false), 2500);
        } catch {
            setUploadError("Upload failed. Please try again.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    if (!session) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white/30 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#050505] text-white">
            {/* Ambient glow */}
            <div
                className="pointer-events-none fixed inset-x-0 top-0 h-72 z-0"
                style={{
                    background:
                        "radial-gradient(ellipse 70% 100% at 50% 0%, rgba(168, 85, 247, 0.08), transparent 60%)",
                }}
            />

            {/* Header */}
            <div
                className="sticky top-0 z-40 border-b border-white/[0.06]"
                style={{
                    background: "rgba(5, 5, 5, 0.75)",
                    backdropFilter: "blur(20px) saturate(160%)",
                }}
            >
                <div className="mx-auto w-full max-w-[800px] px-6">
                    <div className="flex items-center justify-between py-4">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Link>
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm text-white/40 hover:text-red-400/80 hover:bg-red-500/[0.06] transition-all duration-200"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 mx-auto w-full max-w-[800px] px-6 pt-12 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
                        Profile
                    </h1>
                    <p className="text-sm text-white/35 mb-10">
                        Manage your account settings
                    </p>

                    {/* Profile card */}
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                        {/* Banner */}
                        <div className="h-28 bg-gradient-to-r from-rose-500/20 via-violet-500/20 to-cyan-500/20" />

                        {/* Avatar with upload */}
                        <div className="px-8 -mt-12">
                            <div className="relative inline-block group">
                                <div className="h-24 w-24 rounded-full border-4 border-[#0a0a0a] overflow-hidden bg-white/[0.06]">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Profile"
                                            className="h-full w-full object-cover"
                                            onError={() => setImagePreview(null)}
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-rose-500/20 to-violet-500/20">
                                            <span className="text-3xl font-bold text-white/60">
                                                {session.user?.name?.[0]?.toUpperCase() || "U"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {/* Upload overlay */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer border-4 border-transparent"
                                >
                                    {uploading ? (
                                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                                    ) : (
                                        <Upload className="h-6 w-6 text-white" />
                                    )}
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                {/* Camera badge */}
                                <div className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-violet-600 border-2 border-[#0a0a0a] flex items-center justify-center">
                                    <Camera className="h-3.5 w-3.5 text-white" />
                                </div>
                            </div>
                            <p className="text-xs text-white/25 mt-2">
                                Click avatar to upload a photo
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8">
                            {/* Upload error */}
                            {uploadError && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400"
                                >
                                    {uploadError}
                                </motion.div>
                            )}

                            {/* Form error */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* Success */}
                            {showSaved && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 flex items-center gap-2"
                                >
                                    <Check className="h-4 w-4" />
                                    Profile updated successfully
                                </motion.div>
                            )}

                            <div className="space-y-5">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-white/50 mb-2">
                                        Display Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                                        <input
                                            type="text"
                                            name="name"
                                            defaultValue={session.user?.name || ""}
                                            placeholder="Your name"
                                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                {/* Email (read-only) */}
                                <div>
                                    <label className="block text-sm font-medium text-white/50 mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                                        <input
                                            type="email"
                                            value={session.user?.email || ""}
                                            disabled
                                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-white/40 text-sm cursor-not-allowed"
                                        />
                                    </div>
                                    <p className="text-xs text-white/20 mt-1.5">
                                        Email cannot be changed
                                    </p>
                                </div>

                                {/* Profile Image URL — alternative to upload */}
                                <div>
                                    <label className="block text-sm font-medium text-white/50 mb-2">
                                        Or paste a photo URL
                                    </label>
                                    <div className="relative">
                                        <Camera className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                                        <input
                                            type="text"
                                            name="image"
                                            value={imageUrlInput}
                                            placeholder="https://example.com/photo.jpg"
                                            onChange={handleImageUrlChange}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Save button */}
                            <motion.button
                                type="submit"
                                disabled={isPending}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                className="mt-8 w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-rose-600 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-shadow duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </motion.button>
                        </form>
                    </div>

                    {/* Account info */}
                    <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
                        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">
                            Account
                        </h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-white/70">
                                    Signed in as{" "}
                                    <span className="font-medium text-white/90">
                                        {session.user?.email}
                                    </span>
                                </div>
                                <div className="text-xs text-white/30 mt-1">
                                    Member since{" "}
                                    {new Date().toLocaleDateString("en-US", {
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </div>
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="px-4 py-2 rounded-xl border border-red-500/20 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.06] hover:border-red-500/30 transition-all duration-200"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
