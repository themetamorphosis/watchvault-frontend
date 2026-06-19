"use server";

import { API_BASE } from "@/lib/auth";

export async function getSession() {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return null;

    try {
        const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { Cookie: `auth_token=${token}` },
            cache: "no-store",
        });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

export async function logout() {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
}

export async function login(prevState: unknown, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email and password are required." };
    }

    try {
        const params = new URLSearchParams();
        params.append("username", email);
        params.append("password", password);

        const res = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString(),
        });

        if (!res.ok) {
            return { error: "Invalid email or password." };
        }

        const data = await res.json();
        const token = data.access_token;

        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieStore.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24,
        });

        return { success: true };
    } catch (error) {
        console.error("Login error:", error);
        return { error: error instanceof Error ? error.message : "Something went wrong. Please try again." };
    }
}

export async function register(prevState: unknown, formData: FormData): Promise<{ error?: string; success?: boolean }> {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!name || !email || !password || !confirmPassword) {
        return { error: "All fields are required." };
    }

    if (password.length < 8) {
        return { error: "Password must be at least 8 characters." };
    }

    if (password !== confirmPassword) {
        return { error: "Passwords do not match." };
    }

    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        if (!res.ok) {
            const err = await res.json();
            return { error: err.detail || "An error occurred during registration." };
        }

        return login(prevState, formData);
    } catch (error) {
        console.error("Registration error:", error);
        return { error: error instanceof Error ? error.message : "Something went wrong. Please try again." };
    }
}
