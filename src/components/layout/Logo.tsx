import Link from "next/link";
import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ size = "md", href = "/" }: { size?: "sm" | "md" | "lg"; href?: string }) {
  const tile = size === "lg" ? "w-11 h-11" : size === "sm" ? "w-8 h-8" : "w-9 h-9";
  const icon = size === "lg" ? 24 : size === "sm" ? 16 : 18;
  const text = size === "lg" ? "text-2xl" : "text-xl";
  return (
    <Link href={href} className="flex items-center gap-2.5 group">
      <span
        className={cn(
          tile,
          "rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center text-white shadow-sm group-hover:shadow-md transition"
        )}
      >
        <Wrench size={icon} strokeWidth={2.4} />
      </span>
      <span className={cn("font-heading font-extrabold tracking-tight", text)}>
        Fix<span className="text-primary">Mate</span>
      </span>
    </Link>
  );
}
