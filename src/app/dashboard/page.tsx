"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DASHBOARD_HOME } from "@/lib/constants";
import { useSessionUser } from "@/hooks/use-session-user";

/** /dashboard — sends the signed-in user to their own role dashboard. */
export default function DashboardIndexPage() {
  const router = useRouter();
  const { user, isPending } = useSessionUser();

  useEffect(() => {
    if (isPending) return;
    if (!user) router.replace("/sign-in?redirect=/dashboard");
    else router.replace(DASHBOARD_HOME[user.role || "customer"]);
  }, [isPending, user, router]);

  return (
    <div className="min-h-[60vh] grid place-items-center">
      <span className="loading loading-spinner loading-lg text-primary" />
    </div>
  );
}
