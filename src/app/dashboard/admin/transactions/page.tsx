"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Banknote, ReceiptText } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { StatsCard } from "@/components/ui/StatsCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeletons";
import { Payment } from "@/lib/types";
import { formatDate, money } from "@/lib/utils";

export default function AdminTransactionsPage() {
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await apiFetch<{ payments: Payment[]; totalRevenue: number; totalTransactions: number }>(
          "/admin/payments"
        );
        if (!alive) return;
        setPayments(data.payments || []);
        setTotalRevenue(data.totalRevenue || 0);
      } catch (err) {
        if (alive) {
          toast.error(err instanceof Error ? err.message : "Could not load transactions");
          setPayments([]);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (payments === null) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-5">
        <div className="skeleton-shimmer h-24 rounded-2xl" />
        <TableSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-extrabold">Transactions</h1>
        <p className="text-sm opacity-70 mt-1">Stripe income recorded through verified payments.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatsCard
          label="Total revenue"
          value={money(totalRevenue)}
          icon={<Banknote size={22} />}
          accent="from-success/15 to-success/5 text-success"
        />
        <StatsCard label="Transactions" value={payments.length} icon={<ReceiptText size={22} />} />
        <StatsCard
          label="Average payment"
          value={money(payments.length ? totalRevenue / payments.length : 0)}
          icon={<ReceiptText size={22} />}
          accent="from-accent/15 to-accent/5 text-accent"
        />
      </div>

      {payments.length === 0 ? (
        <EmptyState
          icon={<Banknote size={28} />}
          title="No transactions yet"
          description="Completed jobs paid by customers will be recorded here automatically."
        />
      ) : (
        <>
          <div className="hidden md:block card-surface overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr className="text-xs uppercase tracking-wide">
                  <th>Customer</th>
                  <th>Technician</th>
                  <th>Service</th>
                  <th>Amount</th>
                  <th>Transaction ID</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td className="text-sm font-semibold">{p.customerName}</td>
                    <td className="text-sm">{p.technicianName}</td>
                    <td className="text-sm max-w-[180px] truncate">{p.serviceTitle}</td>
                    <td className="font-bold text-success text-sm">{money(p.amount)}</td>
                    <td className="font-mono text-[11px] max-w-[170px] truncate" title={p.transactionId}>
                      {p.transactionId}
                    </td>
                    <td className="text-sm">{formatDate(p.paidAt)}</td>
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
                    <p className="text-xs opacity-65 mt-0.5">
                      {p.customerName} → {p.technicianName}
                    </p>
                  </div>
                  <p className="font-heading font-extrabold text-success">{money(p.amount)}</p>
                </div>
                <p className="font-mono text-[10px] opacity-60 mt-2 break-all">{p.transactionId}</p>
                <p className="text-xs opacity-70 mt-1">{formatDate(p.paidAt)}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
