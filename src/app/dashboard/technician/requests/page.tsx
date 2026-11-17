"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, X, Play, CheckCircle2, Inbox, Loader2 } from "lucide-react";
import { apiFetch, ApiFailure } from "@/lib/api";
import { StatusBadge, PaymentBadge } from "@/components/ui/StatusBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Booking, JobStatus } from "@/lib/types";
import { formatDate, money, cn, todayISO } from "@/lib/utils";
import { useSessionUser } from "@/hooks/use-session-user";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "requested", label: "Requested" },
  { key: "accepted", label: "Accepted" },
  { key: "in-progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

const errMsg = (e: unknown, f: string) => (e instanceof ApiFailure ? e.message : f);

export default function ManageRequestsPage() {
  const { user } = useSessionUser();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [filter, setFilter] = useState("all");
  const [rejectTarget, setRejectTarget] = useState<Booking | null>(null);
  const [completeTarget, setCompleteTarget] = useState<Booking | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await apiFetch<{ bookings: Booking[] }>("/bookings/technician");
      setBookings(data.bookings || []);
    } catch (err) {
      toast.error(errMsg(err, "Could not load requests"));
      setBookings([]);
    }
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /** Status transitions straight from the server-enforced pipeline. */
  const advance = async (b: Booking, status: JobStatus, finalAmount?: number) => {
    setBusyId(b._id);
    try {
      await apiFetch(`/bookings/${b._id}/status`, {
        method: "PATCH",
        body: { status, ...(finalAmount !== undefined ? { finalAmount } : {}) },
      });
      toast.success(
        status === "accepted"
          ? "Request accepted — contact the customer"
          : status === "in-progress"
            ? "Job started — status is now In Progress"
            : status === "completed"
              ? "Job completed — customer can now pay"
              : `Request ${status}`
      );
      setRejectTarget(null);
      setCompleteTarget(null);
      await load();
    } catch (err) {
      toast.error(errMsg(err, "Could not update the job status"));
    } finally {
      setBusyId(null);
    }
  };

  if (bookings === null) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="skeleton-shimmer h-8 w-56 mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const actionButtons = (b: Booking) => {
    switch (b.status) {
      case "requested":
        return (
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-primary btn-xs rounded-lg gap-1.5 h-8"
              disabled={busyId === b._id}
              onClick={() => advance(b, "accepted")}
            >
              {busyId === b._id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              Accept
            </button>
            <button
              type="button"
              className="btn btn-outline btn-error btn-xs rounded-lg gap-1.5 h-8"
              onClick={() => setRejectTarget(b)}
            >
              <X size={12} /> Reject
            </button>
          </div>
        );
      case "accepted":
        return (
          <button
            type="button"
            className="btn btn-secondary btn-xs rounded-lg gap-1.5 h-8"
            disabled={busyId === b._id}
            onClick={() => advance(b, "in-progress")}
          >
            <Play size={12} /> Start Work
          </button>
        );
      case "in-progress":
        return (
          <button
            type="button"
            className="btn btn-primary btn-xs rounded-lg gap-1.5 h-8"
            onClick={() => setCompleteTarget(b)}
          >
            <CheckCircle2 size={12} /> Mark Completed
          </button>
        );
      case "completed":
        return <PaymentBadge status={b.paymentStatus} />;
      default:
        return <span className="text-[11px] opacity-50 italic">No actions</span>;
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-extrabold">Manage Requests</h1>
        <p className="text-sm opacity-70 mt-1">
          The server only allows valid transitions — {bookings.length} total job
          {bookings.length === 1 ? "" : "s"}.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              "btn btn-xs sm:btn-sm rounded-lg whitespace-nowrap",
              filter === f.key ? "btn-primary" : "btn-ghost border border-base-300"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Inbox size={28} />}
          title={bookings.length === 0 ? "No repair requests yet" : `No “${filter}” jobs`}
          description={
            bookings.length === 0
              ? "When customers request one of your approved services, the jobs appear here."
              : "Switch filters to see other jobs."
          }
          actionLabel={bookings.length === 0 ? "Add a service" : undefined}
          actionHref="/dashboard/technician/add-service"
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <div key={b._id} className="card-surface p-4 md:p-5">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-center gap-3.5 min-w-0 lg:w-[280px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.serviceImage} alt="" className="w-12 h-12 rounded-xl object-cover bg-base-200 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{b.serviceTitle}</p>
                    <p className="text-xs opacity-60 truncate">{b.category}</p>
                    <div className="flex gap-1.5 mt-1.5">
                      <StatusBadge status={b.status} />
                      {b.status === "completed" ? <PaymentBadge status={b.paymentStatus} /> : null}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs flex-1 min-w-0">
                  <div>
                    <p className="opacity-55 font-semibold uppercase text-[10px]">Customer</p>
                    <p className="font-bold mt-0.5">{b.customerName}</p>
                    <p className="opacity-70">{b.customerPhone}</p>
                  </div>
                  <div>
                    <p className="opacity-55 font-semibold uppercase text-[10px]">Address</p>
                    <p className="mt-0.5 line-clamp-2">{b.address}</p>
                  </div>
                  <div>
                    <p className="opacity-55 font-semibold uppercase text-[10px]">Preferred date</p>
                    <p className="font-semibold mt-0.5">{formatDate(b.preferredDate)}</p>
                  </div>
                  <div>
                    <p className="opacity-55 font-semibold uppercase text-[10px]">Amount</p>
                    <p className="font-bold mt-0.5">
                      {b.status === "completed" ? money(b.finalAmount) : `from ${money(b.basePrice)}`}
                    </p>
                  </div>
                </div>

                <div className="lg:w-[190px] flex lg:justify-end items-center gap-3">
                  <div className="lg:hidden flex-1 text-xs bg-base-200 rounded-lg p-2.5">
                    <b>Problem:</b> {b.problemDescription}
                  </div>
                  <div className="shrink-0">{actionButtons(b)}</div>
                </div>
              </div>

              <details className="mt-3 pt-3 border-t border-base-300">
                <summary className="text-xs font-semibold cursor-pointer opacity-70 hover:opacity-100">
                  Problem description &amp; full details
                </summary>
                <p className="text-sm opacity-80 mt-2 leading-relaxed">{b.problemDescription}</p>
              </details>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!rejectTarget}
        title="Reject this request?"
        message={`Reject “${rejectTarget?.serviceTitle}” for ${rejectTarget?.customerName}? They will see the status change immediately.`}
        confirmLabel="Reject request"
        danger
        loading={busyId === rejectTarget?._id}
        onConfirm={() => rejectTarget && advance(rejectTarget, "rejected")}
        onCancel={() => setRejectTarget(null)}
      />

      <CompleteModal
        booking={completeTarget}
        busy={busyId === completeTarget?._id}
        onClose={() => setCompleteTarget(null)}
        onComplete={(amount) => completeTarget && advance(completeTarget, "completed", amount)}
      />
    </div>
  );
}

