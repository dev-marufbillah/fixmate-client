"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Users } from "lucide-react";
import { apiFetch, ApiFailure } from "@/lib/api";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { ROLE_META } from "@/lib/constants";
import { AdminUser, Role } from "@/lib/types";
import { formatDate, cn } from "@/lib/utils";
import { useSessionUser } from "@/hooks/use-session-user";

const errMsg = (e: unknown, f: string) => (e instanceof ApiFailure ? e.message : f);

export default function AdminUsersPage() {
  const { user: me } = useSessionUser();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [query, setQuery] = useState("");
  const [changeTarget, setChangeTarget] = useState<{ user: AdminUser; role: Role } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const data = await apiFetch<{ users: AdminUser[] }>("/admin/users");
      setUsers(data.users || []);
    } catch (err) {
      toast.error(errMsg(err, "Could not load users"));
      setUsers([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  }, [users, query]);

  const applyRole = async () => {
    if (!changeTarget) return;
    setBusy(true);
    try {
      await apiFetch(`/admin/users/${changeTarget.user._id}/role`, {
        method: "PATCH",
        body: { role: changeTarget.role },
      });
      toast.success(`${changeTarget.user.name} is now a ${changeTarget.role}`);
      setChangeTarget(null);
      await load();
    } catch (err) {
      toast.error(errMsg(err, "Could not change the role"));
    } finally {
      setBusy(false);
    }
  };

  if (users === null) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="skeleton-shimmer h-8 w-56 mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-16 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-heading font-extrabold">Manage Users</h1>
          <p className="text-sm opacity-70 mt-1">{users.length} registered accounts on FixMate.</p>
        </div>
        <label className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            className="input input-bordered rounded-xl w-full pl-10 h-10"
            placeholder="Search name or email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users size={28} />}
          title="No users found"
          description={query ? `Nothing matches “${query}”.` : "No accounts exist yet."}
        />
      ) : (
        <>
          <div className="hidden md:block card-surface overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr className="text-xs uppercase tracking-wide">
                  <th>User</th>
                  <th>Role</th>
                  <th>Area</th>
                  <th>Joined</th>
                  <th className="text-right">Change role</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const isSelf = me?.email === u.email;
                  const badge = ROLE_META[u.role] || ROLE_META.customer;
                  return (
                    <tr key={u._id} className="align-middle">
                      <td>
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <Avatar src={u.image} name={u.name} size="sm" />
                          <div>
                            <p className="font-semibold text-sm leading-tight">
                              {u.name} {isSelf && <span className="text-[10px] opacity-50">(you)</span>}
                            </p>
                            <p className="text-[11px] opacity-60">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={cn("badge badge-sm", badge.className)}>{badge.label}</span>
                      </td>
                      <td className="text-sm">{u.area || "—"}</td>
                      <td className="text-sm">{formatDate(u.createdAt)}</td>
                      <td>
                        <div className="flex justify-end">
                          <select
                            className="select select-bordered select-sm rounded-lg w-36"
                            value={u.role}
                            disabled={isSelf}
                            title={isSelf ? "You cannot change your own role" : "Select new role"}
                            onChange={(e) =>
                              setChangeTarget({ user: u, role: e.target.value as Role })
                            }
                          >
                            <option value="customer">customer</option>
                            <option value="technician">technician</option>
                            <option value="admin">admin</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {filtered.map((u) => {
              const isSelf = me?.email === u.email;
              const badge = ROLE_META[u.role] || ROLE_META.customer;
              return (
                <div key={u._id} className="card-surface p-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={u.image} name={u.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm truncate">{u.name}</p>
                      <p className="text-xs opacity-60 truncate">{u.email}</p>
                    </div>
                    <span className={cn("badge badge-sm", badge.className)}>{badge.label}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-base-300">
                    <span className="text-xs opacity-65">Joined {formatDate(u.createdAt)}</span>
                    <select
                      className="select select-bordered select-sm rounded-lg w-32"
                      value={u.role}
                      disabled={isSelf}
                      onChange={(e) => setChangeTarget({ user: u, role: e.target.value as Role })}
                    >
                      <option value="customer">customer</option>
                      <option value="technician">technician</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!changeTarget}
        title="Change this user's role?"
        message={`Set ${changeTarget?.user.name} (${changeTarget?.user.email}) as “${changeTarget?.role}”? They will see the matching dashboard after their next page load.`}
        confirmLabel="Change role"
        loading={busy}
        onConfirm={applyRole}
        onCancel={() => {
          setChangeTarget(null);
          load();
        }}
      />
    </div>
  );
}
