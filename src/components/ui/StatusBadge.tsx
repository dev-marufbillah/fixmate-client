import { STATUS_META, APPROVAL_META, PAYMENT_META } from "@/lib/constants";
import { JobStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: JobStatus | string }) {
  const meta = STATUS_META[status as JobStatus];
  return <span className={cn("badge", meta?.className || "badge-ghost")}>{meta?.label || status}</span>;
}

export function ApprovalBadge({ status }: { status: string }) {
  const meta = APPROVAL_META[status] || APPROVAL_META.pending;
  return <span className={cn("badge", meta.className)}>{meta.label}</span>;
}

export function PaymentBadge({ status }: { status: "paid" | "unpaid" }) {
  const meta = PAYMENT_META[status];
  return <span className={cn("badge", meta.className)}>{meta.label}</span>;
}
