import type { Metadata } from "next";
import Link from "next/link";
import { XCircle, RotateCcw, ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Payment Cancelled" };

export default function PaymentCancelPage() {
  return (
    <div className="container-px py-16 md:py-24">
      <div className="card-surface p-8 md:p-10 text-center max-w-lg mx-auto">
        <span className="w-20 h-20 mx-auto rounded-full bg-warning/15 text-warning grid place-items-center mb-5">
          <XCircle size={44} />
        </span>
        <h1 className="text-2xl md:text-3xl font-heading font-extrabold">Payment cancelled</h1>
        <p className="text-sm opacity-70 mt-3 max-w-md mx-auto">
          No charge was made — your checkout was cancelled safely. Your job status stays exactly as it
          was, and you can try again whenever you&rsquo;re ready.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-7">
          <Link href="/dashboard/customer/bookings" className="btn btn-primary rounded-xl gap-2">
            <RotateCcw size={16} /> Try Again
          </Link>
          <Link href="/services" className="btn btn-outline btn-primary rounded-xl gap-2">
            Browse Services <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
