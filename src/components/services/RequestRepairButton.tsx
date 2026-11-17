"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { RequestModal } from "./RequestModal";
import { useSessionUser } from "@/hooks/use-session-user";

export function RequestRepairButton({ serviceId }: { serviceId: string }) {
  const { user, isPending } = useSessionUser();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (isPending) {
    return <div className="skeleton-shimmer h-11 w-full" />;
  }

  if (!user) {
    return (
      <Link
        href={`/sign-in?redirect=${encodeURIComponent(pathname)}`}
        className="btn btn-primary rounded-xl w-full h-11 font-semibold"
      >
        Request Repair
      </Link>
    );
  }

  if (user.role !== "customer") {
    return (
      <div>
        <button type="button" disabled className="btn btn-primary btn-disabled rounded-xl w-full h-11">
          Request Repair
        </button>
        <p className="text-xs text-center mt-2.5 opacity-70">
          Only customers can request a repair — you are signed in as a {user.role}.
        </p>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-primary rounded-xl w-full h-11 font-semibold"
      >
        Request Repair
      </button>
      <RequestModal open={open} onClose={() => setOpen(false)} serviceId={serviceId} user={user} />
    </>
  );
}
