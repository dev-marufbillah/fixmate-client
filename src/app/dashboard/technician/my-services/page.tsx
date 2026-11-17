"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Loader2, ImagePlus, Power } from "lucide-react";
import { apiFetch, uploadImage, ApiFailure } from "@/lib/api";
import { ApprovalBadge } from "@/components/ui/StatusBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { CATEGORIES, SERVICE_MODES } from "@/lib/constants";
import { Service } from "@/lib/types";
import { money } from "@/lib/utils";
import { useSessionUser } from "@/hooks/use-session-user";
import Link from "next/link";

const errMsg = (e: unknown, f: string) => (e instanceof ApiFailure ? e.message : f);

export default function MyServicesPage() {
  const { user } = useSessionUser();
  const [services, setServices] = useState<Service[] | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [editTarget, setEditTarget] = useState<Service | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await apiFetch<{ services: Service[] }>("/services/mine");
      setServices(data.services || []);
    } catch (err) {
      toast.error(errMsg(err, "Could not load your services"));
      setServices([]);
    }
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const toggleAvailability = async (svc: Service) => {
    setBusyId(svc._id);
    const next = !svc.isAvailable;
    setServices((list) =>
      list ? list.map((s) => (s._id === svc._id ? { ...s, isAvailable: next } : s)) : list
    );
    try {
      const { isAvailable } = await apiFetch<{ isAvailable: boolean }>(
        `/services/${svc._id}/availability`,
        { method: "PATCH", body: { isAvailable: next } }
      );
      toast.success(isAvailable ? "Service is live on public pages" : "Service hidden from public pages");
    } catch (err) {
      toast.error(errMsg(err, "Could not update availability"));
      setServices((list) =>
        list ? list.map((s) => (s._id === svc._id ? { ...s, isAvailable: svc.isAvailable } : s)) : list
      );
    } finally {
      setBusyId(null);
    }
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget._id);
    try {
      await apiFetch(`/services/${deleteTarget._id}`, { method: "DELETE" });
      toast.success("Service deleted");
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(errMsg(err, "Could not delete this service"));
    } finally {
      setBusyId(null);
    }
  };

  if (services === null) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="skeleton-shimmer h-8 w-56 mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-heading font-extrabold">My Services</h1>
          <p className="text-sm opacity-70 mt-1">
            Full control — edit (re-approval needed), toggle availability, or delete.
          </p>
        </div>
        <Link href="/dashboard/technician/add-service" className="btn btn-primary rounded-xl h-10 btn-sm gap-2">
          <Plus size={15} /> Add service
        </Link>
      </div>

      {services.length === 0 ? (
        <EmptyState
          title="No services yet"
          description="Create your first listing to start receiving repair requests from customers."
          actionLabel="Add your first service"
          actionHref="/dashboard/technician/add-service"
        />
      ) : (
        <>
          <div className="hidden md:block card-surface overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr className="text-xs uppercase tracking-wide">
                  <th>Service</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Approval</th>
                  <th>Available</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s._id} className="align-middle">
                    <td>
                      <div className="flex items-center gap-3 min-w-[220px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={s.image} alt="" className="w-11 h-11 rounded-lg object-cover bg-base-200" />
                        <div>
                          <p className="font-semibold text-sm leading-tight">{s.title}</p>
                          <p className="text-[11px] opacity-60">{s.serviceArea}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm">{s.category}</td>
                    <td className="font-bold text-sm">{money(s.basePrice)}</td>
                    <td><ApprovalBadge status={s.approvalStatus} /></td>
                    <td>
                      <label className="cursor-pointer inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="toggle toggle-primary toggle-sm"
                          checked={s.isAvailable}
                          disabled={busyId === s._id}
                          onChange={() => toggleAvailability(s)}
                          aria-label={`Toggle availability for ${s.title}`}
                        />
                        <span className="text-xs opacity-70">{s.isAvailable ? "On" : "Off"}</span>
                      </label>
                    </td>
                    <td>
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          className="btn btn-outline btn-primary btn-xs rounded-lg gap-1.5"
                          onClick={() => setEditTarget(s)}
                        >
                          <Pencil size={12} /> Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-error btn-xs rounded-lg gap-1.5"
                          onClick={() => setDeleteTarget(s)}
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {services.map((s) => (
              <div key={s._id} className="card-surface p-4">
                <div className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.image} alt="" className="w-14 h-14 rounded-xl object-cover bg-base-200 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm">{s.title}</p>
                    <p className="text-xs opacity-60 mt-0.5">
                      {s.category} · {money(s.basePrice)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <ApprovalBadge status={s.approvalStatus} />
                      <span className="badge badge-ghost badge-sm">{s.isAvailable ? "Available" : "Hidden"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-base-300">
                  <button
                    type="button"
                    className="btn btn-outline btn-primary btn-xs flex-1 rounded-lg"
                    onClick={() => setEditTarget(s)}
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-error btn-xs flex-1 rounded-lg"
                    onClick={() => setDeleteTarget(s)}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs rounded-lg"
                    disabled={busyId === s._id}
                    onClick={() => toggleAvailability(s)}
                    aria-label="Toggle availability"
                  >
                    <Power size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this service?"
        message={`“${deleteTarget?.title}” will be permanently removed. Existing bookings keep their copied data, but no new requests can be sent.`}
        confirmLabel="Delete"
        danger
        loading={busyId === deleteTarget?._id}
        onConfirm={doDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <EditServiceModal
        service={editTarget}
        onClose={() => setEditTarget(null)}
        onSaved={async () => {
          setEditTarget(null);
          await load();
        }}
      />
    </div>
  );
}

function EditServiceModal({
  service,
  onClose,
  onSaved,
}: {
  service: Service | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const [form, setForm] = useState({
    title: "",
    category: CATEGORIES[0] as string,
    description: "",
    basePrice: "",
    estimatedDuration: "",
    serviceMode: SERVICE_MODES[0] as string,
    serviceArea: "",
    image: "",
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (service) {
      setForm({
        title: service.title,
        category: service.category,
        description: service.description,
        basePrice: String(service.basePrice),
        estimatedDuration: service.estimatedDuration,
        serviceMode: service.serviceMode,
        serviceArea: service.serviceArea,
        image: service.image,
      });
    }
  }, [service]);

  if (!service) return null;

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const pickImage = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      set("image", url);
      toast.success("New image uploaded");
    } catch (err) {
      toast.error(errMsg(err, "Upload failed"));
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (form.title.trim().length < 4 || Number(form.basePrice) <= 0 || !form.image) {
      return toast.error("Please fill all required fields correctly");
    }
    setBusy(true);
    try {
      await apiFetch(`/services/${service._id}`, {
        method: "PATCH",
        body: { ...form, basePrice: Number(form.basePrice) },
      });
      toast.success("Service updated — sent back for admin approval");
      await onSaved();
    } catch (err) {
      toast.error(errMsg(err, "Could not update the service"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true">
      <div className="modal-box card-surface border border-base-300 rounded-2xl w-11/12 max-w-2xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-heading text-lg font-extrabold">Edit service</h3>
            <p className="text-xs text-warning mt-1">
              Saving resets approval status to <b>Pending</b> — an admin must approve it again.
            </p>
          </div>
          <button type="button" className="btn btn-ghost btn-circle btn-sm" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text text-xs font-semibold mb-1.5 block">Title</label>
              <input className="input input-bordered rounded-xl w-full" value={form.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div>
              <label className="label-text text-xs font-semibold mb-1.5 block">Category</label>
              <select className="select select-bordered rounded-xl w-full" value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label-text text-xs font-semibold mb-1.5 block">Description</label>
            <textarea rows={4} className="textarea textarea-bordered w-full rounded-xl" value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text text-xs font-semibold mb-1.5 block">Base price (USD)</label>
              <input type="number" min="1" step="0.01" className="input input-bordered rounded-xl w-full" value={form.basePrice} onChange={(e) => set("basePrice", e.target.value)} />
            </div>
            <div>
              <label className="label-text text-xs font-semibold mb-1.5 block">Estimated duration</label>
              <input className="input input-bordered rounded-xl w-full" value={form.estimatedDuration} onChange={(e) => set("estimatedDuration", e.target.value)} />
            </div>
            <div>
              <label className="label-text text-xs font-semibold mb-1.5 block">Service mode</label>
              <select className="select select-bordered rounded-xl w-full" value={form.serviceMode} onChange={(e) => set("serviceMode", e.target.value)}>
                {SERVICE_MODES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text text-xs font-semibold mb-1.5 block">Service area</label>
              <input className="input input-bordered rounded-xl w-full" value={form.serviceArea} onChange={(e) => set("serviceArea", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label-text text-xs font-semibold mb-1.5 block">Banner image</label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-xl border border-dashed border-base-300 overflow-hidden hover:border-primary/50 transition"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.image} alt="Preview" className="w-full h-40 object-cover" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickImage(e.target.files?.[0])} />
            {uploading && <p className="text-xs mt-1.5 text-primary">Uploading…</p>}
          </div>
        </div>

        <div className="modal-action mt-5">
          <button type="button" className="btn btn-ghost rounded-xl" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary rounded-xl gap-2" onClick={save} disabled={busy || uploading}>
            {busy && <Loader2 size={15} className="animate-spin" />}
            Save changes
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
