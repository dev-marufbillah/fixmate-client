// Server-side API base for Server Components (always an absolute URL).
// The browser uses NEXT_PUBLIC_API_URL instead (see src/lib/api.ts).
export const API_SERVER_BASE =
  process.env.API_URL_INTERNAL || "http://127.0.0.1:5000/api";

export async function serverFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_SERVER_BASE}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? null) as T | null;
  } catch {
    return null;
  }
}
