import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Server-side pagination — links preserve every active filter (Challenge 1 + optional 4). */
export function Pagination({
  page,
  pages,
  query,
}: {
  page: number;
  pages: number;
  query: Record<string, string | undefined>;
}) {
  if (pages <= 1) return null;

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) if (v) params.set(k, v);
    if (p > 1) params.set("page", String(p));
    else params.delete("page");
    const qs = params.toString();
    return qs ? `/services?${qs}` : "/services";
  };

  const windowed: number[] = [];
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  const end = Math.min(pages, start + 4);
  for (let p = start; p <= end; p++) windowed.push(p);

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-10" aria-label="Pagination">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn("btn btn-sm rounded-lg", page === 1 && "btn-disabled pointer-events-none")}
      >
        <ChevronLeft size={15} /> Previous
      </Link>
      {windowed.map((p) => (
        <Link
          key={p}
          href={hrefFor(p)}
          className={cn(
            "btn btn-sm btn-circle rounded-lg",
            p === page ? "btn-primary" : "btn-ghost border border-base-300"
          )}
        >
          {p}
        </Link>
      ))}
      <Link
        href={hrefFor(Math.min(pages, page + 1))}
        aria-disabled={page === pages}
        className={cn("btn btn-sm rounded-lg", page === pages && "btn-disabled pointer-events-none")}
      >
        Next <ChevronRight size={15} />
      </Link>
    </nav>
  );
}
