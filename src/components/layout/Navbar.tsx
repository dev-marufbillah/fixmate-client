"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, LayoutDashboard, UserPen, LogOut, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { clearToken } from "@/lib/api";
import { ROLE_META, DASHBOARD_HOME } from "@/lib/constants";
import { useSessionUser } from "@/hooks/use-session-user";
import { Logo } from "./Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "How It Works" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isPending } = useSessionUser();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const signOut = async () => {
    try {
      await authClient.signOut();
      clearToken();
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Could not sign out — try again");
    }
  };

  const linkClass = (href: string) =>
    cn(
      "px-3 py-2 rounded-lg text-sm font-semibold transition",
      (href === "/" ? pathname === "/" : pathname.startsWith(href))
        ? "link-active bg-primary/10"
        : "hover:text-primary"
    );

  const roleBadge = ROLE_META[user?.role || "customer"];

  return (
    <header className="sticky top-0 z-50 border-b border-base-300 glass-navbar">
      <nav className="container-px h-16 flex items-center justify-between gap-4">
        <Logo />

        <ul className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={linkClass(l.href)}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          {isPending ? (
            <span className="skeleton-shimmer w-28 h-9 rounded-lg" />
          ) : !user ? (
            <>
              <Link href="/sign-in" className="btn btn-outline btn-primary btn-sm rounded-lg px-4">
                Sign In
              </Link>
              <Link href="/sign-up" className="btn btn-primary btn-sm rounded-lg px-4">
                Sign Up
              </Link>
            </>
          ) : (
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost h-11 px-2 gap-2 cursor-pointer">
                <Avatar src={user.image} name={user.name} size="sm" />
                <span className="hidden lg:inline text-sm font-semibold max-w-[130px] truncate">
                  {user.name}
                </span>
                <ChevronDown size={14} />
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu z-50 mt-2 w-64 rounded-2xl border border-base-300 bg-base-100 p-2 shadow-xl"
              >
                <li className="px-3 py-2 mb-1 rounded-xl bg-base-200 pointer-events-none menu-title">
                  <p className="font-bold text-sm truncate">{user.name}</p>
                  <span className={cn("badge badge-xs mt-1.5", roleBadge.className)}>{roleBadge.label}</span>
                </li>
                <li>
                  <Link href={DASHBOARD_HOME[user.role || "customer"]} onClick={close}>
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/profile" onClick={close}>
                    <UserPen size={16} /> Update Profile
                  </Link>
                </li>
                <li>
                  <button type="button" onClick={signOut}>
                    <LogOut size={16} /> Sign Out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="flex md:hidden items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Toggle menu"
            className="btn btn-ghost btn-circle btn-sm"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden border-t border-base-300 bg-base-100 px-4 py-4 space-y-1 animate-fade-up">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={close}
              className={cn("block px-3 py-2.5 rounded-lg font-semibold text-sm", linkClass(l.href))}
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-3 mt-2 border-t border-base-300 space-y-2">
            {isPending ? (
              <div className="skeleton-shimmer h-9 w-full rounded-lg" />
            ) : !user ? (
              <div className="flex gap-2">
                <Link href="/sign-in" onClick={close} className="btn btn-outline btn-primary flex-1 rounded-lg">
                  Sign In
                </Link>
                <Link href="/sign-up" onClick={close} className="btn btn-primary flex-1 rounded-lg">
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-2 py-2">
                  <Avatar src={user.image} name={user.name} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{user.name}</p>
                    <span className={cn("badge badge-xs mt-1", roleBadge.className)}>{roleBadge.label}</span>
                  </div>
                </div>
                <Link
                  href={DASHBOARD_HOME[user.role || "customer"]}
                  onClick={close}
                  className="block px-3 py-2.5 rounded-lg text-sm font-semibold"
                >
                  Dashboard
                </Link>
                <Link href="/dashboard/profile" onClick={close} className="block px-3 py-2.5 rounded-lg text-sm font-semibold">
                  Update Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    close();
                    signOut();
                  }}
                  className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-error"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
