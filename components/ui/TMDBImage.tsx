"use client";

import Image from "next/image";
import { useState } from "react";

interface TMDBImageProps {
    src: string | null | undefined;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
    fill?: boolean;
    priority?: boolean;
    fallback?: React.ReactNode;
}

/**
 * Wrapper around next/image for TMDB and external media images.
 * Handles null/missing src, load failures, and provides a fallback.
 */
export default function TMDBImage({
    src,
    alt,
    className = "",
    width,
    height,
    fill = false,
    priority = false,
    fallback,
}: TMDBImageProps) {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        if (fallback) return <>{fallback}</>;
        return (
            <div className={`flex items-center justify-center bg-zinc-800 text-zinc-500 text-[10px] font-mono uppercase ${className}`}>
                {alt || "No Image"}
            </div>
        );
    }

    const imgProps: React.ComponentProps<typeof Image> = {
        src,
        alt,
        className,
        onError: () => setFailed(true),
        priority,
    };

    if (fill) {
        return <Image {...imgProps} fill />;
    }

    return <Image {...imgProps} width={width ?? 300} height={height ?? 450} />;
}
