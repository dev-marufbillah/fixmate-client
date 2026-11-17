"use client";

import { initials } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function Avatar({
  src,
  name,
  size = "md",
}: {
  src?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const cls =
    size === "lg"
      ? "w-20 h-20 text-xl"
      : size === "md"
        ? "w-10 h-10 text-sm"
        : size === "sm"
          ? "w-8 h-8 text-xs"
          : "w-6 h-6 text-[10px]";
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={name || "avatar"}
        className={cn(cls, "rounded-full object-cover ring-2 ring-base-300 bg-base-200")}
      />
    );
  }
  return (
    <span
      className={cn(
        cls,
        "rounded-full bg-primary/15 text-primary font-bold grid place-items-center ring-2 ring-base-300 select-none"
      )}
    >
      {initials(name)}
    </span>
  );
}
