import { SessionUser } from "./auth-client";

const BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

let tokenCache: { token: string; expiresAt: number } | null = null;

export class ApiFailure extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

export function clearToken() {
  tokenCache = null;
}

/** Obtain a role-based JWT from the Next.js token bridge (BetterAuth session → JWT). */
async function getToken(): Promise<string | null> {
  try {
    if (tokenCache && tokenCache.expiresAt > Date.now()) return tokenCache.token;
    const res = await fetch("/api/auth/token", { method: "POST", cache: "no-store" });
    if (!res.ok) {
      tokenCache = null;
      return null;
    }
    const json = await res.json();
    const token = json?.data?.token as string | undefined;
    if (!token) return null;
    tokenCache = { token, expiresAt: Date.now() + 60 * 60 * 1000 - 30_000 };
    return token;
  } catch {
    return null;
  }
}

interface ApiOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
  raw?: BodyInit;
  headers?: Record<string, string>;
}

/** Central fetch wrapper: attaches Bearer JWT, retries once after refresh, normalizes errors. */
export async function apiFetch<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, raw, headers: extra } = options;

  const doFetch = async (): Promise<Response> => {
    const headers: Record<string, string> = { ...(extra || {}) };
    if (body !== undefined && !raw) headers["Content-Type"] = "application/json";
    if (auth) {
      const token = await getToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    return fetch(`${BASE}${path}`, {
      method,
      headers,
      body: raw ?? (body !== undefined ? JSON.stringify(body) : undefined),
      cache: "no-store",
    });
  };

  let res = await doFetch();
  if (res.status === 401 && auth) {
    // Token expired or session changed — refresh once and retry.
    clearToken();
    res = await doFetch();
  }

  const json = await res.json().catch(() => null);
  if (!res.ok || json?.success === false) {
    throw new ApiFailure(json?.message || `Request failed (${res.status})`, res.status);
  }
  return (json?.data ?? json) as T;
}

/** Upload a file to the server's ImgBB proxy (field name: image). */
export async function uploadImage(file: File): Promise<{ url: string; displayUrl: string }> {
  const form = new FormData();
  form.append("image", file);
  return apiFetch("/upload/imgbb", { method: "POST", raw: form });
}

export type { SessionUser };
