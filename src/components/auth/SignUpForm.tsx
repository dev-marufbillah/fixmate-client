"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { Check, X, Eye, EyeOff, User, Wrench } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { SocialButtons } from "./SocialButtons";
import { DASHBOARD_HOME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Role } from "@/lib/types";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("customer");
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const rules = {
    len: password.length >= 6,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
  };
  const passwordValid = rules.len && rules.upper && rules.lower;
  const formValid = name.trim().length >= 2 && emailValid && passwordValid;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!formValid || busy) return;
    setBusy(true);
    try {
      const { error } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        // role is a BetterAuth additionalField — typed via assertion because the
        // client is created without the server config (types-only concern).
        role,
      } as unknown as Parameters<typeof authClient.signUp.email>[0]);
      if (error) {
        toast.error(error.message || "Could not create the account");
        setBusy(false);
        return;
      }
      toast.success("Welcome to FixMate! Your account is ready 🎉");
      const target =
        redirect && redirect.startsWith("/") && !redirect.startsWith("//")
          ? redirect
          : DASHBOARD_HOME[role];
      router.push(target);
      router.refresh();
    } catch {
      toast.error("Something went wrong — please try again");
      setBusy(false);
    }
  };

  const ruleRow = (ok: boolean, label: string) => (
    <li className={cn("inline-flex items-center gap-1.5 text-xs", ok ? "text-success" : "opacity-60")}>
      {ok ? <Check size={13} /> : <X size={13} className="opacity-50" />}
      {label}
    </li>
  );

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className="label-text text-xs font-semibold mb-1.5 block">Full name</label>
        <input
          className={cn("input input-bordered rounded-xl w-full", touched && name.trim().length < 2 && "input-error")}
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {touched && name.trim().length < 2 && <p className="text-xs text-error mt-1">Name is required</p>}
      </div>

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
            className={cn("input input-bordered rounded-xl w-full pr-11", touched && !passwordValid && "input-error")}
            placeholder="Create a password"
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
        <ul className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {ruleRow(rules.len, "At least 6 characters")}
          {ruleRow(rules.upper, "One uppercase letter")}
          {ruleRow(rules.lower, "One lowercase letter")}
        </ul>
      </div>

      <div>
        <label className="label-text text-xs font-semibold mb-2 block">I want to join as</label>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { value: "customer", title: "Customer", desc: "Book repairs", icon: <User size={20} /> },
              { value: "technician", title: "Technician", desc: "Offer services", icon: <Wrench size={20} /> },
            ] as const
          ).map((opt) => (
            <label
              key={opt.value}
              className={cn(
                "cursor-pointer card-surface p-4 text-center transition hover:border-primary/50",
                role === opt.value && "border-primary ring-2 ring-primary/30 bg-primary/5"
              )}
            >
              <input
                type="radio"
                name="role"
                className="sr-only"
                checked={role === opt.value}
                onChange={() => setRole(opt.value as Role)}
              />
              <span
                className={cn(
                  "w-10 h-10 rounded-xl mx-auto grid place-items-center mb-2",
                  role === opt.value ? "bg-primary text-primary-content" : "bg-base-200 text-primary"
                )}
              >
                {opt.icon}
              </span>
              <p className="font-bold text-sm">{opt.title}</p>
              <p className="text-[11px] opacity-65">{opt.desc}</p>
            </label>
          ))}
        </div>
        <p className="text-[11px] opacity-60 mt-2">Admin accounts cannot be self-registered.</p>
      </div>

      <button type="submit" disabled={busy || (touched && !formValid)} className="btn btn-primary rounded-xl w-full h-11 font-semibold">
        {busy ? <span className="loading loading-spinner loading-sm" /> : null}
        Create account
      </button>

      <SocialButtons
        callbackURL={
          redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/dashboard"
        }
      />

      <p className="text-sm text-center opacity-75">
        Already have an account?{" "}
        <Link
          href={`/sign-in${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
          className="font-semibold text-primary"
        >
          Sign In
        </Link>
      </p>
    </form>
  );
}

export function SignUpFormWrapper() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
