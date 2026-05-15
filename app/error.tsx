"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-4xl font-bold">Something went wrong</h1>
        <p className="text-gray-400 max-w-md mx-auto">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
