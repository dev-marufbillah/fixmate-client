"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarRange } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { StatusBadge, PaymentBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeletons";
import { Booking } from "@/lib/types";
import { formatDate, money, cn } from "@/lib/utils";

const FILTERS = [
  { key: "", label: "All" },
  { key: "requested", label: "Requested" },
  { key: "accepted", label: "Accepted" },
  { key: "in-progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "rejected", label: "Rejected" },
  { key: "cancelled", label: "Cancelled" },
];

export default function AdminBookingsPage() {
  const [status, setStatus] = useState("");
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  useEffect(() => {
    let alive = true;
    setBookings(null);
    (async () => {
      try {
        const qs = status ? `?status=${status}` : "";
        const data = await apiFetch<{ bookings: Booking[] }>(`/admin/bookings${qs}`);
        if (alive) setBookings(data.bookings || []);
      } catch (err) {
        if (alive) {
          toast.error(err instanceof Error ? err.message : "Could not load bookings");
          setBookings([]);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [status]);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-5">
        <h1 className="text-2xl font-heading font-extrabold">All Bookings</h1>
        <p className="text-sm opacity-70 mt-1">Read-only view of every repair job on the platform.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setStatus(f.key)}
            className={cn(
              "btn btn-xs sm:btn-sm rounded-lg whitespace-nowrap",
              status === f.key ? "btn-primary" : "btn-ghost border border-base-300"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {bookings === null ? (
        <TableSkeleton rows={6} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={<CalendarRange size={28} />}
          title={status ? `No “${status}” bookings` : "No bookings yet"}
          description="Repair requests sent by customers will appear here in real time."
        />
      ) : (
        <>
          <div className="hidden lg:block card-surface overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr className="text-xs uppercase tracking-wide">
                  <th>Service</th>
                  <th>Customer</th>
                  <th>Technician</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} className="align-middle">
                    <td className="font-semibold text-sm max-w-[200px] truncate">{b.serviceTitle}</td>
                    <td className="text-sm">
                      {b.customerName}
                      <span className="block text-[11px] opacity-55">{b.customerEmail}</span>
                    </td>
                    <td className="text-sm">{b.technicianName}</td>
                    <td className="text-sm">{formatDate(b.preferredDate)}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td><PaymentBadge status={b.paymentStatus} /></td>
                    <td className="font-bold text-sm">
                      {money(b.status === "completed" ? b.finalAmount : b.basePrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-4">
            {bookings.map((b) => (
              <div key={b._id} className="card-surface p-4">
                <p className="font-bold text-sm">{b.serviceTitle}</p>
                <p className="text-xs opacity-65 mt-1">
                  {b.customerName} → {b.technicianName} · {formatDate(b.preferredDate)}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <StatusBadge status={b.status} />
                  <PaymentBadge status={b.paymentStatus} />
                  <span className="font-bold text-sm ml-auto">
                    {money(b.status === "completed" ? b.finalAmount : b.basePrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
