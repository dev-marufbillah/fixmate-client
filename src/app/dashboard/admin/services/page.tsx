"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BadgeCheck, XCircle } from "lucide-react";
import { apiFetch, ApiFailure } from "@/lib/api";
import { ApprovalBadge } from "@/components/ui/StatusBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Service } from "@/lib/types";
import { money, formatDate, cn } from "@/lib/utils";

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

const errMsg = (e: unknown, f: string) => (e instanceof ApiFailure ? e.message : f);

export default function AdminServicesPage() {
  const [tab, setTab] = useState("pending");
  const [services, setServices] = useState<Service[] | null>(null);
  const [target, setTarget] = useState<{ service: Service; status: "approved" | "rejected" } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try {
      const qs = tab === "all" ? "" : `?status=${tab}`;
      const data = await apiFetch<{ services: Service[] }>(`/admin/services${qs}`);
      setServices(data.services || []);
    } catch (err) {
      toast.error(errMsg(err, "Could not load services"));
      setServices([]);
    }
  };

  useEffect(() => {
    setServices(null);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const apply = async () => {
    if (!target) return;
    setBusyId(target.service._id);
    try {
      await apiFetch(`/admin/services/${target.service._id}/approval`, {
        method: "PATCH",
        body: { status: target.status },
      });
      toast.success(`Service ${target.status}`);
      setTarget(null);
      await load();
    } catch (err) {
      toast.error(errMsg(err, "Could not update approval"));
    } finally {
      setBusyId(null);
    }
  };

  const decide = (service: Service, status: "approved" | "rejected") => setTarget({ service, status });

  if (services === null) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="skeleton-shimmer h-8 w-64 mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-5">
        <h1 className="text-2xl font-heading font-extrabold">Service Approval</h1>
        <p className="text-sm opacity-70 mt-1">
          Only approved &amp; available services appear on public pages. Editing a service resets it to
          pending.
        </p>
      </div>

      <div className="flex gap-2 mb-5">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "btn btn-sm rounded-lg",
              tab === t.key ? "btn-primary" : "btn-ghost border border-base-300"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon={<BadgeCheck size={28} />}
          title={`No ${tab === "all" ? "" : tab} services`}
          description="Services submitted by technicians will appear here for moderation."
        />
      ) : (
        <div className="space-y-4">
          {services.map((s) => (
            <div
              key={s._id}
              className={cn(
                "card-surface p-4 md:p-5",
                s.approvalStatus === "pending" && "border-l-4 border-l-warning"
              )}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-center gap-3.5 min-w-0 lg:w-[300px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.image} alt="" className="w-14 h-14 rounded-xl object-cover bg-base-200 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-sm leading-tight">{s.title}</p>
                    <p className="text-xs opacity-60 mt-0.5">
                      {s.technicianName} · {s.category}
                    </p>
                    <div className="flex gap-1.5 mt-1.5">
                      <ApprovalBadge status={s.approvalStatus} />
                      <span className={cn("badge badge-sm", s.isAvailable ? "badge-soft badge-success" : "badge-ghost")}>
                        {s.isAvailable ? "Available" : "Hidden"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs flex-1">
                  <div>
                    <p className="opacity-55 uppercase font-semibold text-[10px]">Price</p>
                    <p className="font-bold mt-0.5">{money(s.basePrice)}</p>
                  </div>
                  <div>
                    <p className="opacity-55 uppercase font-semibold text-[10px]">Mode / Area</p>
                    <p className="mt-0.5">
                      {s.serviceMode} · {s.serviceArea}
                    </p>
                  </div>
                  <div>
                    <p className="opacity-55 uppercase font-semibold text-[10px]">Submitted</p>
                    <p className="mt-0.5">{formatDate(s.createdAt)}</p>
                  </div>
                </div>

                <div className="flex gap-2 lg:justify-end shrink-0">
                  {s.approvalStatus !== "approved" && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm rounded-lg gap-1.5"
                      onClick={() => decide(s, "approved")}
                    >
                      <BadgeCheck size={15} /> Approve
                    </button>
                  )}
                  {s.approvalStatus !== "rejected" && (
                    <button
                      type="button"
                      className="btn btn-outline btn-error btn-sm rounded-lg gap-1.5"
                      onClick={() => decide(s, "rejected")}
                    >
                      <XCircle size={15} /> Reject
                    </button>
                  )}
                </div>
              </div>
              <details className="mt-3 pt-3 border-t border-base-300">
                <summary className="text-xs font-semibold cursor-pointer opacity-70 hover:opacity-100">
                  Description
                </summary>
                <p className="text-sm opacity-80 mt-2 leading-relaxed">{s.description}</p>
              </details>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!target}
        title={target?.status === "approved" ? "Approve this service?" : "Reject this service?"}
        confirmLabel={target?.status === "approved" ? "Approve" : "Reject"}
        danger={target?.status === "rejected"}
        message={
          !target
            ? ""
            : target.status === "approved"
              ? `“${target.service.title}” will become visible on public pages immediately.`
              : `“${target.service.title}” will stay hidden from customers. The technician can edit and resubmit it.`
        }
        loading={busyId === target?.service._id}
        onConfirm={apply}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
