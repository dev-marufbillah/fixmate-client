"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Wallet, Download, ReceiptText } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeletons";
import { StatsCard } from "@/components/ui/StatsCard";
import { downloadInvoice } from "@/lib/invoice";
import { Payment } from "@/lib/types";
import { formatDate, money } from "@/lib/utils";
import { useSessionUser } from "@/hooks/use-session-user";

export default function CustomerPaymentsPage() {
  const { user } = useSessionUser();
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      try {
        const data = await apiFetch<{ payments: Payment[]; totalSpent: number }>("/payments/my");
        if (!alive) return;
        setPayments(data.payments || []);
        setTotalSpent(data.totalSpent || 0);
      } catch (err) {
        if (alive) {
          toast.error(err instanceof Error ? err.message : "Could not load payments");
          setPayments([]);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  if (payments === null) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-5">
        <div className="skeleton-shimmer h-24 rounded-2xl" />
        <TableSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-extrabold">Payment History</h1>
        <p className="text-sm opacity-70 mt-1">
          Every completed job you paid for, with transaction IDs and downloadable invoices.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        <StatsCard
          label="Total spent"
          value={money(totalSpent)}
          icon={<Wallet size={22} />}
          accent="from-success/15 to-success/5 text-success"
        />
        <StatsCard label="Payments made" value={payments.length} icon={<ReceiptText size={22} />} />
      </div>

      {payments.length === 0 ? (
        <EmptyState
          icon={<Wallet size={28} />}
          title="No payments yet"
          description="When you pay for a completed repair, the receipt and transaction ID will be saved here."
          actionLabel="Go to My Bookings"
          actionHref="/dashboard/customer/bookings"
        />
      ) : (
        <>
          <div className="hidden md:block card-surface overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr className="text-xs uppercase tracking-wide">
                  <th>Service</th>
                  <th>Technician</th>
                  <th>Amount</th>
                  <th>Transaction ID</th>
                  <th>Date</th>
                  <th className="text-right">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td className="font-semibold text-sm">{p.serviceTitle}</td>
                    <td className="text-sm">{p.technicianName}</td>
                    <td className="font-bold text-success text-sm">{money(p.amount)}</td>
                    <td className="font-mono text-[11px] max-w-[180px] truncate" title={p.transactionId}>
                      {p.transactionId}
                    </td>
                    <td className="text-sm">{formatDate(p.paidAt)}</td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="btn btn-outline btn-primary btn-xs rounded-lg gap-1.5"
                        onClick={() => downloadInvoice(p)}
                      >
                        <Download size={12} /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {payments.map((p) => (
              <div key={p._id} className="card-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-sm">{p.serviceTitle}</p>
                    <p className="text-xs opacity-65 mt-0.5">{p.technicianName}</p>
                  </div>
                  <p className="font-heading font-extrabold text-success">{money(p.amount)}</p>
                </div>
                <p className="font-mono text-[10px] opacity-60 mt-2 break-all">{p.transactionId}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-base-300">
                  <span className="text-xs opacity-70">{formatDate(p.paidAt)}</span>
                  <button
                    type="button"
                    className="btn btn-outline btn-primary btn-xs rounded-lg gap-1.5"
                    onClick={() => downloadInvoice(p)}
                  >
                    <Download size={12} /> Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-6 text-center text-xs opacity-60">
        Need a copy for your records?{" "}
        <Link href="/dashboard/customer/bookings" className="text-primary font-semibold">
          Visit My Bookings
        </Link>
      </div>
    </div>
  );
}
