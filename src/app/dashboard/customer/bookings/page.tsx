"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CalendarClock,
  ChevronDown,
  CreditCard,
  Download,
  Loader2,
  Star,
  X,
} from "lucide-react";
import { apiFetch, ApiFailure } from "@/lib/api";
import { StatusBadge, PaymentBadge } from "@/components/ui/StatusBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeletons";
import { Timeline } from "@/components/dashboard/Timeline";
import { downloadInvoice } from "@/lib/invoice";
import { Booking, Payment } from "@/lib/types";
import { formatDate, money, cn } from "@/lib/utils";
import { useSessionUser } from "@/hooks/use-session-user";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "requested", label: "Requested" },
  { key: "accepted", label: "Accepted" },
  { key: "in-progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "rejected", label: "Rejected" },
  { key: "cancelled", label: "Cancelled" },
];

const errMsg = (e: unknown, fallback: string) => (e instanceof ApiFailure ? e.message : fallback);

export default function CustomerBookingsPage() {
  const { user } = useSessionUser();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [filter, setFilter] = useState("all");
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [rateTarget, setRateTarget] = useState<Booking | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await apiFetch<{ bookings: Booking[] }>("/bookings/my");
      setBookings(data.bookings || []);
    } catch (err) {
      toast.error(errMsg(err, "Could not load your bookings"));
      setBookings([]);
    }
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const doCancel = async () => {
    if (!cancelTarget) return;
    setBusyId(cancelTarget._id);
    try {
      await apiFetch(`/bookings/${cancelTarget._id}/cancel`, { method: "PATCH" });
      toast.success("Booking cancelled");
      setCancelTarget(null);
      await load();
    } catch (err) {
      toast.error(errMsg(err, "Could not cancel this booking"));
    } finally {
      setBusyId(null);
    }
  };

  const payNow = async (b: Booking) => {
    setBusyId(b._id);
    try {
      const { url } = await apiFetch<{ url: string }>("/payments/create-checkout-session", {
        method: "POST",
        body: { bookingId: b._id },
      });
      if (url) window.location.href = url;
      else throw new Error("No checkout URL returned");
    } catch (err) {
      toast.error(errMsg(err, "Could not start the checkout"));
      setBusyId(null);
    }
  };

  const downloadInvoiceFor = async (b: Booking) => {
    try {
      const data = await apiFetch<{ payments: Payment[] }>("/payments/my");
      const payment = data.payments.find((p) => p.bookingId === b._id);
      if (!payment) return toast.error("Payment record not found yet");
      downloadInvoice(payment);
      toast.success("Invoice downloaded");
    } catch (err) {
      toast.error(errMsg(err, "Could not generate the invoice"));
    }
  };

  if (bookings === null) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="skeleton-shimmer h-8 w-56 mb-6" />
        <TableSkeleton rows={5} />
      </div>
    );
  }

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const actions = (b: Booking) => (
    <div className="flex flex-wrap items-center gap-2 justify-end">
      {b.status === "requested" && (
        <button
          type="button"
          className="btn btn-outline btn-error btn-xs rounded-lg h-8"
          onClick={() => setCancelTarget(b)}
        >
          Cancel
        </button>
      )}
      {b.status === "completed" && b.paymentStatus === "unpaid" && (
        <button
          type="button"
          className="btn btn-primary btn-xs rounded-lg h-8 gap-1.5"
          onClick={() => payNow(b)}
          disabled={busyId === b._id}
        >
          {busyId === b._id ? <Loader2 size={12} className="animate-spin" /> : <CreditCard size={12} />}
          Pay Now
        </button>
      )}
      {b.paymentStatus === "paid" && (
        <>
          <button
            type="button"
            className="btn btn-outline btn-primary btn-xs rounded-lg h-8 gap-1.5"
            onClick={() => downloadInvoiceFor(b)}
          >
            <Download size={12} /> Invoice
          </button>
          {!b.rating && (
            <button
              type="button"
              className="btn btn-secondary btn-xs rounded-lg h-8 gap-1.5"
              onClick={() => setRateTarget(b)}
            >
              <Star size={12} /> Rate
            </button>
          )}
        </>
      )}
      <button
        type="button"
        className="btn btn-ghost btn-xs rounded-lg h-8 gap-1"
        onClick={() => setExpanded((e) => (e === b._id ? null : b._id))}
        aria-expanded={expanded === b._id}
      >
        Details
        <ChevronDown size={13} className={cn("transition", expanded === b._id && "rotate-180")} />
      </button>
    </div>
  );

  const detailPanel = (b: Booking) =>
    expanded === b._id ? (
      <tr className="bg-base-200/50">
        <td colSpan={7} className="p-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <h4 className="font-heading font-bold text-sm mb-4">Job timeline</h4>
              <Timeline booking={b} />
            </div>
            <div className="space-y-3 text-sm">
              <h4 className="font-heading font-bold text-sm">Request details</h4>
              <p className="text-xs leading-relaxed bg-base-100 rounded-xl p-3 border border-base-300">
                <b>Problem:</b> {b.problemDescription}
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <p><b>Phone:</b> {b.customerPhone}</p>
                <p><b>Address:</b> {b.address}</p>
                <p><b>Category:</b> {b.category}</p>
                <p><b>Preferred:</b> {formatDate(b.preferredDate)}</p>
              </div>
              {b.rating ? (
                <p className="text-xs inline-flex items-center gap-1.5 bg-secondary/10 rounded-lg px-3 py-2">
                  <Star size={13} className="fill-secondary text-secondary" />
                  <b>{b.rating}/5</b> — {b.review || "Thanks for your feedback!"}
                </p>
              ) : null}
            </div>
          </div>
        </td>
      </tr>
    ) : null;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-heading font-extrabold">My Bookings</h1>
          <p className="text-sm opacity-70 mt-1">
            Track, cancel or pay for your repair requests — {bookings.length} total.
          </p>
        </div>
        <Link href="/services" className="btn btn-primary rounded-xl h-10 btn-sm">
          Book a new repair
        </Link>
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
          icon={<CalendarClock size={28} />}
          title={bookings.length === 0 ? "No repair requests yet" : `No “${filter}” jobs found`}
          description={
            bookings.length === 0
              ? "When you request a repair, it will appear here with live status updates."
              : "Try another status filter to see more jobs."
          }
          actionLabel={bookings.length === 0 ? "Browse services" : undefined}
          actionHref="/services"
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block card-surface overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr className="text-xs uppercase tracking-wide">
                  <th>Service</th>
                  <th>Technician</th>
                  <th>Preferred date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <Fragment key={b._id}>
                    <tr className="align-middle">
                      <td>
                        <div className="flex items-center gap-3 min-w-[200px]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={b.serviceImage} alt="" className="w-11 h-11 rounded-lg object-cover bg-base-200" />
                          <div>
                            <p className="font-semibold text-sm leading-tight">{b.serviceTitle}</p>
                            <p className="text-[11px] opacity-60">{b.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-sm">{b.technicianName}</td>
                      <td className="text-sm">{formatDate(b.preferredDate)}</td>
                      <td>
                        <p className="font-bold text-sm">
                          {money(b.status === "completed" ? b.finalAmount : b.basePrice)}
                        </p>
                        <p className="text-[10px] uppercase tracking-wide opacity-55">
                          {b.status === "completed" ? "final" : "starting"}
                        </p>
                      </td>
                      <td><StatusBadge status={b.status} /></td>
                      <td><PaymentBadge status={b.paymentStatus} /></td>
                      <td>{actions(b)}</td>
                    </tr>
                    {detailPanel(b)}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {filtered.map((b) => (
              <div key={b._id} className="card-surface p-4">
                <div className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.serviceImage} alt="" className="w-14 h-14 rounded-xl object-cover bg-base-200 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm leading-tight">{b.serviceTitle}</p>
                    <p className="text-xs opacity-60 mt-0.5">{b.technicianName}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <StatusBadge status={b.status} />
                      <PaymentBadge status={b.paymentStatus} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mt-3 pt-3 border-t border-base-300">
                  <p><span className="opacity-60">Date:</span> <b>{formatDate(b.preferredDate)}</b></p>
                  <p>
                    <span className="opacity-60">Amount:</span>{" "}
                    <b>{money(b.status === "completed" ? b.finalAmount : b.basePrice)}</b>
                  </p>
                </div>
                <div className="mt-3">{actions(b)}</div>
                {expanded === b._id && (
                  <div className="mt-4 pt-4 border-t border-base-300">
                    <Timeline booking={b} />
                    <p className="text-xs mt-3 bg-base-200 rounded-lg p-2.5">
                      <b>Problem:</b> {b.problemDescription}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancel this booking?"
        message={`“${cancelTarget?.serviceTitle}” will be marked as cancelled. This cannot be undone, but you can send a new request later.`}
        confirmLabel="Yes, cancel it"
        danger
        loading={busyId === cancelTarget?._id}
        onConfirm={doCancel}
        onCancel={() => setCancelTarget(null)}
      />

      <RateModal
        booking={rateTarget}
        onClose={() => setRateTarget(null)}
        onDone={async () => {
          setRateTarget(null);
          await load();
        }}
      />
    </div>
  );
}

function RateModal({
  booking,
  onClose,
  onDone,
}: {
  booking: Booking | null;
  onClose: () => void;
  onDone: () => void | Promise<void>;
}) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [busy, setBusy] = useState(false);

  if (!booking) return null;

  const submit = async () => {
    setBusy(true);
    try {
      await apiFetch(`/bookings/${booking._id}/review`, {
        method: "POST",
        body: { rating, review },
      });
      toast.success("Thanks for rating this job!");
      await onDone();
    } catch (err) {
      toast.error(errMsg(err, "Could not submit your rating"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true">
      <div className="modal-box card-surface border border-base-300 rounded-2xl w-11/12 max-w-md">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-heading text-lg font-extrabold">Rate this repair</h3>
            <p className="text-xs opacity-70 mt-1">{booking.serviceTitle} · {booking.technicianName}</p>
          </div>
          <button type="button" className="btn btn-ghost btn-circle btn-sm" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>

        <div className="flex justify-center gap-2 my-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} stars`}
              className="btn btn-ghost btn-circle px-1"
            >
              <Star
                size={30}
                className={cn("transition", n <= rating ? "fill-secondary text-secondary" : "opacity-30")}
              />
            </button>
          ))}
        </div>

        <textarea
          rows={3}
          className="textarea textarea-bordered w-full rounded-xl"
          placeholder="How was the service? (optional)"
          value={review}
          maxLength={500}
          onChange={(e) => setReview(e.target.value)}
        />

        <div className="modal-action mt-5">
          <button type="button" className="btn btn-ghost rounded-xl" onClick={onClose}>
            Later
          </button>
          <button type="button" className="btn btn-primary rounded-xl" onClick={submit} disabled={busy}>
            {busy && <span className="loading loading-spinner loading-sm" />}
            Submit rating
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
