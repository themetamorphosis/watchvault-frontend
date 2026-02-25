import { API_BASE } from "@/lib/auth";

export async function updateProfile(prevState: unknown, formData: FormData) {
    const name = (formData.get("name") as string)?.trim();
    const image = (formData.get("image") as string)?.trim();

    if (!name || name.length < 1) {
        return { error: "Name is required." };
    }

    if (name.length > 50) {
        return { error: "Name must be 50 characters or less." };
    }

    let parsedImage = image;
    if (parsedImage && parsedImage.length > 0) {
        if (!parsedImage.startsWith("/uploads/")) {
            if (!parsedImage.startsWith("http://") && !parsedImage.startsWith("https://")) {
                parsedImage = "https://" + parsedImage;
            }
            try {
                new URL(parsedImage);
            } catch {
                return { error: "Please enter a valid image URL." };
            }
        }
    }

    const match = document.cookie.match(/(?:^|;\s*)auth_token=([^;]*)/);
    const token = match ? match[1] : null;

    if (!token) {
        return { error: "You must be signed in." };
    }

    try {
        const res = await fetch(`${API_BASE}/auth/me`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name, image: parsedImage || null }),
        });

        if (!res.ok) {
            return { error: "Failed to update profile." };
        }
    } catch {
        return { error: "Failed to update profile." };
    }

    return { success: true };
}
