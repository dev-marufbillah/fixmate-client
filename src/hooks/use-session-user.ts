"use client";

import { authClient, SessionUser } from "@/lib/auth-client";

/** Reactive session state for client components (never redirects while pending). */
export function useSessionUser() {
  const { data, isPending, isRefetching, refetch, error } = authClient.useSession();
  const session = data as unknown as { user?: SessionUser } | null | undefined;
  return {
    user: session?.user ?? null,
    isPending: isPending || isRefetching,
    error,
    refetch: () => refetch(),
  };
}
