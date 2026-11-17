"use client";

import { Booking } from "@/lib/types";
import { formatDateTime, cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STEPS = [
  { key: "requested", label: "Requested" },
  { key: "accepted", label: "Accepted" },
  { key: "in-progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "paid", label: "Paid" },
];

/** Visual job tracker (optional feature #3) built from booking.statusHistory. */
export function Timeline({ booking }: { booking: Booking }) {
  const history = booking.statusHistory || [];
  const isPaid = booking.paymentStatus === "paid";
  const terminal = booking.status === "cancelled" || booking.status === "rejected";

  const reached = (key: string) => {
    if (key === "paid") return isPaid;
    return history.some((h) => h.status === key);
  };

  const timeOf = (key: string) => {
    if (key === "paid" && isPaid) {
      const paid = [...history].reverse().find((h) => h.status === "paid");
      return paid?.changedAt;
    }
    const events = history.filter((h) => h.status === key);
    return events.length ? events[events.length - 1].changedAt : undefined;
  };

  const reachedCount = STEPS.filter((s) => reached(s.key)).length;

  return (
    <div className="pt-1">
      {terminal && (
        <div
          className={cn(
            "alert alert-soft rounded-xl mb-4 text-xs py-2.5",
            booking.status === "cancelled" ? "bg-base-300" : "bg-error/10 text-error"
          )}
        >
          This job was {booking.status} — the pipeline stopped at step {Math.max(reachedCount, 1)}.
        </div>
      )}

      <ol className="flex flex-col md:flex-row md:items-start gap-0 md:gap-0">
        {STEPS.map((step, i) => {
          const done = reached(step.key);
          const isLast = i === STEPS.length - 1;
          const time = timeOf(step.key);
          return (
            <li key={step.key} className="flex md:flex-col md:flex-1 gap-3 md:gap-0">
              <div className="flex md:flex-col items-center">
                <span
                  className={cn(
                    "w-7 h-7 rounded-full grid place-items-center text-[11px] font-bold shrink-0 border-2 transition",
                    done
                      ? "bg-success border-success text-white"
                      : terminal
                        ? "bg-base-200 border-base-300 opacity-50"
                        : "bg-base-100 border-base-300 opacity-60"
                  )}
                >
                  {done ? <Check size={13} strokeWidth={3} /> : i + 1}
                </span>
                {!isLast && (
                  <span
                    className={cn(
                      "hidden md:block flex-1 h-0.5 mt-3.5 mx-1",
                      done && reached(STEPS[i + 1].key) ? "bg-success" : "bg-base-300"
                    )}
                  />
                )}
                {!isLast && <span className={cn("md:hidden w-0.5 h-8 ml-3.5", done ? "bg-success" : "bg-base-300")} />}
              </div>
              <div className="md:pt-0 md:px-2 md:flex-1 md:text-center pb-5 md:pb-0 -mt-0.5">
                <p className={cn("text-xs font-bold", done ? "" : "opacity-55")}>{step.label}</p>
                <p className="text-[10px] opacity-60 mt-0.5">{time ? formatDateTime(time) : done ? "—" : "pending"}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
