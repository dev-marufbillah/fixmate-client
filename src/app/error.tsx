"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[70vh] grid place-items-center px-4 py-16">
      <div className="text-center max-w-md">
        <span className="w-20 h-20 mx-auto rounded-2xl bg-error/15 text-error grid place-items-center mb-5">
          <AlertTriangle size={40} />
        </span>
        <h1 className="page-h1 text-3xl md:text-4xl mb-3">Something broke</h1>
        <p className="opacity-70 mb-3 leading-relaxed">
          An unexpected error interrupted this page — probably a hiccup while talking to our servers.
          No worries, your data is safe.
        </p>
        {error?.digest && (
          <p className="font-mono text-[11px] opacity-50 mb-6">Reference: {error.digest}</p>
        )}
        <button type="button" onClick={reset} className="btn btn-primary rounded-xl px-7 h-11 font-semibold gap-2">
          <RotateCcw size={16} /> Try again
        </button>
      </div>
    </div>
  );
}
