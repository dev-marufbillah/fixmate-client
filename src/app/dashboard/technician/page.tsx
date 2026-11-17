"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Wrench, BadgeCheck, Inbox, ArrowRight } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { StatsCard } from "@/components/ui/StatsCard";
import { StatusBars } from "@/components/dashboard/Charts";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { Booking, StatusCount } from "@/lib/types";
import { useSessionUser } from "@/hooks/use-session-user";

interface Stats {
  totalServices: number;
  approvedServices: number;
  pendingRequests: number;
  byStatus: StatusCount[];
}

export default function TechnicianOverviewPage() {
  const { user } = useSessionUser();
  const [stats, setStats] = useState<Stats | null>(null);
  const [requests, setRequests] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      try {
        const [s, b] = await Promise.all([
          apiFetch<Stats>("/bookings/technician/stats"),
          apiFetch<{ bookings: Booking[] }>("/bookings/technician"),
        ]);
        if (!alive) return;
        setStats(s);
        setRequests((b.bookings || []).filter((r) => r.status === "requested").slice(0, 4));
      } catch {
        /* keep defaults */
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
            Technician overview{user ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm opacity-70 mt-1">Your listings and incoming repair jobs at a glance.</p>
        </div>
        <Link href="/dashboard/technician/add-service" className="btn btn-primary rounded-xl h-11 gap-2">
          Add a service <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Total Services" value={stats?.totalServices ?? 0} icon={<Wrench size={22} />} />
        <StatsCard
          label="Approved Services"
          value={stats?.approvedServices ?? 0}
          icon={<BadgeCheck size={22} />}
          accent="from-success/15 to-success/5 text-success"
        />
        <StatsCard
          label="Pending Requests"
          value={stats?.pendingRequests ?? 0}
          icon={<Inbox size={22} />}
          accent="from-warning/15 to-warning/5 text-warning"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <StatusBars data={stats?.byStatus || []} title="Incoming jobs by status" />
        </div>

        <div className="lg:col-span-2 card-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-sm">Awaiting your action</h3>
            <Link
              href="/dashboard/technician/requests"
              className="text-xs font-semibold text-primary inline-flex items-center gap-1"
            >
              Manage <ArrowRight size={13} />
            </Link>
          </div>
          {requests.length === 0 ? (
            <EmptyState
              icon={<Inbox size={26} />}
              title="No pending requests"
              description="New customer requests will show up here for you to accept or reject."
            />
          ) : (
            <ul className="divide-y divide-base-300">
              {requests.map((r) => (
                <li key={r._id} className="py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{r.serviceTitle}</p>
                      <p className="text-xs opacity-60">
                        {r.customerName} · {formatDate(r.preferredDate)}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
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
