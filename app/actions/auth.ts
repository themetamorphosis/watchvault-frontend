import { fetchApi } from "@/lib/apiClient";

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

        const res = await fetchApi(`/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
        });

        if (!res.ok) {
            return { error: "Invalid email or password." };
        }

        const data = await res.json();
        const token = data.access_token;

        // Set client-side cookie so we don't rely on Next.js server actions
        const maxAge = 60 * 60 * 24 * 7; // 1 week
        document.cookie = `auth_token=${token}; max-age=${maxAge}; path=/; samesite=lax`;

        // Force a small delay so Next router picks up the cookie when pushing
        await new Promise(r => setTimeout(r, 100));

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

    if (password.length < 6) {
        return { error: "Password must be at least 6 characters." };
    }

    if (password !== confirmPassword) {
        return { error: "Passwords do not match." };
    }

    try {
        const res = await fetchApi(`/auth/register`, {
            method: "POST",
            body: JSON.stringify({ name, email, password }),
        });

        if (!res.ok) {
            const err = await res.json();
            return { error: err.detail || "An error occurred during registration." };
        }

        // Auto login
        return login(prevState, formData);
    } catch (error) {
        console.error("Registration error:", error);
        return { error: error instanceof Error ? error.message : "Something went wrong. Please try again." };
    }
}
