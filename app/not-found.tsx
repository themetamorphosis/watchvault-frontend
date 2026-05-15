import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="text-gray-400 text-lg">Page not found</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
