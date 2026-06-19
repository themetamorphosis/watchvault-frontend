"use server";

import { authedFetch } from "@/lib/serverFetch";

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
      if (
        !parsedImage.startsWith("http://") &&
        !parsedImage.startsWith("https://")
      ) {
        parsedImage = "https://" + parsedImage;
      }
      try {
        new URL(parsedImage);
      } catch {
        return { error: "Please enter a valid image URL." };
      }
    }
  }

  try {
    const res = await authedFetch(`/auth/me`, {
      method: "PATCH",
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

export async function uploadAvatar(formData: FormData) {
  try {
    const res = await authedFetch(`/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.detail || data.error || "Upload failed" };
    }

    return { success: true, imageUrl: data.imageUrl };
  } catch (error) {
    console.error("Upload avatar error:", error);
    return { error: "Upload failed. Please try again." };
  }
}
