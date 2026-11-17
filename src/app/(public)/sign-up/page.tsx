import type { Metadata } from "next";
import { SignUpFormWrapper } from "@/components/auth/SignUpForm";
import { Logo } from "@/components/layout/Logo";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a FixMate account as a customer or technician.",
};

export default function SignUpPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-primary/8 via-base-100 to-secondary/8 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>
        <div className="card-surface p-7 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-heading font-extrabold">Create your account</h1>
            <p className="text-sm opacity-70 mt-1.5">Join FixMate as a customer or technician — free.</p>
          </div>
          <SignUpFormWrapper />
        </div>
      </div>
    </div>
  );
}
