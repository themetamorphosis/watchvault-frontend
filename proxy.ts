import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
    const { nextUrl } = req;

    // We get the token from the cookies
    const token = req.cookies.get("auth_token")?.value;
    const isLoggedIn = !!token;

    const publicPaths = ["/", "/login", "/register"];
    const isPublicPath = publicPaths.includes(nextUrl.pathname);
    const isAuthApi = nextUrl.pathname.startsWith("/api/auth");
    const isApi = nextUrl.pathname.startsWith("/api/");

    // Always allow auth API routes
    if (isAuthApi) return NextResponse.next();

    // Allow other API routes
    if (isApi) return NextResponse.next();

    // Redirect logged-in users away from login/register
    if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/register")) {
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    // Allow public paths
    if (isPublicPath) return NextResponse.next();

    // Protect everything else — redirect to login
    if (!isLoggedIn) {
        const loginUrl = new URL("/login", nextUrl);
        loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
