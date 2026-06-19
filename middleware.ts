import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = new Set(["/", "/login", "/register"]);

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  // Allow public paths, static assets, and API routes
  if (
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/library/:path*",
    "/wishlist/:path*",
    "/discovery/:path*",
    "/profile/:path*",
    "/social/:path*",
    "/ai/:path*",
  ],
};
