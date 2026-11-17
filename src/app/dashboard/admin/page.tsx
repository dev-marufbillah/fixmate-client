"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Users, Wrench, BadgeCheck, CalendarRange, Banknote, ArrowRight } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { StatsCard } from "@/components/ui/StatsCard";
import { StatusBars } from "@/components/dashboard/Charts";
import { ApprovalBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { money, formatDate } from "@/lib/utils";
import { Service, StatusCount } from "@/lib/types";
import { useSessionUser } from "@/hooks/use-session-user";

interface AdminStats {
  totalUsers: number;
  totalTechnicians: number;
  totalBookings: number;
  pendingServices: number;
  totalRevenue: number;
  byStatus: StatusCount[];
}

export default function AdminOverviewPage() {
  const { user } = useSessionUser();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pending, setPending] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      try {
        const [s, svcs] = await Promise.all([
          apiFetch<AdminStats>("/admin/stats"),
          apiFetch<{ services: Service[] }>("/admin/services?status=pending"),
        ]);
        if (!alive) return;
        setStats(s);
        setPending((svcs.services || []).slice(0, 4));
      } catch {
        /* defaults */
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
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
          <h1 className="text-2xl font-heading font-extrabold">Admin overview</h1>
          <p className="text-sm opacity-70 mt-1">Platform health, moderation queue and revenue.</p>
        </div>
        <Link href="/dashboard/admin/services" className="btn btn-primary rounded-xl h-11 gap-2">
          Review pending services <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <StatsCard label="Total Users" value={stats?.totalUsers ?? 0} icon={<Users size={22} />} />
        <StatsCard
          label="Total Technicians"
          value={stats?.totalTechnicians ?? 0}
          icon={<Wrench size={22} />}
          accent="from-secondary/15 to-secondary/5 text-secondary"
        />
        <StatsCard
          label="Pending Services"
          value={stats?.pendingServices ?? 0}
          icon={<BadgeCheck size={22} />}
          accent="from-warning/15 to-warning/5 text-warning"
        />
        <StatsCard label="Total Bookings" value={stats?.totalBookings ?? 0} icon={<CalendarRange size={22} />} />
        <StatsCard
          label="Total Revenue"
          value={money(stats?.totalRevenue ?? 0)}
          icon={<Banknote size={22} />}
          accent="from-success/15 to-success/5 text-success"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <StatusBars data={stats?.byStatus || []} title="Bookings by status (platform-wide)" />
        </div>

        <div className="lg:col-span-2 card-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-sm">Pending approvals</h3>
            <Link href="/dashboard/admin/services" className="text-xs font-semibold text-primary inline-flex items-center gap-1">
              Open queue <ArrowRight size={13} />
            </Link>
          </div>
          {pending.length === 0 ? (
            <EmptyState
              icon={<BadgeCheck size={26} />}
              title="Approval queue is empty"
              description="Every submitted service has been reviewed. Great job!"
            />
          ) : (
            <ul className="divide-y divide-base-300">
              {pending.map((s) => (
                <li key={s._id} className="py-3.5 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-base-200" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{s.title}</p>
                    <p className="text-[11px] opacity-60">
                      {s.technicianName} · {formatDate(s.createdAt)}
                    </p>
                  </div>
                  <ApprovalBadge status={s.approvalStatus} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
