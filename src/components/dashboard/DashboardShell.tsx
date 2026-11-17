"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Menu,
  X,
  Home,
  LayoutDashboard,
  CalendarClock,
  CreditCard,
  Wrench,
  PlusSquare,
  ListChecks,
  Inbox,
  Users,
  BadgeCheck,
  CalendarRange,
  Banknote,
  UserPen,
  LogOut,
  ShieldAlert,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { clearToken } from "@/lib/api";
import { DASHBOARD_HOME, ROLE_META } from "@/lib/constants";
import { useSessionUser } from "@/hooks/use-session-user";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Avatar } from "@/components/ui/Avatar";
import { DashboardSkeleton } from "@/components/ui/Skeletons";
import { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MenuItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const MENU: Record<Role, MenuItem[]> = {
  customer: [
    { href: "/dashboard/customer", label: "Overview", icon: <LayoutDashboard size={18} /> },
    { href: "/dashboard/customer/bookings", label: "My Bookings", icon: <CalendarClock size={18} /> },
    { href: "/dashboard/customer/payments", label: "Payments", icon: <CreditCard size={18} /> },
  ],
  technician: [
    { href: "/dashboard/technician", label: "Overview", icon: <LayoutDashboard size={18} /> },
    { href: "/dashboard/technician/add-service", label: "Add Service", icon: <PlusSquare size={18} /> },
    { href: "/dashboard/technician/my-services", label: "My Services", icon: <Wrench size={18} /> },
    { href: "/dashboard/technician/requests", label: "Manage Requests", icon: <Inbox size={18} /> },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", icon: <LayoutDashboard size={18} /> },
    { href: "/dashboard/admin/users", label: "Manage Users", icon: <Users size={18} /> },
    { href: "/dashboard/admin/services", label: "Service Approval", icon: <BadgeCheck size={18} /> },
    { href: "/dashboard/admin/bookings", label: "All Bookings", icon: <CalendarRange size={18} /> },
    { href: "/dashboard/admin/transactions", label: "Transactions", icon: <Banknote size={18} /> },
  ],
};

const LABELS: Record<string, string> = {
  customer: "Customer Dashboard",
  technician: "Technician Dashboard",
  admin: "Admin Dashboard",
  profile: "Update Profile",
};

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isPending, refetch } = useSessionUser();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const segment = pathname.split("/")[2] || "";
  const expected = ["customer", "technician", "admin"].includes(segment)
    ? (segment as Role)
    : null;
  const forbidden = !!expected && !!user && user.role !== expected;

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Redirect ONLY after the session is resolved — never on reload.
  useEffect(() => {
    if (isPending) return;
    if (!user) {
      router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isPending, user, router, pathname]);

  const menu = useMemo(() => (user?.role ? MENU[user.role] || [] : []), [user]);

  const signOut = async () => {
    try {
      await authClient.signOut();
      clearToken();
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Could not sign out");
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-base-200/40">
        <DashboardSkeleton />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center bg-base-200/40">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="min-h-screen grid place-items-center bg-base-200/40 px-4">
        <div className="card-surface p-8 md:p-10 text-center max-w-md w-full">
          <span className="w-16 h-16 mx-auto rounded-2xl bg-error/15 text-error grid place-items-center mb-4">
            <ShieldAlert size={32} />
          </span>
          <h1 className="text-xl font-heading font-extrabold">Forbidden</h1>
          <p className="text-sm opacity-70 mt-2">
            You are signed in as a <b>{user.role}</b>, so this {expected} area is not accessible for
            your account.
          </p>
          <div className="flex flex-col gap-3 mt-6">
            <Link href={DASHBOARD_HOME[user.role || "customer"]} className="btn btn-primary rounded-xl">
              Go to my dashboard
            </Link>
            <Link href="/" className="btn btn-ghost rounded-xl">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const roleBadge = ROLE_META[user.role || "customer"];

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="h-16 px-5 flex items-center justify-between border-b border-base-300">
        <Logo size="sm" />
        <button
          type="button"
          className="btn btn-ghost btn-circle btn-sm lg:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {menu.map((item) => {
          const active =
            item.href === pathname ||
            (item.href !== `/dashboard/${segment}` && pathname.startsWith(item.href + "/")) ||
            (pathname === item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition",
                active ? "bg-primary/12 text-primary" : "opacity-75 hover:bg-base-200 hover:opacity-100"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
        <div className="divider my-3" />
        <Link
          href="/dashboard/profile"
          className={cn(
            "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition",
            pathname === "/dashboard/profile"
              ? "bg-primary/12 text-primary"
              : "opacity-75 hover:bg-base-200 hover:opacity-100"
          )}
        >
          <UserPen size={18} />
          Update Profile
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold opacity-75 hover:bg-base-200 hover:opacity-100 transition"
        >
          <Home size={18} />
          Back to Home
        </Link>
      </nav>

      <div className="p-3 border-t border-base-300">
        <button
          type="button"
          onClick={signOut}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-error hover:bg-error/10 w-full transition"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-base-200/40">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-base-300 bg-base-100 sticky top-0 h-screen">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-base-100 h-full shadow-2xl animate-fade-up">{sidebar}</div>
          <div className="flex-1 bg-black/40" onClick={() => setDrawerOpen(false)} />
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-16 border-b border-base-300 bg-base-100/90 backdrop-blur flex items-center justify-between gap-3 px-4 lg:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="btn btn-ghost btn-circle btn-sm lg:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider font-bold opacity-55 leading-none">
                FixMate
              </p>
              <p className="font-heading font-bold text-sm md:text-base truncate">
                {LABELS[segment] || LABELS[user.role || "customer"]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="btn btn-ghost btn-sm rounded-lg gap-1.5 hidden sm:inline-flex"
              title="Back to public site"
            >
              <ChevronLeft size={15} /> Home
            </Link>
            <Link href="/dashboard/profile" className="flex items-center gap-2.5 btn btn-ghost px-2 h-11">
              <div className="text-right hidden sm:block leading-tight">
                <p className="text-xs font-bold max-w-[140px] truncate">{user.name}</p>
                <span className={cn("badge badge-xs mt-0.5", roleBadge.className)}>{roleBadge.label}</span>
              </div>
              <Avatar src={user.image} name={user.name} size="sm" />
            </Link>
          </div>
        </header>

        <main className="flex-1 w-full">{children}</main>
      </div>
    </div>
  );
}
