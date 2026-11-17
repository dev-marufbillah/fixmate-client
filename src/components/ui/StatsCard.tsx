"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CountUp } from "./CountUp";

export function StatsCard({
  label,
  value,
  icon,
  accent = "from-primary/15 to-primary/5 text-primary",
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  accent?: string;
}) {
  return (
    <div className="card-surface p-5 flex items-center gap-4 hover-lift">
      <span
        className={cn(
          "w-12 h-12 rounded-xl grid place-items-center bg-gradient-to-br shrink-0",
          accent
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-heading font-extrabold leading-none">
          {typeof value === "number" ? <CountUp to={value} /> : value}
        </p>
        <p className="text-xs font-medium opacity-65 mt-1.5 truncate">{label}</p>
      </div>
    </div>
  );
}
