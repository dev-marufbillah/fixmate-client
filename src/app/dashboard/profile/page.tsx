"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Save, Loader2 } from "lucide-react";
import { apiFetch, uploadImage, ApiFailure } from "@/lib/api";
import { useSessionUser } from "@/hooks/use-session-user";
import { Avatar } from "@/components/ui/Avatar";
import { ROLE_META } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, isPending, refetch } = useSessionUser();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setArea(user.area || "");
      setBio(user.bio || "");
      setImage(user.image || null);
    }
  }, [user]);

  const pickPhoto = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file");
    if (file.size > 4 * 1024 * 1024) return toast.error("Image must be smaller than 4MB");
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      setImage(url);
      toast.success("Photo uploaded — save to apply");
    } catch (err) {
      toast.error(err instanceof ApiFailure ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return toast.error("Name must be at least 2 characters");
    setBusy(true);
    try {
      await apiFetch("/users/profile", {
        method: "PATCH",
        body: { name: name.trim(), phone, area, bio, image },
      });
      await refetch();
      toast.success("Profile updated — navbar reflects the changes instantly");
    } catch (err) {
      toast.error(err instanceof ApiFailure ? err.message : "Could not update profile");
    } finally {
      setBusy(false);
    }
  };

  if (isPending || !user) {
    return (
      <div className="p-6 lg:p-8">
        <div className="skeleton-shimmer h-8 w-56 mb-6" />
        <div className="card-surface p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-11 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const roleBadge = ROLE_META[user.role || "customer"];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-extrabold">Update Profile</h1>
        <p className="text-sm opacity-70 mt-1">
          Your changes appear in the navbar and top bar immediately — no re-login needed.
        </p>
      </div>

      <form onSubmit={save} className="space-y-6">
        <div className="card-surface p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <Avatar src={image} name={name} size="lg" />
            {uploading && (
              <span className="absolute inset-0 rounded-full bg-black/40 grid place-items-center">
                <Loader2 size={22} className="animate-spin text-white" />
              </span>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 btn btn-circle btn-primary btn-xs w-8 h-8"
              aria-label="Change photo"
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => pickPhoto(e.target.files?.[0])}
            />
          </div>
          <div className="text-center sm:text-left">
            <p className="font-heading font-bold text-lg">{name || "Your name"}</p>
            <p className="text-sm opacity-70">{user.email}</p>
            <span className={cn("badge mt-2", roleBadge.className)}>{roleBadge.label}</span>
          </div>
        </div>

        <div className="card-surface p-6 space-y-5">
          <h2 className="font-heading font-bold">Personal details</h2>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="label-text text-xs font-semibold mb-1.5 block">Full name *</label>
              <input
                className="input input-bordered rounded-xl w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label-text text-xs font-semibold mb-1.5 block">Phone</label>
              <input
                className="input input-bordered rounded-xl w-full"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label-text text-xs font-semibold mb-1.5 block">Area / City</label>
            <input
              className="input input-bordered rounded-xl w-full"
              placeholder='e.g. "Mirpur, Dhaka"'
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label-text text-xs font-semibold">Bio</label>
              <span className="text-[11px] opacity-60">{bio.length}/600</span>
            </div>
            <textarea
              rows={4}
              className="textarea textarea-bordered w-full rounded-xl leading-relaxed"
              placeholder="Short intro — skills, experience, specializations (great for technicians)…"
              value={bio}
              maxLength={600}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </div>

        <div className="card-surface p-6 space-y-5">
          <h2 className="font-heading font-bold">Account info</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="label-text text-xs font-semibold mb-1.5 block">Email (read-only)</label>
              <input className="input input-bordered rounded-xl w-full bg-base-200" value={user.email} readOnly />
            </div>
            <div>
              <label className="label-text text-xs font-semibold mb-1.5 block">Role (read-only)</label>
              <input
                className="input input-bordered rounded-xl w-full bg-base-200"
                value={(user.role || "customer").toUpperCase()}
                readOnly
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={busy || uploading} className="btn btn-primary rounded-xl gap-2 px-8 h-11">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}