function CompleteModal({
  booking,
  busy,
  onClose,
  onComplete,
}: {
  booking: Booking | null;
  busy: boolean;
  onClose: () => void;
  onComplete: (finalAmount: number) => void;
}) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (booking) {
      setAmount(String(booking.finalAmount || booking.basePrice));
      setError("");
    }
  }, [booking]);

  if (!booking) return null;

  const submit = () => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      setError("Final amount must be a number greater than 0");
      return;
    }
    onComplete(Math.round(n * 100) / 100);
  };

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true">
      <div className="modal-box card-surface border border-base-300 rounded-2xl w-11/12 max-w-md">
        <h3 className="font-heading text-lg font-extrabold">Mark job as completed</h3>
        <p className="text-xs opacity-70 mt-1.5">
          Set the <b>final amount</b> the customer will pay for “{booking.serviceTitle}”.
        </p>

        <div className="mt-5">
          <label className="label-text text-xs font-semibold mb-1.5 block">Final amount (USD)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold opacity-60">$</span>
            <input
              type="number"
              min="1"
              step="0.01"
              autoFocus
              className={cn("input input-bordered rounded-xl w-full pl-8", error && "input-error")}
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[11px] opacity-60">
              Base price was {money(booking.basePrice)} · today is {formatDate(todayISO())}
            </p>
            <button
              type="button"
              className="text-[11px] font-semibold text-primary"
              onClick={() => setAmount(String(booking.basePrice))}
            >
              Use base price
            </button>
          </div>
          {error && <p className="text-xs text-error mt-1.5">{error}</p>}
        </div>

        <div className="modal-action mt-6">
          <button type="button" className="btn btn-ghost rounded-xl" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary rounded-xl gap-2" onClick={submit} disabled={busy}>
            {busy && <span className="loading loading-spinner loading-sm" />}
            Complete job
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
