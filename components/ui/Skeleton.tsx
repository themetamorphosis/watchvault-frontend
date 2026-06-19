"use client";

interface SkeletonProps {
    className?: string;
    style?: React.CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse rounded bg-tui-panel border border-tui-border ${className}`} style={style}
            aria-hidden="true"
        />
    );
}

export function SkeletonCard() {
    return (
        <div className="aspect-[2/3] w-full" aria-label="Loading media card">
            <Skeleton className="h-full w-full rounded-xl" />
        </div>
    );
}

export function SkeletonGrid({ count = 10, cols }: { count?: number; cols?: string }) {
    return (
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 ${cols ?? "xl:grid-cols-5"}`} role="status" aria-label="Loading content">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
            <span className="sr-only">Loading...</span>
        </div>
    );
}

export function SkeletonLine({ width = "100%", height = "1rem" }: { width?: string; height?: string }) {
    return <Skeleton className="" style={{ width, height }} />;
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
    return (
        <div className="space-y-2" aria-hidden="true">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className="h-3"
                    style={{ width: i === lines - 1 ? "60%" : "100%" }}
                />
            ))}
        </div>
    );
}
