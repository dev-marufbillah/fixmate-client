"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { Wrench } from "lucide-react";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  icon,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: ReactNode;
}) {
  return (
    <div className="card-surface py-14 px-6 text-center">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-base-200 grid place-items-center text-primary mb-4">
        {icon || <Wrench size={30} />}
      </div>
      <h3 className="page-h3 mb-1">{title}</h3>
      <p className="text-sm opacity-70 max-w-md mx-auto mb-6">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn btn-primary rounded-xl px-6">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="btn btn-primary rounded-xl px-6">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
