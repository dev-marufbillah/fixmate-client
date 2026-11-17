import { JobStatus, Role } from "./types";

export const CATEGORIES = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
] as const;

export const SERVICE_MODES = ["Home Visit", "Shop Drop-off"] as const;

/** Identical status colors across every dashboard (assignment requirement). */
export const STATUS_META: Record<JobStatus, { label: string; className: string }> = {
  requested: { label: "Requested", className: "badge-info badge-soft" },
  accepted: { label: "Accepted", className: "badge-indigo" },
  "in-progress": { label: "In Progress", className: "badge-warning badge-soft" },
  completed: { label: "Completed", className: "badge-success badge-soft" },
  rejected: { label: "Rejected", className: "badge-error badge-soft" },
  cancelled: { label: "Cancelled", className: "badge-ghost" },
};

export const APPROVAL_META: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "badge-warning badge-soft" },
  approved: { label: "Approved", className: "badge-success badge-soft" },
  rejected: { label: "Rejected", className: "badge-error badge-soft" },
};

export const PAYMENT_META = {
  paid: { label: "Paid", className: "badge-success" },
  unpaid: { label: "Unpaid", className: "badge-warning badge-soft" },
};

export const ROLE_META: Record<Role, { label: string; className: string }> = {
  customer: { label: "Customer", className: "badge-info badge-soft" },
  technician: { label: "Technician", className: "badge-secondary badge-soft" },
  admin: { label: "Admin", className: "badge-error badge-soft" },
};

export const DASHBOARD_HOME: Record<Role, string> = {
  customer: "/dashboard/customer",
  technician: "/dashboard/technician",
  admin: "/dashboard/admin",
};

export const CATEGORY_ICONS: Record<string, string> = {
  Smartphone: "📱",
  "Laptop & PC:": "💻",
  AC: "❄️",
  Refrigerator: "🧊",
  TV: "📺",
  "Washing Machine": "🧺",
  Electrical: "⚡",
};

export const PIPELINE_STEPS: string[] = [
  "requested",
  "accepted",
  "in-progress",
  "completed",
  "paid",
];
