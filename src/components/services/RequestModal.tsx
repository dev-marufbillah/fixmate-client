"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X, Send } from "lucide-react";
import { apiFetch, ApiFailure } from "@/lib/api";
import { SessionUser } from "@/lib/auth-client";
import { todayISO, cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  serviceId: string;
  user: SessionUser;
}

export function RequestModal({ open, onClose, serviceId, user }: Props) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState(todayISO());
  const [problem, setProblem] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!phone.trim()) e.phone = "Phone number is required";
    if (!address.trim()) e.address = "Address is required";
    if (!preferredDate) e.preferredDate = "Pick a preferred date";
    else if (preferredDate < todayISO()) e.preferredDate = "Date cannot be in the past";
    if (problem.trim().length < 20) e.problem = `Describe the problem in at least 20 characters (${problem.trim().length}/20)`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      await apiFetch("/bookings", {
        method: "POST",
        body: { serviceId, phone, address, preferredDate, problemDescription: problem },
      });
      toast.success("Repair request sent — track it in My Bookings");
      onClose();
      router.push("/dashboard/customer/bookings");
    } catch (err) {
      const msg = err instanceof ApiFailure ? err.message : "Could not send the request";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const fieldErr = (k: string) =>
    errors[k] ? <p className="text-xs text-error mt-1.5">{errors[k]}</p> : null;

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="modal-box card-surface border border-base-300 rounded-2xl w-11/12 max-w-lg">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 className="font-heading text-xl font-extrabold">Request a Repair</h3>
            <p className="text-xs opacity-70 mt-1">Tell the technician when and what needs fixing.</p>
          </div>
          <button type="button" className="btn btn-ghost btn-circle btn-sm" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text text-xs font-semibold mb-1.5 block">Full name</label>
              <input className="input input-bordered rounded-xl w-full bg-base-200" value={user.name} readOnly />
            </div>
            <div>
              <label className="label-text text-xs font-semibold mb-1.5 block">Email</label>
              <input className="input input-bordered rounded-xl w-full bg-base-200" value={user.email} readOnly />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text text-xs font-semibold mb-1.5 block">Phone *</label>
              <input
                className={cn("input input-bordered rounded-xl w-full", errors.phone && "input-error")}
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {fieldErr("phone")}
            </div>
            <div>
              <label className="label-text text-xs font-semibold mb-1.5 block">Preferred date *</label>
              <input
                type="date"
                min={todayISO()}
                className={cn("input input-bordered rounded-xl w-full", errors.preferredDate && "input-error")}
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
              />
              {fieldErr("preferredDate")}
            </div>
          </div>

          <div>
            <label className="label-text text-xs font-semibold mb-1.5 block">Service address *</label>
            <input
              className={cn("input input-bordered rounded-xl w-full", errors.address && "input-error")}
              placeholder="House, road, area, city"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {fieldErr("address")}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label-text text-xs font-semibold">Problem description *</label>
              <span className={cn("text-[11px]", problem.trim().length >= 20 ? "text-success" : "opacity-60")}>
                {problem.trim().length}/20 min
              </span>
            </div>
            <textarea
              rows={4}
              className={cn(
                "textarea textarea-bordered w-full rounded-xl leading-relaxed",
                errors.problem && "textarea-error"
              )}
              placeholder="e.g. Screen cracked after a fall — display flickers and touch works only on the left side…"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
            />
            {fieldErr("problem")}
          </div>
        </div>

        <div className="modal-action mt-6">
          <button type="button" className="btn btn-ghost rounded-xl" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary rounded-xl gap-2" disabled={busy}>
            {busy ? <span className="loading loading-spinner loading-sm" /> : <Send size={15} />}
            Send Request
          </button>
        </div>
      </form>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
