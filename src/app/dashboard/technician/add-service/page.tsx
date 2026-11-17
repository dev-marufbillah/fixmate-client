"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImagePlus, Loader2, ShieldCheck } from "lucide-react";
import { apiFetch, uploadImage, ApiFailure } from "@/lib/api";
import { useSessionUser } from "@/hooks/use-session-user";
import { CATEGORIES, SERVICE_MODES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function AddServicePage() {
  const router = useRouter();
  const { user } = useSessionUser();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    category: CATEGORIES[0] as string,
    description: "",
    basePrice: "",
    estimatedDuration: "",
    serviceMode: SERVICE_MODES[0] as string,
    serviceArea: "",
  });
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState(false);

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const errors: Record<keyof typeof form | "image", string> = {
    title: form.title.trim().length < 4 ? "Title must be at least 4 characters" : "",
    category: "",
    serviceMode: "",
    description: form.description.trim().length < 20 ? "Describe the service in at least 20 characters" : "",
    basePrice:
      !form.basePrice || Number(form.basePrice) <= 0 ? "Enter a positive starting price (USD)" : "",
    estimatedDuration: !form.estimatedDuration.trim() ? "e.g. 2-3 hours, 1 day" : "",
    serviceArea: form.serviceArea.trim().length < 3 ? "Which area do you cover?" : "",
    image: !image ? "Upload a service image (stored on ImgBB)" : "",
  };
  const formValid = Object.values(errors).every((e) => !e);

  const pickImage = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file");
    if (file.size > 4 * 1024 * 1024) return toast.error("Image must be smaller than 4MB");
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      setImage(url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof ApiFailure ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!formValid || busy) return;
    setBusy(true);
    try {
      await apiFetch("/services", {
        method: "POST",
        body: { ...form, basePrice: Number(form.basePrice), image },
      });
      toast.success("Service submitted — waiting for admin approval");
      router.push("/dashboard/technician/my-services");
    } catch (err) {
      toast.error(err instanceof ApiFailure ? err.message : "Could not create the service");
      setBusy(false);
    }
  };

  const field = (key: keyof typeof form, label: string, node: React.ReactNode, hint?: string) => (
    <div>
      <label className="label-text text-xs font-semibold mb-1.5 block">{label}</label>
      {node}
      {touched && errors[key] && <p className="text-xs text-error mt-1.5">{errors[key]}</p>}
      {!touched && hint && <p className="text-[11px] opacity-55 mt-1">{hint}</p>}
    </div>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-extrabold">Add a Service</h1>
        <p className="text-sm opacity-70 mt-1">
          List a repair service — it goes live after an admin approves it.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <div className="card-surface p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            {field(
              "title",
              "Service title *",
              <input
                className={cn("input input-bordered rounded-xl w-full", touched && errors.title && "input-error")}
                placeholder="e.g. iPhone 14 Screen Replacement"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
              />
            )}
            <div>
              <label className="label-text text-xs font-semibold mb-1.5 block">Category *</label>
              <select
                className="select select-bordered rounded-xl w-full"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label-text text-xs font-semibold mb-1.5 block">Description *</label>
            <textarea
              rows={5}
              className={cn(
                "textarea textarea-bordered w-full rounded-xl leading-relaxed",
                touched && errors.description && "textarea-error"
              )}
              placeholder="What does this service include? Parts, warranty, process…"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
            {touched && errors.description && <p className="text-xs text-error mt-1.5">{errors.description}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {field(
              "basePrice",
              "Base price (USD) *",
              <input
                type="number"
                min="1"
                step="0.01"
                className={cn(
                  "input input-bordered rounded-xl w-full",
                  touched && errors.basePrice && "input-error"
                )}
                placeholder="e.g. 25"
                value={form.basePrice}
                onChange={(e) => set("basePrice", e.target.value)}
              />,
              "Starting price shown on your card"
            )}
            {field(
              "estimatedDuration",
              "Estimated duration *",
              <input
                className={cn(
                  "input input-bordered rounded-xl w-full",
                  touched && errors.estimatedDuration && "input-error"
                )}
                placeholder="e.g. 2-3 hours / 1 day"
                value={form.estimatedDuration}
                onChange={(e) => set("estimatedDuration", e.target.value)}
              />
            )}
            <div>
              <label className="label-text text-xs font-semibold mb-1.5 block">Service mode *</label>
              <div className="grid grid-cols-2 gap-3">
                {SERVICE_MODES.map((m) => (
                  <label
                    key={m}
                    className={cn(
                      "cursor-pointer rounded-xl border text-center py-3 text-sm font-semibold transition",
                      form.serviceMode === m
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-base-300 hover:border-primary/40"
                    )}
                  >
                    <input
                      type="radio"
                      name="serviceMode"
                      className="sr-only"
                      checked={form.serviceMode === m}
                      onChange={() => set("serviceMode", m)}
                    />
                    {m}
                  </label>
                ))}
              </div>
            </div>
            {field(
              "serviceArea",
              "Service area *",
              <input
                className={cn(
                  "input input-bordered rounded-xl w-full",
                  touched && errors.serviceArea && "input-error"
                )}
                placeholder="e.g. Dhanmondi, Dhaka"
                value={form.serviceArea}
                onChange={(e) => set("serviceArea", e.target.value)}
              />
            )}
          </div>
        </div>

        <div className="card-surface p-6">
          <label className="label-text text-xs font-semibold mb-1.5 block">Service image *</label>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={cn(
              "w-full rounded-2xl border-2 border-dashed transition grid place-items-center overflow-hidden",
              image ? "border-primary/50" : "border-base-300 hover:border-primary/50",
              touched && errors.image && !image && "border-error"
            )}
            style={{ minHeight: 200 }}
          >
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="Service preview" className="w-full h-56 object-cover" />
            ) : (
              <div className="py-10 text-center">
                {uploading ? (
                  <Loader2 size={30} className="animate-spin text-primary mx-auto" />
                ) : (
                  <ImagePlus size={30} className="opacity-50 mx-auto" />
                )}
                <p className="text-sm font-semibold mt-3">
                  {uploading ? "Uploading to ImgBB…" : "Click to upload a banner image"}
                </p>
                <p className="text-xs opacity-60 mt-1">PNG / JPG up to 4MB — stored privately via server</p>
              </div>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => pickImage(e.target.files?.[0])}
          />
          {touched && errors.image && <p className="text-xs text-error mt-1.5">{errors.image}</p>}
        </div>

        <div className="card-surface p-6 grid sm:grid-cols-2 gap-5">
          <div>
            <label className="label-text text-xs font-semibold mb-1.5 block">Technician name</label>
            <input className="input input-bordered rounded-xl w-full bg-base-200" value={user?.name || ""} readOnly />
          </div>
          <div>
            <label className="label-text text-xs font-semibold mb-1.5 block">Technician email</label>
            <input
              className="input input-bordered rounded-xl w-full bg-base-200"
              value={user?.email || ""}
              readOnly
            />
          </div>
          <p className="sm:col-span-2 text-xs inline-flex items-center gap-2 opacity-70">
            <ShieldCheck size={14} className="text-success" />
            Saved with <b>approvalStatus: pending</b> and <b>isAvailable: true</b>.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="btn btn-ghost rounded-xl"
            onClick={() => router.push("/dashboard/technician/my-services")}
          >
            Cancel
          </button>
          <button type="submit" disabled={busy || uploading} className="btn btn-primary rounded-xl px-8 h-11 gap-2">
            {busy && <Loader2 size={16} className="animate-spin" />}
            Submit for approval
          </button>
        </div>
      </form>
    </div>
  );
}
