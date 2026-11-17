"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Send, Loader, CheckCircle2, ArrowRight, CalendarClock } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { StatsCard } from "@/components/ui/StatsCard";
import { StatusPie } from "@/components/dashboard/Charts";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, money } from "@/lib/utils";
import { Booking, StatusCount } from "@/lib/types";
import { useSessionUser } from "@/hooks/use-session-user";

interface Stats {
  total: number;
  active: number;
  completed: number;
  byStatus: StatusCount[];
}

export default function CustomerOverviewPage() {
  const { user } = useSessionUser();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      try {
        const [s, b] = await Promise.all([
          apiFetch<Stats>("/bookings/customer/stats"),
          apiFetch<{ bookings: Booking[] }>("/bookings/my"),
        ]);
        if (!alive) return;
        setStats(s);
        setRecent((b.bookings || []).slice(0, 4));
      } catch {
        /* toast handled globally by apiFetch errors upstream */
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-24 rounded-2xl" />
          ))}
        </div>
        <div className="skeleton-shimmer h-72 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-extrabold">
            Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="text-sm opacity-70 mt-1">Here&rsquo;s the state of your repair requests.</p>
        </div>
        <Link href="/services" className="btn btn-primary rounded-xl gap-2 h-11">
          Book a repair <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Total Requests" value={stats?.total ?? 0} icon={<Send size={22} />} />
        <StatsCard
          label="Active Jobs"
          value={stats?.active ?? 0}
          icon={<Loader size={22} />}
          accent="from-warning/15 to-warning/5 text-warning"
        />
        <StatsCard
          label="Completed Jobs"
          value={stats?.completed ?? 0}
          icon={<CheckCircle2 size={22} />}
          accent="from-success/15 to-success/5 text-success"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <StatusPie data={stats?.byStatus || []} title="Jobs by status" />
        </div>

        <div className="lg:col-span-3 card-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-sm">Recent activity</h3>
            <Link href="/dashboard/customer/bookings" className="text-xs font-semibold text-primary gap-1 inline-flex items-center">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          {recent.length === 0 ? (
            <EmptyState
              icon={<CalendarClock size={28} />}
              title="No repair requests yet"
              description="Browse approved services and send your first request — it only takes a minute."
              actionLabel="Browse services"
              actionHref="/services"
            />
          ) : (
            <ul className="divide-y divide-base-300">
              {recent.map((b) => (
                <li key={b._id} className="py-3.5 flex items-center gap-3.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.serviceImage}
                    alt=""
                    className="w-11 h-11 rounded-xl object-cover bg-base-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{b.serviceTitle}</p>
                    <p className="text-xs opacity-60">
                      {b.technicianName} · {formatDate(b.preferredDate)}
                    </p>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <StatusBadge status={b.status} />
                    <p className="text-xs font-bold">{money(b.finalAmount || b.basePrice)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
