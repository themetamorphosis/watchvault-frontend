import { API_BASE } from "@/lib/auth";

export async function authedFetch(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});
  if (
    options.method &&
    ["POST", "PATCH", "PUT"].includes(options.method.toUpperCase())
  ) {
    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }
  }
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (token) headers.set("Cookie", `auth_token=${token}`);
  return fetch(url, { ...options, headers });
}
