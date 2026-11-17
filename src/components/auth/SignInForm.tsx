"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { DASHBOARD_HOME } from "@/lib/constants";
import { clearToken } from "@/lib/api";
import { useSessionUser } from "@/hooks/use-session-user";
import { cn } from "@/lib/utils";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const safeRedirect =
    redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : null;

  const { user, isPending } = useSessionUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);

  // Already signed in → go to own dashboard (or requested page)
  useEffect(() => {
    if (!isPending && user) {
      router.replace(safeRedirect || DASHBOARD_HOME[user.role || "customer"]);
    }
  }, [isPending, user, router, safeRedirect]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const formValid = emailValid && password.length > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!formValid || busy) return;
    setBusy(true);
    clearToken();
    try {
      const { error } = await authClient.signIn.email({ email: email.trim(), password });
      if (error) {
        toast.error(error.message || "Invalid email or password");
        setBusy(false);
        return;
      }
      toast.success("Signed in successfully");
      // Resolve role for the correct dashboard redirect
      let target = safeRedirect;
      if (!target) {
        try {
          const res = await authClient.getSession();
          const role = (res?.data as { user?: { role?: string } } | undefined)?.user?.role;
          target = DASHBOARD_HOME[(role as "customer") || "customer"] || "/dashboard/customer";
        } catch {
          target = "/dashboard/customer";
        }
      }
      router.push(target);
      router.refresh();
    } catch {
      toast.error("Something went wrong — please try again");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className="label-text text-xs font-semibold mb-1.5 block">Email</label>
        <input
          type="email"
          className={cn("input input-bordered rounded-xl w-full", touched && !emailValid && "input-error")}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {touched && !emailValid && <p className="text-xs text-error mt-1">Enter a valid email address</p>}
      </div>

      <div>
        <label className="label-text text-xs font-semibold mb-1.5 block">Password</label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            className={cn("input input-bordered rounded-xl w-full pr-11", touched && !password && "input-error")}
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
            onClick={() => setShowPw((s) => !s)}
            aria-label="Toggle password visibility"
          >
            {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        {touched && !password && <p className="text-xs text-error mt-1">Password is required</p>}
      </div>

      <button type="submit" disabled={busy} className="btn btn-primary rounded-xl w-full h-11 font-semibold">
        {busy ? <span className="loading loading-spinner loading-sm" /> : null}
        Sign In
      </button>

      <p className="text-sm text-center opacity-75">
        New to FixMate?{" "}
        <Link
          href={`/sign-up${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
          className="font-semibold text-primary"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function SignInFormWrapper() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
