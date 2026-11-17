"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle2, ArrowRight, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, ApiFailure } from "@/lib/api";
import { money } from "@/lib/utils";
import { useSessionUser } from "@/hooks/use-session-user";

interface VerifyResult {
  amount: number;
  transactionId: string;
  bookingId: string;
  serviceTitle: string;
  currency: string;
}

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const { user, isPending } = useSessionUser();
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isPending) return;
    if (!user || user.role !== "customer") {
      setLoading(false);
      setError("Only signed-in customers can verify payments.");
      return;
    }
    if (!sessionId) {
      setLoading(false);
      setError("Missing payment session reference.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<VerifyResult>(
          `/payments/verify?session_id=${encodeURIComponent(sessionId)}`
        );
        if (!cancelled) {
          setResult(data);
          toast.success("Payment recorded successfully");
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof ApiFailure ? err.message : "Could not verify this payment";
          setError(msg);
          toast.error(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, user, isPending]);

  if (isPending || loading) {
    return (
      <div className="card-surface p-10 text-center">
        <Loader2 size={36} className="animate-spin text-primary mx-auto" />
        <p className="font-heading font-bold mt-4">Confirming your payment…</p>
        <p className="text-sm opacity-70 mt-1">Please wait while we verify the transaction with Stripe.</p>
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="card-surface p-10 text-center">
        <span className="w-16 h-16 mx-auto rounded-2xl bg-error/15 text-error grid place-items-center mb-4">
          <ShieldAlert size={32} />
        </span>
        <h1 className="text-xl font-heading font-extrabold">Payment not confirmed</h1>
        <p className="text-sm opacity-70 mt-2 max-w-md mx-auto">{error}</p>
        <div className="flex flex-wrap gap-3 justify-center mt-6">
          <Link href="/dashboard/customer/bookings" className="btn btn-primary rounded-xl">
            Back to My Bookings
          </Link>
          <Link href="/services" className="btn btn-outline btn-primary rounded-xl">
            Browse Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card-surface p-8 md:p-10 text-center max-w-lg mx-auto">
      <span className="w-20 h-20 mx-auto rounded-full bg-success/15 text-success grid place-items-center mb-5">
        <CheckCircle2 size={44} />
      </span>
      <h1 className="text-2xl md:text-3xl font-heading font-extrabold">Payment successful!</h1>
      <p className="text-sm opacity-70 mt-2">
        {result?.serviceTitle ? `Payment recorded for “${result.serviceTitle}”.` : "Your payment has been recorded."}
      </p>

      <div className="mt-6 space-y-3 text-left">
        <div className="flex items-center justify-between bg-base-200 rounded-xl px-4 py-3">
          <span className="text-xs font-semibold opacity-65 uppercase tracking-wide">Amount paid</span>
          <span className="font-heading font-extrabold text-lg text-success">{money(result?.amount)}</span>
        </div>
        <div className="flex items-center justify-between bg-base-200 rounded-xl px-4 py-3 gap-4">
          <span className="text-xs font-semibold opacity-65 uppercase tracking-wide shrink-0">
            Transaction ID
          </span>
          <span className="font-mono text-xs break-all text-right">{result?.transactionId || "—"}</span>
        </div>
      </div>

      <Link
        href="/dashboard/customer/bookings"
        className="btn btn-primary rounded-xl gap-2 mt-7 inline-flex"
      >
        Back to My Bookings <ArrowRight size={16} />
      </Link>
      <p className="text-[11px] opacity-60 mt-4">
        A copy of this payment is saved in your Payment History.
      </p>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="container-px py-16 md:py-24">
      <Suspense
        fallback={
          <div className="card-surface p-10 text-center max-w-lg mx-auto">
            <Loader2 size={32} className="animate-spin text-primary mx-auto" />
            <p className="mt-4 font-bold">Loading payment status…</p>
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  );
}
